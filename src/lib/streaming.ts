/**
 * Utility for handling streaming responses from chat API
 */

import { removeApiKey, requestAuthRefresh } from '@/lib/api';

export interface StreamChunk {
  content?: string;
  reasoning?: string;
  done?: boolean;
  status?: 'rate_limit_retry';
  retryAfterMs?: number;
}

// Helper function to wait/sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function* streamChatResponse(
  url: string,
  apiKey: string,
  requestBody: Record<string, unknown>,
  retryCount = 0,
  maxRetries = 5
): AsyncGenerator<StreamChunk> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Log full error details for debugging
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url
    });

    // Handle specific error cases with helpful messages
    if (response.status === 403) {
      throw new Error(
        errorData.detail || errorData.error?.message ||
        'API key validation failed. Your session may need to refresh. Please try logging out and back in.'
      );
    }

    // Handle 500 Internal Server Error
    if (response.status === 500) {
      const errorMessage = errorData.detail || errorData.error?.message || errorData.message || 'Internal server error';
      console.error('500 Internal Server Error details:', errorData);
      throw new Error(
        `Server error: ${errorMessage}. Please try again or contact support if the issue persists.`
      );
    }

    // Handle 404 Model Not Found
    if (response.status === 404) {
      const errorMessage = errorData.detail || errorData.error?.message || errorData.message || 'Model not found';
      console.error('404 Model Not Found details:', errorData);
      throw new Error(
        `Model not found: ${errorMessage}`
      );
    }

    if (response.status === 429) {
      const detailMessage: string =
        (typeof errorData.detail === 'string' && errorData.detail) ||
        (typeof errorData.message === 'string' && errorData.message) ||
        (typeof errorData.error?.message === 'string' && errorData.error?.message) ||
        '';

      // Retry with exponential backoff for rate limits
      if (retryCount < maxRetries) {
        const retryAfterHeader = response.headers.get('retry-after');
        const isConcurrencyLimit = detailMessage.toLowerCase().includes('concurrency');
        const baseDelay = isConcurrencyLimit ? 4000 : 1000;
        const maxDelay = isConcurrencyLimit ? 20000 : 8000;

        let waitTime = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);

        if (retryAfterHeader) {
          const numericRetry = Number(retryAfterHeader);
          if (!Number.isNaN(numericRetry) && numericRetry > 0) {
            waitTime = Math.max(waitTime, numericRetry * 1000);
          } else {
            const retryDate = Date.parse(retryAfterHeader);
            if (!Number.isNaN(retryDate)) {
              const headerWait = retryDate - Date.now();
              if (headerWait > 0) {
                waitTime = Math.max(waitTime, headerWait);
              }
            }
          }
        }

        waitTime = Math.max(waitTime, 1000); // Ensure a minimum delay
        const jitter = Math.floor(Math.random() * 250);
        waitTime += jitter;

        console.log(`Rate limit hit, retrying in ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})...`);
        if (detailMessage) {
          console.log('Rate limit detail:', detailMessage);
        }

        // Yield a signal chunk so UI can react without showing text in the transcript
        yield {
          status: 'rate_limit_retry',
          retryAfterMs: waitTime
        };

        await sleep(waitTime);

        // Recursive retry
        yield* streamChatResponse(url, apiKey, requestBody, retryCount + 1, maxRetries);
        return;
      }

      removeApiKey();
      requestAuthRefresh();
      throw new Error(
        detailMessage ||
        'Rate limit exceeded. Please wait a moment and try again.'
      );
    }

    if (response.status === 401) {
      removeApiKey();
      requestAuthRefresh();
      throw new Error(
        'Authentication failed. Please check your API key or log in again.'
      );
    }

    // Generic error with the response message
    throw new Error(
      errorData.error?.message ||
      errorData.detail ||
      `Request failed with status ${response.status}`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine === 'data: [DONE]') {
          continue;
        }

        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6);
            const data = JSON.parse(jsonStr);

            let chunk: StreamChunk | null = null;

            // Handle backend response format with "output" array
            const output = data.output?.[0];
            if (output && typeof output === 'object') {
              chunk = {};
              if (output.content) {
                chunk.content = output.content;
              }
              if (output.reasoning) {
                chunk.reasoning = output.reasoning;
              }
              if (output.finish_reason) {
                chunk.done = true;
              }
            }
            // Handle OpenAI-style "choices" format
            else {
              const choice = data.choices?.[0];

              if (choice?.delta) {
                const delta = choice.delta;
                chunk = {};
                if (delta.content) {
                  chunk.content = delta.content;
                }
                if (delta.reasoning) {
                  chunk.reasoning = delta.reasoning;
                }
                if (choice.finish_reason) {
                  chunk.done = true;
                }
              } else if (choice?.finish_reason) {
                chunk = { done: true };
              }
            }

            // Handle event-based streaming formats
            if (!chunk && typeof data.type === 'string') {
              const eventType = data.type;
              switch (eventType) {
                case 'response.output_text.delta': {
                  const delta = data.delta;
                  const deltaText =
                    typeof delta === 'string'
                      ? delta
                      : typeof delta?.text === 'string'
                        ? delta.text
                        : '';
                  const reasoningText =
                    typeof delta === 'object' && typeof delta?.reasoning === 'string'
                      ? delta.reasoning
                      : undefined;
                  if (deltaText || reasoningText) {
                    chunk = {};
                    if (deltaText) {
                      chunk.content = deltaText;
                    }
                    if (reasoningText) {
                      chunk.reasoning = reasoningText;
                    }
                  }
                  break;
                }
                case 'response.reasoning.delta':
                case 'response.output_reasoning.delta':
                case 'response.reflection.delta': {
                  const reasoningText =
                    typeof data.delta === 'string'
                      ? data.delta
                      : typeof data.delta?.text === 'string'
                        ? data.delta.text
                        : undefined;
                  if (reasoningText) {
                    chunk = { reasoning: reasoningText };
                  }
                  break;
                }
                case 'response.output_text.done':
                case 'response.completed':
                case 'response.message.completed':
                case 'response.stop':
                  chunk = { done: true };
                  break;
                case 'response.error': {
                  const errorMessage =
                    (typeof data.error?.message === 'string' && data.error.message) ||
                    (typeof data.message === 'string' && data.message) ||
                    'Response stream error';
                  throw new Error(errorMessage);
                }
                default:
                  break;
              }
            }

            if (chunk) {
              yield chunk;
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error, trimmedLine);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

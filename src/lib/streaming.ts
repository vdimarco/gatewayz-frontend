/**
 * Utility for handling streaming responses from chat API
 */

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
  model: string,
  messages: any[],
  portkeyProvider?: string,
  retryCount = 0,
  maxRetries = 3
): AsyncGenerator<StreamChunk> {
  const requestBody: any = {
    model,
    messages,
    stream: true,
  };

  // Add portkey_provider if specified (required for DeepInfra and other providers)
  if (portkeyProvider) {
    requestBody.portkey_provider = portkeyProvider;
  }

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

    // Handle specific error cases with helpful messages
    if (response.status === 403) {
      throw new Error(
        errorData.detail || errorData.error?.message ||
        'API key validation failed. Your session may need to refresh. Please try logging out and back in.'
      );
    }

    if (response.status === 429) {
      // Retry with exponential backoff for rate limits
      if (retryCount < maxRetries) {
        const retryAfterHeader = response.headers.get('retry-after');
        let waitTime = Math.min(1000 * Math.pow(2, retryCount), 8000); // Fallback cap

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

        // Yield a signal chunk so UI can react without showing text in the transcript
        yield {
          status: 'rate_limit_retry',
          retryAfterMs: waitTime
        };

        await sleep(waitTime);

        // Recursive retry
        yield* streamChatResponse(url, apiKey, model, messages, portkeyProvider, retryCount + 1, maxRetries);
        return;
      }

      throw new Error(
        errorData.detail || errorData.error?.message ||
        'Rate limit exceeded. Please wait a moment and try again.'
      );
    }

    if (response.status === 401) {
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

            const delta = data.choices?.[0]?.delta;
            if (!delta) continue;

            const chunk: StreamChunk = {};

            // Handle content
            if (delta.content) {
              chunk.content = delta.content;
            }

            // Handle reasoning (for models that support it)
            if (delta.reasoning) {
              chunk.reasoning = delta.reasoning;
            }

            // Check if this is the last chunk
            if (data.choices?.[0]?.finish_reason) {
              chunk.done = true;
            }

            yield chunk;
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

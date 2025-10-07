/**
 * Utility for handling streaming responses from chat API
 */

export interface StreamChunk {
  content?: string;
  reasoning?: string;
  done?: boolean;
}

export async function* streamChatResponse(
  url: string,
  apiKey: string,
  model: string,
  messages: any[]
): AsyncGenerator<StreamChunk> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
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

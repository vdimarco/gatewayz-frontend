export async function streamChat({
  modelName,
  prompt,
  apiKey,
  onContent,
  onReasoning,
  onComplete,
  onError,
}: {
  modelName: string;
  prompt: string;
  apiKey: string;
  onContent?: (content: string) => void;
  onReasoning?: (reasoning: string) => void;
  onComplete?: (fullContent: string, fullReasoning?: string) => void;
  onError?: (error: Error) => void;
}) {
  try {
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const apiUrl = `${protocol}://${host}/api/chat`;

    console.log('[StreamChat] Starting stream request:', { modelName, apiUrl });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        message: prompt,
        apiKey,
      }),
    });

    console.log('[StreamChat] Response received:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      ok: response.ok
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let fullReasoning = '';

    console.log('[StreamChat] Starting to read stream...');

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('[StreamChat] Stream ended');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      console.log('[StreamChat] Raw chunk received:', chunk.substring(0, 100));
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        console.log('[StreamChat] Processing line:', line.substring(0, 50));
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'reasoning' && parsed.content) {
              fullReasoning += parsed.content;
              console.log('[StreamChat] Reasoning chunk:', parsed.content);
              onReasoning?.(fullReasoning);
            } else if (parsed.type === 'content' && parsed.content) {
              fullContent += parsed.content;
              console.log('[StreamChat] Content chunk:', parsed.content);
              onContent?.(fullContent);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }

    onComplete?.(fullContent, fullReasoning || undefined);
    return { content: fullContent, reasoning: fullReasoning || undefined };
  } catch (error) {
    console.error('Stream error:', error);
    const err = error instanceof Error ? error : new Error('Unknown error');
    onError?.(err);
    throw err;
  }
}

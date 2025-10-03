import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, message, apiKey } = body;

    console.log('Chat API route - Request:', { model, hasMessage: !!message, hasApiKey: !!apiKey });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    const url = `${API_BASE_URL}/v1/chat/completions`;
    console.log(`Chat API route - Calling: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model === 'gpt-4o mini' ? 'deepseek/deepseek-chat' : model,
        messages: [{ role: 'user', content: message }],
      }),
    });

    console.log(`Chat API route - Response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Chat API route - Backend error:`, errorText);

      return NextResponse.json(
        { error: `Backend API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Chat API route - Success!');

    // Extract message from OpenAI format
    const content = data.choices?.[0]?.message?.content ||
                   data.response ||
                   data.message ||
                   data.content ||
                   'No response';

    return NextResponse.json({ response: content });
  } catch (error) {
    console.error('Chat API route - Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

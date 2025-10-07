import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_CHAT_HISTORY_API_URL || 'https://api.gatewayz.ai';

// POST /api/chat/sessions/[id]/messages - Save message to session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, content, model, tokens } = body;
    
    // Clean the session ID (remove 'api-' prefix if present)
    const cleanSessionId = id.startsWith('api-') ? id.replace('api-', '') : id;
    
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      );
    }

    const messageData = {
      role: role,
      content: content,
      model: model || '',
      tokens: tokens || 0,
      created_at: new Date().toISOString()
    };

    const url = `${API_BASE_URL}/v1/chat/sessions/${cleanSessionId}/messages`;

    console.log(`Chat messages API - Saving message to: ${url}`);
    console.log(`Chat messages API - Content length: ${content.length} chars`);
    console.log(`Chat messages API - API Key:`, apiKey ? `${apiKey.substring(0, 10)}...` : 'None');
    console.log(`Chat messages API - Session ID: ${id} (cleaned: ${cleanSessionId})`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    console.log(`Chat messages API - Response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`Chat messages API - Backend error:`, error);
      console.error(`Chat messages API - Response status: ${response.status}`);
      console.error(`Chat messages API - Full error details:`, JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: error.detail || 'Failed to save message' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

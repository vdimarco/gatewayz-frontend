import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, userEmail, userId, apiKey } = await req.json();

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Call backend to create checkout session
    // Backend will create payment record and properly format metadata
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.gatewayz.ai';

    // Get the frontend URL - prioritize NEXT_PUBLIC_BASE_URL, fallback to VERCEL_URL
    const frontendUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                        'https://beta.gatewayz.ai';

    const requestBody = {
      amount: amount * 100, // Convert dollars to cents
      currency: 'usd',
      description: `${amount} credits for Gatewayz AI platform`,
      customer_email: userEmail,
      success_url: `${frontendUrl}/settings/credits?session_id={{CHECKOUT_SESSION_ID}}`,
      cancel_url: `${frontendUrl}/settings/credits`,
    };

    console.log('[Checkout API] Frontend URL:', frontendUrl);
    console.log('[Checkout API] Success URL:', requestBody.success_url);

    console.log('[Checkout API] Calling backend checkout:', backendUrl);
    console.log('[Checkout API] Request body:', JSON.stringify(requestBody));
    console.log('[Checkout API] API key starts with:', apiKey?.substring(0, 7) || 'undefined');

    const response = await fetch(`${backendUrl}/api/stripe/checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Checkout API] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Checkout API] Backend checkout error (raw):', errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { detail: errorText };
      }

      console.error('[Checkout API] Backend checkout error (parsed):', error);
      return NextResponse.json(
        { error: error.detail || error.message || 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    const session = await response.json();
    console.log('[Checkout API] Session created successfully:', session.session_id);
    return NextResponse.json({ sessionId: session.session_id, url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

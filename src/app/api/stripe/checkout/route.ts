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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://beta.gatewayz.ai';
    const requestBody = {
      amount: amount * 100, // Convert dollars to cents
      currency: 'usd',
      description: `${amount} credits for Gatewayz AI platform`,
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/settings/credits?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/settings/credits`,
    };

    console.log('Calling backend checkout:', backendUrl);
    console.log('Request body:', requestBody);
    console.log('API key starts with:', apiKey.substring(0, 7));

    const response = await fetch(`${backendUrl}/api/stripe/checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend checkout error:', error);
      return NextResponse.json(
        { error: error.detail || 'Failed to create checkout session' },
        { status: response.status }
      );
    }

    const session = await response.json();
    return NextResponse.json({ sessionId: session.session_id, url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

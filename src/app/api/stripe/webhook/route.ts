import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe is not fully configured');
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('Checkout session completed:', {
        sessionId: session.id,
        customerId: session.customer,
        metadata: session.metadata,
      });

      // Get the amount of credits and user info from metadata
      const credits = session.metadata?.credits;
      const userId = session.metadata?.userId;
      const userEmail = session.metadata?.userEmail || session.customer_email || session.customer_details?.email;

      if (!credits) {
        console.error('No credits found in session metadata');
        return NextResponse.json(
          { error: 'No credits in metadata' },
          { status: 400 }
        );
      }

      if (!userId && !userEmail) {
        console.error('No user ID or email found in session');
        return NextResponse.json(
          { error: 'No user identification' },
          { status: 400 }
        );
      }

      console.log(`Crediting ${credits} credits to user ${userId || userEmail}`);

      try {
        // Call your backend API to credit the user
        const response = await fetch(`${API_BASE_URL}/user/credits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId ? parseInt(userId) : undefined,
            email: userEmail,
            credits: parseInt(credits),
            transaction_type: 'purchase',
            description: `Stripe payment - ${credits} credits`,
            stripe_session_id: session.id,
            amount: session.amount_total ? session.amount_total / 100 : undefined, // Convert cents to dollars
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to credit user:', errorText);
          throw new Error('Failed to credit user');
        }

        const result = await response.json();
        console.log('Successfully processed payment and credited user:', result);
      } catch (error) {
        console.error('Error crediting user:', error);
        // Log the error but return success to Stripe to prevent retries
        // You can manually credit the user later by checking Stripe dashboard
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getApiKey } from './api';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export const redirectToCheckout = async (amount: number, userEmail?: string, userId?: number) => {
  try {
    // Get API key from localStorage
    const apiKey = getApiKey();

    console.log('Checkout - API key exists:', !!apiKey);
    console.log('Checkout - Amount:', amount);
    console.log('Checkout - User email:', userEmail);
    console.log('Checkout - User ID:', userId);

    if (!apiKey) {
      throw new Error('You must be logged in to purchase credits');
    }

    // Create checkout session
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        userEmail,
        userId,
        apiKey, // Pass API key to the route handler
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stripe checkout error response:', errorData);
      console.error('Response status:', response.status);
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

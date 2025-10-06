"use client";

import { useState } from 'react';
import { redirectToCheckout } from '@/lib/stripe';
import { getUserData } from '@/lib/auth';

export function GetCreditsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Get user data for checkout
      const userData = getUserData();

      // Default to $10 worth of credits
      await redirectToCheckout(10, userData?.email, userData?.user_id);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="relative px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-purple-400/30 shadow-md hover:shadow-lg hover:shadow-purple-500/30"
    >
      <span className="relative z-10">{isLoading ? 'Loading...' : 'Get Credits'}</span>
    </button>
  );
}

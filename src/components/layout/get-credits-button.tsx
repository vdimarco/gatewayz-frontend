"use client";

import { useState } from 'react';
import { redirectToCheckout } from '@/lib/stripe';

export function GetCreditsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Default to $10 worth of credits
      await redirectToCheckout(10);
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
      className="relative px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="relative z-10">{isLoading ? 'Loading...' : 'Get Credits'}</span>
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
    </button>
  );
}

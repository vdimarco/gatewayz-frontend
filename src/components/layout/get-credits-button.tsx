"use client";

import { useState } from 'react';
import { redirectToCheckout } from '@/lib/stripe';
import { getUserData } from '@/lib/api';

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
    <div className="relative group">
      {/* Outer glow border effect */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-400/60 via-blue-400/60 to-cyan-400/60 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Main button container with subtle border */}
      <div className="relative rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-cyan-400/20 p-[1px]">
        {/* Inner button */}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="relative w-full px-6 py-2.5 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group-hover:shadow-xl"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span className="text-gray-600 font-semibold">Loading...</span>
              </>
            ) : (
              <>
                <span className="text-[#4A7B9D] font-semibold tracking-wide uppercase text-sm">
                  Get Credits
                </span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

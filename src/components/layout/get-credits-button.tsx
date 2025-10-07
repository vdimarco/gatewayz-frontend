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
      {/* Shimmering gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-300 animate-gradient-shimmer"></div>

      {/* Button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="relative px-5 py-2 bg-black text-white font-medium rounded-lg transition-all duration-300 hover:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                Get Credits
              </span>
              <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </span>
      </button>

      <style jsx>{`
        @keyframes gradient-shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-shimmer {
          background-size: 200% 200%;
          animation: gradient-shimmer 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

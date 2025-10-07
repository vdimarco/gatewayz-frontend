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
    <>
      <div className="relative group inline-block">
        {/* Multi-layered LED-style glow with color shifting */}
        <div className="absolute -inset-[3px] rounded-lg opacity-90 blur-md animate-led-shimmer"></div>
        <div className="absolute -inset-[2px] rounded-lg opacity-80 blur-sm animate-led-shimmer" style={{ animationDelay: '0.5s' }}></div>

        {/* Elevated neon border - visible underneath */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-100 animate-led-shimmer" style={{ top: '2px' }}></div>

        {/* Button with elevation effect */}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="relative bg-black hover:bg-gray-900 text-white h-10 px-6 rounded-lg font-semibold transition-all duration-200 active:translate-y-[2px] active:shadow-none shadow-[0_2px_0_0_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                <span className="text-white font-semibold">Loading...</span>
              </>
            ) : (
              <span className="text-white font-semibold tracking-wide uppercase text-sm">
                Get Credits
              </span>
            )}
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes led-shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-led-shimmer {
          background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4, #3b82f6);
          background-size: 200% 200%;
          animation: led-shimmer 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

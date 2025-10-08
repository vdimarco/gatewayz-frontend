"use client";

import { useState } from 'react';
import { redirectToCheckout } from '@/lib/stripe';
import { getUserData } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GetCreditsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [amount, setAmount] = useState('10');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if (amountNum < 1) {
      alert('Minimum purchase amount is $1');
      return;
    }

    setIsLoading(true);
    setShowDialog(false);

    try {
      // Get user data for checkout
      const userData = getUserData();
      await redirectToCheckout(amountNum, userData?.email, userData?.user_id);
    } catch (error) {
      console.log('Checkout error:', error);
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
          className="relative bg-black hover:bg-gray-900 text-white h-10 px-3 sm:px-6 rounded-lg font-semibold transition-all duration-200 active:translate-y-[2px] active:shadow-none shadow-[0_2px_0_0_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                <span className="text-white font-semibold text-xs sm:text-sm">Loading...</span>
              </>
            ) : (
              <span className="text-white font-semibold tracking-tight sm:tracking-wide uppercase text-xs sm:text-sm whitespace-nowrap">
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to add to your account. Minimum purchase is $1.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirm();
                    }
                  }}
                  className="pl-7"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
            >
              Continue to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

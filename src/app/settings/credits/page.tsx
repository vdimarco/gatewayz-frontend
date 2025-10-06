
"use client";

/**
 * Credits Page - Reusable Data Table Implementation
 * 
 * This page demonstrates how to create a reusable data table using mock data.
 * To use with real data:
 * 1. Replace mockTransactions with your actual data source (API call, props, etc.)
 * 2. Update the Transaction interface if your data structure differs
 * 3. The TransactionRow component will automatically render all transactions
 * 4. Add loading states, error handling, and pagination as needed
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, RefreshCw, ArrowUpRight, ChevronLeft, ChevronRight, CreditCard, MoreHorizontal, CheckCircle } from "lucide-react";
import Link from "next/link";
import { redirectToCheckout } from '@/lib/stripe';
import { getUserData, makeAuthenticatedRequest } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';

// Transaction data type
interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  created_at: string;
  description?: string;
  status?: string;
}

// Reusable TransactionRow component
const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const handleMoreClick = () => {
    // Handle more options click
    console.log('More options clicked for transaction:', transaction.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTransactionType = (type: string) => {
    if (type.toLowerCase().includes('purchase') || type.toLowerCase().includes('deposit')) {
      return 'Purchase';
    } else if (type.toLowerCase().includes('usage') || type.toLowerCase().includes('spend')) {
      return 'Usage';
    } else if (type.toLowerCase().includes('refund')) {
      return 'Refund';
    }
    return type;
  };

  return (
    <div className="px-4 py-3 hover:bg-gray-50">
      <div className="grid grid-cols-4 gap-4 items-center text-sm">
        <div className="font-medium">
          {getTransactionType(transaction.transaction_type)}
          {transaction.description && (
            <span className="text-muted-foreground ml-2">- {transaction.description}</span>
          )}
        </div>
        <div className="font-medium">
          {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
        </div>
        <div className="font-medium">{formatDate(transaction.created_at)}</div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleMoreClick}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Component that uses useSearchParams - must be wrapped in Suspense
function CreditsPageContent() {
  const searchParams = useSearchParams();
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success message from Stripe redirect
  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    if (sessionId) {
      setShowSuccessMessage(true);
      // Auto-hide after 10 seconds
      setTimeout(() => setShowSuccessMessage(false), 10000);

      // Clean up URL
      window.history.replaceState({}, '', '/settings/credits');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      // First try to get credits from local storage immediately
      const userData = getUserData();
      if (userData && userData.credits !== undefined) {
        setCredits(userData.credits);
        setLoadingCredits(false);
      }

      // Wait a bit for authentication to complete if no user data yet
      if (!userData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      try {
        // Fetch fresh data from API
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/user/profile`);
        if (response.ok) {
          const data = await response.json();
          if (data.credits !== undefined) {
            setCredits(data.credits);
          }
        }
      } catch (error) {
        // Silently handle error - we already have local storage data
        console.log('Could not fetch fresh credits data');
      } finally {
        setLoadingCredits(false);
      }

      // Fetch transactions (payment history)
      try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/stripe/payments?limit=10`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.payments)) {
            // Map payment data to transaction format
            const mappedTransactions = data.payments.map((payment: any) => ({
              id: payment.id,
              amount: payment.amount,
              transaction_type: payment.status === 'completed' ? 'Purchase' : payment.status,
              created_at: payment.created_at,
              description: `Payment ${payment.status}`,
              status: payment.status
            }));
            setTransactions(mappedTransactions);
          }
        }
      } catch (error) {
        console.log('Could not fetch transactions');
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchData();
  }, []);

  const handleBuyCredits = async () => {
    setIsLoading(true);
    try {
      // Default to $10 worth of credits - can be customized
      await redirectToCheckout(10);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center ">
        <h1 className="text-3xl font-bold">Credits</h1>
        {/* <Button variant="ghost" size="icon" className="text-muted-foreground">
          <RefreshCw className="h-5 w-5" />
        </Button> */}
      </div>

      {/* Success message after Stripe payment */}
      {showSuccessMessage && (
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">Payment successful!</p>
              <p className="text-sm text-green-700 dark:text-green-300">Your credits have been added to your account.</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mr-16">Available Balance</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-16">
              <Card
                className="w-96 h-14 text-xl md:text-2xl font-semibold bg-gray-50 border-gray-200 px-12"
              >
                <CardContent className="py-[13px] flex items-center justify-center">
                  {loadingCredits ? (
                    <span className="text-xl md:text-2xl font-bold text-muted-foreground">Loading...</span>
                  ) : credits !== null ? (
                    <span className="text-xl md:text-2xl font-bold">${credits.toFixed(2)}</span>
                  ) : (
                    <span className="text-xl md:text-2xl font-bold text-muted-foreground">$0.00</span>
                  )}
                </CardContent>
              </Card>
            </div>
            <Button
              className="bg-black text-white h-12 px-20"
              onClick={handleBuyCredits}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Buy Credits'}
            </Button>
          </div>
        </div>  
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl"> */}
        {/* <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Buy Credits</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span>Use crypto</span>
                <Switch />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full">Add Credits</Button>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
              View Usage <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card> */}
        
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto Top-Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              To activate auto-top-up, you'll need a payment method that supports offline charging.
            </p> */}
            {/* <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">Add a Payment Method</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add a Payment Method</DialogTitle>
                  <DialogDescription>
                    Enter your payment details below. Your payment information is securely stored.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input id="card-name" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <div className="relative">
                      <Input id="card-number" placeholder="**** **** **** 1234" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input id="expiry-date" placeholder="MM/YY" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary">Cancel</Button>
                  <Button type="submit">Save Card</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog> */}
          {/* </CardContent>
        </Card> */}
      {/* </div> */}

      <div className="space-y-4">
        <div className="border border-gray-200 overflow-hidden border-x-0">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium">
              <div>Recent Transactions</div>
              <div>Amount</div>
              <div>Date</div>
              <div></div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {loadingTransactions ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold">Credits</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CreditsPageContent />
    </Suspense>
  );
}

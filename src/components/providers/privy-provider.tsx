"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { ReactNode, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { RateLimitHandler } from '@/components/auth/rate-limit-handler';

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [showRateLimit, setShowRateLimit] = useState(false);

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
  }

  const handleLoginSuccess = async (user: any, isNewUser: boolean) => {
    console.log('Login successful:', { user, isNewUser });

    try {
      // Get the Privy access token
      const token = localStorage.getItem('privy:token');

      // Authenticate with backend
      const authResponse = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          token,
          auto_create_api_key: true,
          trial_credits: 10,
        }),
      });

      if (!authResponse.ok) {
        console.error('Backend auth failed:', await authResponse.text());
        return;
      }

      const authData = await authResponse.json();
      console.log('Backend authentication successful:', authData);

      // Store API key if provided
      if (authData.api_key) {
        localStorage.setItem('gatewayz_api_key', authData.api_key);
      }

      // Store user data
      if (authData.user_id) {
        localStorage.setItem('gatewayz_user', JSON.stringify({
          user_id: authData.user_id,
          display_name: authData.display_name || user.email?.address || 'User',
          credits: authData.credits || 0,
        }));
      }

      // Redirect new users to chat
      if (isNewUser) {
        window.location.href = '/chat';
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleLoginError = (error: any) => {
    console.error('Privy login error:', error);

    // Handle rate limiting
    if (error?.status === 429 || error?.message?.includes('429')) {
      console.warn('Rate limit hit. Please wait before trying again.');
      setShowRateLimit(true);
    }
  };

  // Add global error listener for Privy rate limits
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.status === 429 || event.reason?.message?.includes('429')) {
        console.warn('Caught 429 error globally');
        setShowRateLimit(true);
        event.preventDefault();
      }
    });
  }

  return (
    <>
      <RateLimitHandler
        show={showRateLimit}
        onDismiss={() => setShowRateLimit(false)}
      />
      <PrivyProvider
        appId={appId}
        onSuccess={handleLoginSuccess}
        config={{
          loginMethods: ['email', 'google', 'github'],
          appearance: {
            theme: 'light',
            accentColor: '#000000',
            logo: '/logo_black.svg',
          },
          embeddedWallets: {
            ethereum: {
              createOnLogin: "users-without-wallets",
            },
          },
          defaultChain: base,
        }}
      >
        {children}
      </PrivyProvider>
    </>
  );
}


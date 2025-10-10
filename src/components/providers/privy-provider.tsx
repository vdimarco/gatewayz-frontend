"use client";

import { PrivyProvider, usePrivy, type User } from '@privy-io/react-auth';
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

  const handleLoginSuccess = async (user: User) => {
    console.log('Login successful:', { user });

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
      if (authData.is_new_user) {
        window.location.href = '/chat';
      }
    } catch (error) {
      console.error('Error during login:', error);
      handleLoginError(error);
    }
  };

  const handleLoginError = (error: unknown) => {
    console.error('Privy login error:', error);

    const message = typeof error === 'object' && error !== null ? (error as { message?: string; status?: number }) : undefined;
    if (message?.status === 429 || message?.message?.includes('429')) {
      console.warn('Rate limit hit. Please wait before trying again.');
      setShowRateLimit(true);
    }
  };

  useEffect(() => {
    const rateLimitListener = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { status?: number; message?: string } | undefined;
      if (reason?.status === 429 || reason?.message?.includes('429')) {
        console.warn('Caught 429 error globally');
        setShowRateLimit(true);
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', rateLimitListener);
    return () => window.removeEventListener('unhandledrejection', rateLimitListener);
  }, []);

  return (
    <>
      <RateLimitHandler
        show={showRateLimit}
        onDismiss={() => setShowRateLimit(false)}
      />
      <PrivyProvider
        appId={appId}
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
        <PrivyAuthEffect onLoginSuccess={handleLoginSuccess} onLoginError={handleLoginError} />
        {children}
      </PrivyProvider>
    </>
  );
}

function PrivyAuthEffect({
  onLoginSuccess,
  onLoginError,
}: {
  onLoginSuccess: (user: User) => Promise<void>;
  onLoginError: (error: unknown) => void;
}) {
  const { ready, authenticated, user } = usePrivy();
  const [lastProcessedUser, setLastProcessedUser] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) {
      setLastProcessedUser(null);
    }
  }, [authenticated]);

  useEffect(() => {
    if (!ready || !authenticated || !user) {
      return;
    }

    if (lastProcessedUser === user.id) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await onLoginSuccess(user);
        if (!cancelled) {
          setLastProcessedUser(user.id);
        }
      } catch (error) {
        if (!cancelled) {
          onLoginError(error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, user, lastProcessedUser, onLoginSuccess, onLoginError]);

  return null;
}


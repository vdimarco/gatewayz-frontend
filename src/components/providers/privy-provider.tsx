"use client";

import { PrivyProvider, usePrivy, type User, type LinkedAccountWithMetadata } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { ReactNode, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { RateLimitHandler } from '@/components/auth/rate-limit-handler';

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

const stripUndefined = <T,>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(stripUndefined) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, stripUndefined(v)]);
    return Object.fromEntries(entries) as unknown as T;
  }

  return value;
};

const toUnixSeconds = (value: unknown): number | undefined => {
  if (!value) return undefined;

  if (typeof value === 'number') {
    return Math.floor(value);
  }

  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return Math.floor(numeric);
    }
  }

  return undefined;
};

const mapLinkedAccount = (account: LinkedAccountWithMetadata) => {
  const get = (key: string) =>
    Object.prototype.hasOwnProperty.call(account, key)
      ? (account as unknown as Record<string, unknown>)[key]
      : undefined;

  return stripUndefined({
    type: account.type as string | undefined,
    subject: get('subject') as string | undefined,
    email: get('email') as string | undefined,
    name: get('name') as string | undefined,
    address: get('address') as string | undefined,
    chain_type: get('chainType') as string | undefined,
    wallet_client_type: get('walletClientType') as string | undefined,
    connector_type: get('connectorType') as string | undefined,
    verified_at: toUnixSeconds(get('verifiedAt')),
    first_verified_at: toUnixSeconds(get('firstVerifiedAt')),
    latest_verified_at: toUnixSeconds(get('latestVerifiedAt')),
  });
};

export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [showRateLimit, setShowRateLimit] = useState(false);

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
  }

  const handleLoginSuccess = async (user: User) => {
    console.log('Login successful:', { user });

    const existingGatewayzUser = localStorage.getItem('gatewayz_user');
    const isNewUser = !existingGatewayzUser;

    try {
      // Get the Privy access token
      const token = localStorage.getItem('privy:token');

      // Authenticate with backend
      const authBody = stripUndefined({
        user: stripUndefined({
          id: user.id,
          created_at: toUnixSeconds(user.createdAt) ?? Math.floor(Date.now() / 1000),
          linked_accounts: (user.linkedAccounts || []).map(mapLinkedAccount),
          mfa_methods: user.mfaMethods || [],
          has_accepted_terms: user.hasAcceptedTerms ?? false,
          is_guest: user.isGuest ?? false,
        }),
        token,
        auto_create_api_key: true,
        trial_credits: 10,
        is_new_user: isNewUser,
      });

      const authResponse = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authBody),
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
      if (authData.is_new_user ?? isNewUser) {
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


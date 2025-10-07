"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'google', 'github'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
          logo: '/logo_black.svg',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}


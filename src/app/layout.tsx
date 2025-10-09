import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { PrivyProviderWrapper } from '@/components/providers/privy-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Inter } from 'next/font/google';
// import { GTMLoader } from '@/components/analytics/gtm-loader'; // Temporarily disabled due to layout router issues

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gatewayz - One Interface To Work With Any LLM',
  description: 'From Idea To Production, Gatewayz Gives AI Teams The Toolkit, Savings, And Reliability They Need.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background min-h-screen flex flex-col justify-start`} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
          storageKey="ui-theme"
        >
          <ErrorBoundary>
            <PrivyProviderWrapper>
              {/* <GTMLoader /> Temporarily disabled due to layout router issues */}
              <AppHeader />
              {children}
              <Toaster />
              <AppFooter />
            </PrivyProviderWrapper>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}

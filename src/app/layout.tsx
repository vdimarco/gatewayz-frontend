import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { PrivyProviderWrapper } from '@/components/providers/privy-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Inter } from 'next/font/google';
import Script from 'next/script';

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
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5VPXMFRW');`,
          }}
        />
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5VPXMFRW"
height="0" width="0" style={{display:"none",visibility:"hidden"}}></iframe></noscript>

        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-TE0EZ0C0SX" strategy="afterInteractive" />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TE0EZ0C0SX');
            `,
          }}
        />

        <ThemeProvider
          defaultTheme="system"
          storageKey="ui-theme"
        >
          <ErrorBoundary>
            <PrivyProviderWrapper>
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

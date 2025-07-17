import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from '@/components/layout/app-header';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Modelz',
  description: 'AI model performance and news dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          defaultTheme="dark"
          storageKey="ui-theme"
        >
          <AppHeader />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}


"use client";

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from 'next/link';
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePrivy } from '@privy-io/react-auth';
import { UserNav } from './user-nav';
import { SearchBar } from './search-bar';
import { API_BASE_URL } from '@/lib/config';
import { processAuthResponse, getApiKey, removeApiKey } from '@/lib/api';

export function AppHeader() {
  const { user, login, logout, getAccessToken } = usePrivy();

  useEffect(() => {
    const authenticateUser = async () => {
      if(user) {
        try {
          // Check if we already have an API key for this user
          const existingApiKey = getApiKey();
          if (existingApiKey) {
            console.log('User already authenticated with API key');
            return;
          }

          const token = await getAccessToken();
          console.log({user});
          console.log({token});

          const requestBody = {
            user: {
              id: user.id,
              created_at: user.createdAt,
              linked_accounts: user.linkedAccounts,
              mfa_methods: user.mfaMethods,
              has_accepted_terms: user.hasAcceptedTerms,
              is_guest: user.isGuest
            },
            token: token || ''
          };

          const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Authentication successful:', result);
            
            // Process and save the API key and user data
            processAuthResponse(result);
          } else {
            console.error('Authentication failed:', response.status, response.statusText);
            logout();
            removeApiKey();
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          logout();
          removeApiKey();
        }
      } else {
        // User logged out, remove stored API key
        removeApiKey();
      }
    }
    
    authenticateUser();
  }, [user, getAccessToken])

  return (
    <header className="sticky top-0 z-50 w-full h-[65px] border-b bg-header flex items-center">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center mr-auto">
          <Link href="/" className="flex items-center space-x-2 w-[45px] h-[45px] shrink-0">
            <img src="/logo_black.svg" alt="Gatewayz" className="w-[45px] h-[45px] object-contain" />
          </Link>
           <div className="relative hidden sm:block w-full max-w-sm pl-6">
             <SearchBar />
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/models" className="transition-colors hover:text-foreground/80 ">Models</Link>
            <Link href="/chat" className="transition-colors hover:text-foreground/80 ">Chat</Link>
            <Link href="/developers" className="transition-colors hover:text-foreground/80 ">Developers</Link>
            <Link href="/rankings" className="transition-colors hover:text-foreground/80 ">Ranking</Link>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserNav user={user} />
            ) : (
              <Button variant="outline" onClick={() => login()}>Sign In</Button>
            )}
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="p-4">
                  <nav className="flex flex-col gap-4 text-lg">
                    <Link href="/models" className="transition-colors hover:text-foreground/80 text-foreground/60">Models</Link>
                    <Link href="/chat" className="transition-colors hover:text-foreground/80 text-foreground/60">Chat</Link>
                    <Link href="/developers" className="transition-colors hover:text-foreground/80 text-foreground/60">Developers</Link>
                    <Link href="/rankings" className="transition-colors hover:text-foreground/80 text-foreground/60">Ranking</Link>
                  </nav>
                  <div className="mt-6 flex flex-col gap-2">
                    {user ? (
                       <UserNav user={user} />
                    ) : (
                      <Button variant="outline" onClick={() => login()}>Sign In</Button>
                    )}
                     <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

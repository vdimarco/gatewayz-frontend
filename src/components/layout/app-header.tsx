
"use client";

import { useEffect, useState } from 'react';
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
import { Separator } from "@/components/ui/separator";
import { GetCreditsButton } from './get-credits-button';

export function AppHeader() {
  const { user, login, logout, getAccessToken } = usePrivy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              created_at: new Date(user.createdAt).getTime() / 1000, // Convert to Unix timestamp
              linked_accounts: user.linkedAccounts.map((account: any) => ({
                type: account.type,
                subject: account.subject,
                email: account.email,
                name: account.name,
                verified_at: account.verifiedAt ? new Date(account.verifiedAt).getTime() / 1000 : undefined,
                first_verified_at: account.firstVerifiedAt ? new Date(account.firstVerifiedAt).getTime() / 1000 : undefined,
                latest_verified_at: account.latestVerifiedAt ? new Date(account.latestVerifiedAt).getTime() / 1000 : undefined,
              })),
              mfa_methods: user.mfaMethods,
              has_accepted_terms: user.hasAcceptedTerms,
              is_guest: user.isGuest
            },
            token: token || ''
          };

          console.log('Sending auth request:', JSON.stringify(requestBody, null, 2));

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
            const errorText = await response.text();
            console.error('Authentication failed:', response.status, response.statusText);
            console.error('Error response:', errorText);
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
            <GetCreditsButton />
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
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full py-6">
                  <nav className="flex flex-col gap-4 text-base">
                    <Link
                      href="/models"
                      className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Models
                    </Link>
                    <Link
                      href="/chat"
                      className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Chat
                    </Link>
                    <Link
                      href="/developers"
                      className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Developers
                    </Link>
                    <Link
                      href="/rankings"
                      className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Ranking
                    </Link>
                  </nav>

                  {user && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase px-2">
                          Account
                        </p>
                        <Link
                          href="/settings/account"
                          className="transition-colors hover:text-foreground/80 text-foreground/60 py-2 px-2 rounded-md hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Account Settings
                        </Link>
                        <Link
                          href="/settings/credits"
                          className="transition-colors hover:text-foreground/80 text-foreground/60 py-2 px-2 rounded-md hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Credits
                        </Link>
                        <Link
                          href="/settings/keys"
                          className="transition-colors hover:text-foreground/80 text-foreground/60 py-2 px-2 rounded-md hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          API Keys
                        </Link>
                        <Link
                          href="/settings/activity"
                          className="transition-colors hover:text-foreground/80 text-foreground/60 py-2 px-2 rounded-md hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Activity
                        </Link>
                        <Link
                          href="/settings"
                          className="transition-colors hover:text-foreground/80 text-foreground/60 py-2 px-2 rounded-md hover:bg-accent"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Settings
                        </Link>
                      </div>
                      <Separator className="my-4" />
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  )}

                  {!user && (
                    <>
                      <Separator className="my-4" />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          login();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}

                  <div className="mt-auto pt-4">
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

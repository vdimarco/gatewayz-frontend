
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search } from "lucide-react";
import Link from 'next/link';
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserNav } from './user-nav';

export function AppHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center gap-6 mr-auto">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6">
              <rect width="256" height="256" fill="none"></rect>
              <path d="M168,40a40,40,0,1,1-80,0c0,48,80,64,80,112H88c0-48,80-64,80-112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M128,216a40,40,0,0,1-40-40c0-48,80-64,80-112h-8c0,48-80,64-80,112a40,40,0,0,1,40,40Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
            </svg>
            <span className="font-bold sm:inline-block">MODELZ</span>
          </Link>
           <div className="relative hidden sm:block w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="pl-9 pr-4 h-9" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground border rounded-sm px-1.5 py-0.5">/</div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/models" className="transition-colors hover:text-foreground/80 text-foreground/60">Models</Link>
            <Link href="/chat" className="transition-colors hover:text-foreground/80 text-foreground/60">Chat</Link>
            <Link href="/developers" className="transition-colors hover:text-foreground/80 text-foreground/60">Developers</Link>
            <Link href="/rankings" className="transition-colors hover:text-foreground/80 text-foreground/60">Rankings</Link>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserNav user={user} />
            ) : (
              <Link href="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
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
                    <Link href="/rankings" className="transition-colors hover:text-foreground/80 text-foreground/60">Rankings</Link>
                  </nav>
                  <div className="mt-6 flex flex-col gap-2">
                    {user ? (
                       <UserNav user={user} />
                    ) : (
                       <Link href="/signin">
                         <Button variant="outline" className="w-full">Sign In</Button>
                       </Link>
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

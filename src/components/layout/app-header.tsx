import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Wallet } from "lucide-react";
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6">
              <rect width="256" height="256" fill="none"></rect>
              <path d="M168,40a40,40,0,1,1-80,0c0,48,80,64,80,112H88c0-48,80-64,80-112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              <path d="M128,216a40,40,0,0,1-40-40c0-48,80-64,80-112h-8c0,48-80,64-80,112a40,40,0,0,1,40,40Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
            </svg>
            <span className="hidden font-bold sm:inline-block">MODELZ</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Developers</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Rankings</Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">Portfolio</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-9 pr-4 h-9" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground border rounded-sm px-1.5 py-0.5">/</div>
             </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="outline" size="sm">Create New Model</Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">BUY $PACA</Button>
            <Button variant="outline" size="sm" className="gap-2">
                <Wallet className="w-4 h-4"/>
                <span className="hidden sm:inline">0xd9...334A</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

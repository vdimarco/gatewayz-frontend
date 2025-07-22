
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { topApps, type AppData, adjustAppDataForTimeRange } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronsRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const AppItem = ({ app, rank }: { app: AppData; rank: number }) => (
  <li className="flex items-center justify-between py-3">
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-muted-foreground w-6 text-right">{rank}.</span>
      <Image 
        src={`https://placehold.co/40x40.png`} 
        alt={`${app.name} logo`}
        width={40}
        height={40}
        className="rounded-lg" 
        data-ai-hint={app.iconHint}
      />
      <div>
        <Link href="#" className="flex items-center gap-1 font-semibold hover:underline">
          {app.name}
          <ChevronsRight className="w-4 h-4 text-muted-foreground" />
        </Link>
        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{app.description}</p>
        {app.isNew && <Badge variant="secondary" className="mt-1">new</Badge>}
      </div>
    </div>
    <span className="text-sm font-semibold">{app.tokens}</span>
  </li>
);

type TimeFrameOption = 'Today' | 'Past 7 days' | 'Past Month';

export default function TopAppsTable() {
  const [timeFrame, setTimeFrame] = useState<TimeFrameOption>('Today');

  const displayedApps = useMemo(() => {
    return adjustAppDataForTimeRange(topApps, timeFrame);
  }, [timeFrame]);

  const appsColumn1 = displayedApps.slice(0, 10);
  const appsColumn2 = displayedApps.slice(10, 20);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-1.2 0-2.4.6-3 1.7A3.5 3.5 0 0 0 6.5 8c0 2.3 1.9 4.2 4.2 4.2h0c2.3 0 4.2-1.9 4.2-4.2a3.5 3.5 0 0 0-2.5-3.3A3.5 3.5 0 0 0 12 3z"></path><path d="M12 14c-1.2 0-2.4.6-3 1.7A3.5 3.5 0 0 0 6.5 19c0 2.3 1.9 4.2 4.2 4.2h0c2.3 0 4.2-1.9 4.2-4.2a3.5 3.5 0 0 0-2.5-3.3A3.5 3.5 0 0 0 12 14z"></path></svg>
                    Top Apps
                </CardTitle>
                <CardDescription className="mt-2">
                    Largest public apps opting into usage tracking on OpenRouter
                </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-4 sm:mt-0 w-full sm:w-[180px] justify-between">
                  {timeFrame} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem onSelect={() => setTimeFrame('Today')}>Today</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTimeFrame('Past 7 days')}>Past 7 days</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTimeFrame('Past Month')}>Past Month</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <ul>
            {appsColumn1.map((app, index) => (
              <AppItem key={app.name} app={app} rank={index + 1} />
            ))}
          </ul>
          <ul className="border-t md:border-t-0 mt-4 pt-4 md:mt-0 md:pt-0">
            {appsColumn2.map((app, index) => (
              <AppItem key={app.name} app={app} rank={index + 11} />
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

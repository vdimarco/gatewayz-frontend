
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Info, RefreshCw, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CreditsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Credits</h1>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      <Card className="max-w-md">
        <CardContent className="p-6 flex items-center justify-between">
          <span className="text-4xl font-semibold">$0.00</span>
          <Info className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Buy Credits</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span>Use crypto</span>
                <Switch />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full">Add Credits</Button>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
              View Usage <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto Top-Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              To activate auto-top-up, you&apos;ll need a payment method that supports offline charging.
            </p>
            <Button variant="secondary" className="w-full">Add a Payment Method</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No credits purchased
          </div>
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button variant="ghost" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">1</Button>
            <Button variant="ghost" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

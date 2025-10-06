
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { usePrivy } from '@privy-io/react-auth';
import { getUserData } from '@/lib/api';

export default function AccountPage() {
  const { user: privyUser, logout } = usePrivy();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserEmail = () => {
    const emailAccount = privyUser?.linkedAccounts?.find((account: any) => account.type === 'email');
    const googleAccount = privyUser?.linkedAccounts?.find((account: any) => account.type === 'google_oauth');
    return emailAccount?.address || googleAccount?.email || 'No email';
  };

  const getUserName = () => {
    const googleAccount = privyUser?.linkedAccounts?.find((account: any) => account.type === 'google_oauth');
    const userData = getUserData();
    return googleAccount?.name || userData?.display_name || 'User';
  };

  const getConnectedAccounts = () => {
    if (!privyUser?.linkedAccounts) return [];
    return privyUser.linkedAccounts.filter((account: any) =>
      account.type === 'google_oauth' || account.type === 'github_oauth'
    );
  };

  if (!mounted) {
    return (
      <div className="space-y-8 lg:min-w-[600px] xl:min-w-[1000px]">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold">Account</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!privyUser) {
    return (
      <div className="space-y-8 lg:min-w-[600px] xl:min-w-[1000px]">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold">Account</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please sign in to view your account details.</p>
        </div>
      </div>
    );
  }

  const userEmail = getUserEmail();
  const userName = getUserName();
  const connectedAccounts = getConnectedAccounts();

  return (
    <div className="space-y-8 lg:min-w-[600px] xl:min-w-[1000px]">
      <div className="flex justify-center">
        <h1 className="text-3xl font-bold">Account</h1>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">

      {/* Account Details Section */}
      <div className="space-y-0">
        <h2 className="text-lg mb-6 font-bold">Account Details</h2>
        
        {/* Profile */}
        <div className="flex items-center py-4 border-y border-gray-200">
          <div className="w-1/3 text-base font-medium">Profile</div>
          <div className="w-1/3 flex items-center justify-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-card border border-gray-300">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-base">{userName}</span>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="link" className="text-blue-400 p-0 h-auto text-base" disabled>
              Update Profile
            </Button>
          </div>
        </div>

        {/* Email Addresses */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <div className="w-1/3 text-base font-medium">Email Addresses</div>
          <div className="w-1/3 flex flex-col items-center justify-center gap-1">
            <span className="text-base">{userEmail}</span>
            <Button variant="link" className="text-blue-400 p-0 h-auto text-base" disabled>
              Add Email Address
            </Button>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <div className="w-1/3 text-base font-medium">Connected Accounts</div>
          <div className="w-1/3 flex flex-col items-center justify-center gap-1">
            {connectedAccounts.length > 0 ? (
              connectedAccounts.map((account: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded text-white text-xs flex items-center justify-center font-bold">
                    {account.type === 'google_oauth' && <img src="/ri_google-fill.svg" alt="Google" className="w-6 h-6" />}
                    {account.type === 'github_oauth' && <img src="/github-logo.svg" alt="GitHub" className="w-6 h-6" />}
                  </div>
                  <span className="text-base">{account.email || account.name}</span>
                </div>
              ))
            ) : (
              <span className="text-base text-muted-foreground">No accounts connected</span>
            )}
            <Button variant="link" className="text-blue-400 p-0 h-auto text-base" disabled>
              Connect Account
            </Button>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <div className="w-1/3 text-base font-medium">Password</div>
          <div className="w-1/3 flex justify-center gap-2">
            <span className="text-base">**********</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => setShowPassword(!showPassword)}
              disabled
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="link" className="text-blue-400 p-0 h-auto text-base" disabled>
              Reset Password
            </Button>
          </div>
        </div>
      </div>

      {/* Billing Details Section */}
      <div className="space-y-0">
        <h2 className="text-lg font-bold mb-6">Billing Details</h2>
        
        {/* Full Name */}
        <div className="flex items-center py-4 border-y border-gray-200">
          <div className="w-1/3 text-base font-medium">Full Name</div>
          <div className="w-1/3 flex justify-center">
            <span className="text-base">{userName}</span>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="link" className="text-blue-400 p-0 h-auto text-base" disabled>
              Edit Name
            </Button>
          </div>
        </div>

        {/* Billing Address */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <div className="w-1/3 text-base font-medium">Billing Address</div>
          <div className="w-1/3 flex justify-center">
            <div className="text-base text-center text-muted-foreground">
              <div>Not set</div>
            </div>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="link" className="text-blue-400 p-0 h-auto text-base" disabled>
              Edit Address
            </Button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="flex items-center py-4 border-b border-gray-200">
          <div className="w-1/3 text-base font-medium">Payment Method</div>
          <div className="w-1/3 flex flex-col items-center justify-center gap-1">
            <span className="text-base text-muted-foreground">No payment method</span>
            <Button variant="link" className="text-blue-400 p-0 h-auto text-base" disabled>
              Add Payment Method
            </Button>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Account Termination Section */}
      <div className="space-y-0">
        <h2 className="text-lg font-bold mb-6">Account Termination</h2>
        
        {/* Delete Account */}
        <div className="flex items-center py-4 border-y border-gray-200">
          <div className="w-1/3 text-base font-medium">Delete Account</div>
          <div className="w-1/3"></div>
          <div className="w-1/3 flex items-center justify-end">
            <Button variant="link" className="text-red-400 p-0 h-auto text-base">
              Delete
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

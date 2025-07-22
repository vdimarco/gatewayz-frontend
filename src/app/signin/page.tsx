
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M21.35 11.1h-9.2v2.8h5.3c-.2 1.9-1.5 3.3-3.4 3.3-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8c1.1 0 2.1.4 2.8 1.1l2.2-2.2C17.2 6.4 15.2 5 12.95 5c-3.9 0-7 3.1-7 7s3.1 7 7 7c4.1 0 6.6-2.8 6.6-6.6 0-.5 0-1-.1-1.4z"/>
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17.435 12.334c0-2.865 2.129-4.116 2.2-4.164a4.42 4.42 0 0 0-3.55-2.032c-1.536-.11-3.034.931-3.82 2.033-.822 1.101-1.464 2.897-1.232 4.62.978.143 2.13.036 3.035-.358.214-.08.45-.18.715-.32-1.39-2.03-1.11-4.49.566-5.923.368.305.565.63.737.958.07.129.13.257.18.385.12.301.18.583.18.887a3.84 3.84 0 0 1-.36 1.652c-.4.8-1.028 1.4-1.857 1.732-.07.03-.13.04-.2.06-.55.19-1.2.32-1.87.36-.6.04-.9.04-1.2.04h-.1s.03-.17.03-.18c.24-1.37.9-2.9 1.9-3.9 1.04-1.1 2.3-1.8 3.7-1.8.14 0 .28.01.42.02a4.34 4.34 0 0 1-.02-1.5c0-.07.02-.13.02-.2.01-.2.03-.4.05-.6.18-1.07.72-2.1 1.58-2.8.04.03 2.38 1.38 2.38 4.64 0 .8-.2 1.6-.6 2.3-.5.7-1.2 1.2-2.1 1.4-.9.2-1.9.1-2.8-.4-.1-.04-.17-.1-.25-.15zM12.02 21.24c1.6 0 3.1-.7 4.1-2.1.9-1.2 1.4-2.8 1.3-4.3-.8.03-1.6-.1-2.4-.4-.8-.3-1.6-.8-2.2-1.5-.7-.7-1.1-1.6-1.2-2.6-.1-.9.1-1.9.4-2.8.2-.7.5-1.3.9-1.9a5.1 5.1 0 0 0-4.2-2.1C7.32 3.54 4 6.74 4 10.74c0 2.2.9 4.3 2.5 5.7s3.8 2.1 5.52 2.1z"/>
    </svg>
);

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white dark:from-blue-900/20 dark:to-black"
        style={{
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(207, 234, 250) 0%, rgb(255, 255, 255) 90%), radial-gradient(circle at 80% 70%, rgb(224, 238, 247) 0%, rgb(255, 255, 255) 90%)',
        }}
      ></div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
            <div className="flex justify-center">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 border border-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in with email</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                Make a new doc to bring your words, data, and teams together. For free
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                <div className="relative mt-1">
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    autoComplete="email" 
                    required 
                    placeholder="name@company.com"
                    className="pl-10 bg-white/70 dark:bg-black/70 border-gray-300 dark:border-gray-700"
                  />
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                 <div className="flex items-center justify-between">
                   <Label htmlFor="password"className="text-gray-700 dark:text-gray-300">Password</Label>
                   <Link href="#" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                      Forgot password?
                   </Link>
                 </div>
                <div className="relative mt-1">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    autoComplete="current-password" 
                    required 
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white/70 dark:bg-black/70 border-gray-300 dark:border-gray-700"
                  />
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-200">
                  Get Started
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/60 dark:bg-black/60 px-2 text-gray-500 dark:text-gray-400 backdrop-blur-sm">Or sign in with</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
                <Button variant="outline" size="icon" className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-gray-700">
                    <GoogleIcon className="w-5 h-5"/>
                </Button>
                 <Button variant="outline" size="icon" className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-gray-700">
                    <FacebookIcon className="w-5 h-5"/>
                </Button>
                 <Button variant="outline" size="icon" className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-gray-700 text-black dark:text-white">
                    <AppleIcon className="w-5 h-5"/>
                </Button>
            </div>

             <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="#" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ChevronRight, GitMerge, ShieldCheck, TrendingUp, User, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiKey } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';

interface FeaturedModel {
  name: string;
  by: string;
  tokens: string;
  latency: string;
  growth: string;
  color: string;
  logo_url?: string;
}

interface RankingModelData {
  id: number;
  rank: number;
  model_name: string;
  author: string;
  tokens: string;
  trend_percentage: string;
  trend_direction: "up" | "down";
  trend_icon: string;
  trend_color: string;
  model_url: string;
  author_url: string;
  time_period: string;
  scraped_at: string;
}

const FeaturedModelCard = ({
  model,
  isNew,
  isActive,
  onClick
}: {
  model: FeaturedModel,
  isNew?: boolean,
  isActive?: boolean,
  onClick?: () => void
}) => (
    <div
      className={`h-[144px] bg-card border rounded-lg shadow-sm hover:shadow-md cursor-pointer overflow-hidden relative ${
        isActive
          ? 'border-2 border-[rgba(81,177,255,1)] shadow-lg w-auto min-w-[280px] sm:min-w-[350px] md:min-w-[400px] flex-shrink-0 shadow-[0px_0px_6px_0px_rgba(81,177,255,1)]'
          : 'border-gray-200 hover:border-gray-300 w-20 sm:w-24 min-w-[80px] sm:min-w-[96px] flex-shrink-0'
      }`}
      style={{
        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onClick={onClick}
    >
      {/* Compact view */}
      <div
        className={`absolute inset-0 p-2 flex flex-col items-center justify-center gap-2 transition-opacity duration-500 ${
          isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 flex-shrink-0">
          {model.logo_url ? (
            <img src={model.logo_url} alt={model.by} width="42" height="42" />
          ) : (
            <>
              {model.by === 'google' && (
                <div className="flex">
                  <img src="/Google_Logo-black.svg" alt="Google" width="42" height="42" />
                </div>
              )}
              {model.by === 'openai' && (
                <div className="flex">
                  <img src="/OpenAI_Logo-black.svg" alt="OpenAI" width="42" height="42" />
                </div>
              )}
              {model.by === 'anthropic' && (
                <div className="flex">
                  <img src="/Meta_Logo-black.svg" alt="Anthropic" width="42" height="42" />
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${model.growth.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
            {model.growth}
          </p>
          <p className="text-[10px] text-gray-600 leading-tight">Weekly Growth</p>
        </div>
      </div>

      {/* Expanded view */}
      <div
        className={`absolute inset-0 px-2 sm:px-4 py-2 sm:py-3 transition-opacity duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-100 flex-shrink-0">
              {model.logo_url ? (
                <img src={model.logo_url} alt={model.by} className="w-8 h-8 sm:w-10 sm:h-10" />
              ) : (
                <>
                  {model.by === 'google' && (
                    <div className="flex">
                      <img src="/Google_Logo-black.svg" alt="Google" className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  )}
                  {model.by === 'openai' && (
                    <div className="flex">
                      <img src="/OpenAI_Logo-black.svg" alt="OpenAI" className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  )}
                  {model.by === 'anthropic' && (
                    <div className="flex">
                      <img src="/Meta_Logo-black.svg" alt="Anthropic" className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-black">{model.name}</h3>
              <span className="text-xs sm:text-sm">By</span><span className="text-xs sm:text-sm text-blue-600"> {model.by.charAt(0).toUpperCase() + model.by.slice(1)}</span>
            </div>
          </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-black">{model.tokens}</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Tokens/Sec</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-black">{model.latency}</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Latency</p>
          </div>
          <div className="text-center">
            <p className={`text-lg sm:text-xl md:text-2xl font-bold ${model.growth.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
              {model.growth}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Weekly Growth</p>
          </div>
        </div>
      </div>
    </div>
)

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div className="text-center">
    <p className="text-4xl md:text-5xl font-bold tracking-tighter">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
  </div>
)

const HowItWorksStep = ({ number, title, description, children }: { number: number, title: string, description: string, children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center ">
      <div className="w-8 h-8 flex items-center justify-center rounded-full text-primary font-bold">{number}.</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="pl-2">{description}</p>
    <div className="pl-12">{children}</div>
  </div>
)

const FeatureCard = ({ icon, title, description, linkText, linkHref }: { icon: string, title: string, description: React.ReactNode, linkText: string, linkHref: string }) => (
  <Card className="p-6 text-center">
    <div className="flex justify-center mb-4">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-muted">
        <img src={`/${icon}.svg`} alt="Stats" width="100%" height="100%" />
      </div>
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className=" text-1xl text-bold mb-4">{description}</p>
    {/* <Link href={linkHref}>
      <Button variant="link" className="text-primary">{linkText} <ArrowRight className="w-4 h-4 ml-1"/></Button>
    </Link> */}
  </Card>
)

const AnnouncementCard = ({ title, description, date, isNew }: { title: string, description: string, date: string, isNew?: boolean }) => (
    <div className="p-4 rounded-lg hover:bg-muted/50">
        <h4 className="font-semibold text-base mb-1">{title} {isNew && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full ml-2">New</span>}</h4>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
    </div>
)

export default function Home() {
  const [activeModelIndex, setActiveModelIndex] = useState<number | null>(0);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, ready, login } = usePrivy();
  const [apiKey, setApiKey] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'javascript' | 'curl'>('python');
  const [codeCopied, setCodeCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(true);
  const { toast } = useToast();

  // Load the actual API key when user is authenticated
  useEffect(() => {
    const loadApiKey = () => {
      // Wait for Privy to be ready
      if (!ready) {
        return;
      }

      if (user) {
        const userApiKey = getApiKey();
        if (userApiKey) {
          setApiKey(userApiKey);
        } else {
          // User is authenticated but no API key yet - show placeholder
          setApiKey('');
        }
      } else {
        setApiKey(''); // Show placeholder when not authenticated
      }
    };

    // Load initially
    loadApiKey();

    // Listen for storage changes (in case API key is set in another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gatewayz_api_key') {
        loadApiKey();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also poll for changes every second to catch same-tab updates
    const interval = setInterval(loadApiKey, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user, ready]);

  // Dynamic code examples with actual API key
  const codeExamples = {
    python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.gatewayz.ai/v1",
    api_key="${apiKey || 'YOUR_API_KEY'}"
)

completion = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(completion.choices[0].message)`,

    javascript: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.gatewayz.ai/v1",
  apiKey: "${apiKey || 'YOUR_API_KEY'}",
});

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "user", content: "Hello!" }
  ],
});

console.log(completion.choices[0].message);`,

    curl: `curl https://api.gatewayz.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'`
  };
  const [featuredModels, setFeaturedModels] = useState<FeaturedModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  // Fetch models from rankings API
  useEffect(() => {
    const fetchRankingModels = async () => {
      try {
        setIsLoadingModels(true);
        const response = await fetch(`${API_BASE_URL}/ranking/models`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          const rankingModels: RankingModelData[] = result.data || [];

          // Map ranking data to featured model format
          const mappedModels: FeaturedModel[] = rankingModels.slice(0, 10).map((model) => {
            // Get logo based on author
            const authorLower = model.author.toLowerCase();
            let logo_url = '/logo_black.svg'; // Default logo

            if (authorLower.includes('google')) {
              logo_url = '/Google_Logo-black.svg';
            } else if (authorLower.includes('openai')) {
              logo_url = '/OpenAI_Logo-black.svg';
            } else if (authorLower.includes('anthropic')) {
              logo_url = '/anthropic-logo.svg';
            } else if (authorLower.includes('meta')) {
              logo_url = '/Meta_Logo-black.svg';
            } else if (authorLower.includes('deepseek')) {
              logo_url = '/DeepSeek_Logo-black.svg';
            } else if (authorLower.includes('x-ai') || authorLower.includes('xai')) {
              logo_url = '/xai-logo.svg';
            }

            // Format growth percentage
            const growth = model.trend_direction === 'up'
              ? `+${model.trend_percentage}`
              : model.trend_direction === 'down'
                ? `-${model.trend_percentage}`
                : model.trend_percentage;

            return {
              name: model.model_name,
              by: model.author,
              tokens: model.tokens,
              latency: '--', // Not provided by ranking API
              growth: growth,
              color: model.trend_direction === 'up' ? 'bg-green-400' : model.trend_direction === 'down' ? 'bg-red-400' : 'bg-gray-400',
              logo_url: logo_url
            };
          });

          setFeaturedModels(mappedModels);
        } else {
          console.error('Failed to fetch ranking models');
          // Set fallback models if API fails
          setFeaturedModels([
            { name: 'Gemini 2.5 Pro', by: 'google', tokens: '170.06', latency: '2.6s', growth: '+13.06%', color: 'bg-blue-400', logo_url: '/Google_Logo-black.svg' },
            { name: 'GPT-4', by: 'openai', tokens: '20.98', latency: '850ms', growth: '--', color: 'bg-green-400', logo_url: '/OpenAI_Logo-black.svg' },
            { name: 'Claude Sonnet 4', by: 'anthropic', tokens: '585.26', latency: '1.9s', growth: '-9.04%', color: 'bg-purple-400', logo_url: '/anthropic-logo.svg' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching ranking models:', error);
        // Set fallback models on error
        setFeaturedModels([
          { name: 'Gemini 2.5 Pro', by: 'google', tokens: '170.06', latency: '2.6s', growth: '+13.06%', color: 'bg-blue-400', logo_url: '/Google_Logo-black.svg' },
          { name: 'GPT-4', by: 'openai', tokens: '20.98', latency: '850ms', growth: '--', color: 'bg-green-400', logo_url: '/OpenAI_Logo-black.svg' },
          { name: 'Claude Sonnet 4', by: 'anthropic', tokens: '585.26', latency: '1.9s', growth: '-9.04%', color: 'bg-purple-400', logo_url: '/anthropic-logo.svg' }
        ]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchRankingModels();
  }, []);

  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModelIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % featuredModels.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredModels.length]);

  // Double the models array for infinite scrolling
  const displayModels = [...featuredModels, ...featuredModels];

  // Calculate offset - just measure collapsed card widths, not the expanded one
  useEffect(() => {
    const updateOffset = () => {
      if (carouselRef.current && activeModelIndex !== null) {
        // Assume compact cards are ~96px on desktop, ~80px on mobile
        // Expanded card is ~400px on desktop, ~280px on mobile
        const compactWidth = window.innerWidth >= 640 ? 96 : 80;
        const gap = 8;

        // Calculate offset: number of cards before active * (compact width + gap)
        const offset = activeModelIndex * (compactWidth + gap);

        setCarouselOffset(-offset);
      }
    };

    updateOffset();
    const timer = setTimeout(updateOffset, 100);

    return () => clearTimeout(timer);
  }, [activeModelIndex]);

  const handleModelClick = (index: number) => {
    setActiveModelIndex(index);
  };

  const handleSendMessage = () => {
    if (message.trim() && activeModelIndex !== null) {
      const selectedModel = featuredModels[activeModelIndex];
      // Navigate to chat page with the selected model
      router.push(`/chat?model=${encodeURIComponent(selectedModel.name)}&message=${encodeURIComponent(message)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast({
        title: "API Key Copied",
        description: "Your API key has been copied to clipboard.",
      });
    }
  };

  const handleGenerateApiKey = () => {
    if (user) {
      // If already logged in, redirect to credits page to claim trial
      router.push('/settings/credits');
    } else {
      // If not logged in, trigger login
      login();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeCodeTab]);
    setCodeCopied(true);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCodeCopied(false), 2000);
  };
  
  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 " style={{position: 'relative'}}>
        {/* Hero Section */}
        <img 
          src="/logo_transparent.svg" 
          alt="Stats" 
          className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[450px] h-[450px] lg:w-[640px] lg:h-[640px] xl:w-[768px] xl:h-[768px]" 
        />
        
        <section className="grid md:grid-cols-1 gap-8 items-center py-8 md:py-[140px] mb-16 md:mb-32 max-w-5xl mx-auto px-4" >
          <div className="space-y-6 md:space-y-8 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tighter text-center" style={{  fontFamily: 'Inter, sans-serif',}}>One Interface To </h1>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tighter text-center">Work With Any LLM</h1>
            <p className="text-sm sm:text-base md:text-lg text-center px-4 py-6">From Idea To Production, Gatewayz Gives AI Teams The Toolkit, Savings, And Reliability They Need.</p>
          </div>
          <div className="relative mt-4">
            <Input
              placeholder="Start a message..."
              className="h-12 pr-14 bg-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              autoComplete="off"
              data-form-type="other"
              type="text"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleSendMessage}
              type="button"
            >
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="34" height="34" rx="8" fill="black"/>
                <path d="M9 23.5V18.346L14.846 17L9 15.654V10.5L24.423 17L9 23.5Z" fill="white"/>
              </svg>
            </button>
          </div>
          <div className="overflow-hidden relative -mx-4 mt-6">
            <div
              ref={carouselRef}
              className="flex pb-2 relative z-10 gap-2"
              style={{
                transform: `translateX(${carouselOffset}px)`,
                transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
                {displayModels.map((model, i) => {
                  const modelIndex = i % featuredModels.length;
                  const isFirstSet = i < featuredModels.length;
                  return (
                    <FeaturedModelCard
                      key={i}
                      model={model}
                      isNew={model.name.includes('GPT-5')}
                      isActive={isFirstSet && modelIndex === activeModelIndex}
                      onClick={() => handleModelClick(modelIndex)}
                    />
                  );
                })}
            </div>
          </div>

            {/* Connected to 1000+ AI Models - Moved here */}
            <section className="mt-12 px-4">
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-center">Connect To 1000+ AI Models</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center max-w-4xl mx-auto">
                <img src="/OpenAI_Logo-black.svg" alt="OpenAI" className="w-full max-w-[140px]" />
                <img src="/Google_Logo-black.svg" alt="Google" className="w-full max-w-[140px]" />
                <img src="/DeepSeek_Logo-black.svg" alt="DeepSeek" className="w-full max-w-[140px]" />
                <img src="/Meta_Logo-black.svg" alt="Meta" className="w-full max-w-[140px]" />
              </div>
            </section>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm z-10 mt-12">
              <div className=" px-6 py-[10px] flex flex-row items-center justify-between">
                <div className="font-bold tracking-tight text-lg">Top Models This Month</div>
              <Link href="/rankings">
                <Button variant="link" className="text-sm">View Trending
                  <span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.66671 8H13.3334M13.3334 8L9.33337 12M13.3334 8L9.33337 4" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </Button>
              </Link>
              </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className=" my-24">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-center">Getting Started Is As Easy As 123...</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-4 bg-muted rounded-lg h-40 grid grid-cols-7">
              <div className="flex items-center justify-between col-span-2" >
                <img src="/sign-up-blue.svg" alt="Stats" width="100%" height="100%" />
              </div>
              <div className="flex items-center justify-between col-span-5" >
                <HowItWorksStep number={1} title="Signup" description="Create An Account To Get Started Using Your Email Or A 3rd Party.">
                    <span></span>
                </HowItWorksStep>
              </div>
            </div>    
            <div className="p-4 bg-muted rounded-lg h-40 grid grid-cols-7">
             <div className="flex items-center justify-between col-span-2" >
                <img src="/coins-blue.svg" alt="Stats" width="100%" height="100%" />
              </div>
              <div className="flex items-center justify-between col-span-5" >
                <HowItWorksStep number={2} title="Buy credits" description="Credits Can Be Purchased In Multiple Methods, And Used With Any Model Or Provider.">
                    <span></span>
                </HowItWorksStep>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg h-40 grid grid-cols-7">
              <div className="flex items-center justify-between col-span-2" >
                <img src="/api-blue.svg" alt="Stats" width="100%" height="100%" />
              </div>
              <div className="flex items-center justify-between col-span-5" >
                <HowItWorksStep number={3} title="Get your API key" description="Create An API Key And Start Making Requests In An Instance.">
                    <span></span>
                </HowItWorksStep>
              </div>
            </div>
          </div>          
        </section>

        {/* Integrations Section */}
        <section className="my-24 pt-24">
          <div className="mb-8 flex flex-col items-center justify-center">
            <div className="w-full flex flex-col md:flex-row items-center gap-4">
              <h2 className="text-3xl font-bold text-left flex-1">Integration Only Takes A Minute</h2>
              <p className=" text-bold text-center text-xl">3 Lines To Get Gatewayz Running, No Stack Overhaul Required.</p>
            </div>
          </div>

          {/* Interactive Code Block - Sexier Version */}
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Terminal-style Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors"></div>
                </div>
                <span className="text-xs text-slate-400 ml-3 font-mono">integration.{activeCodeTab === 'python' ? 'py' : activeCodeTab === 'javascript' ? 'js' : 'sh'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
              >
                {codeCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-1 px-4 pt-3 bg-slate-950/30">
              {(['python', 'javascript', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                    activeCodeTab === lang
                      ? 'bg-slate-950/80 text-cyan-400 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  {lang === 'python' ? '🐍 Python' : lang === 'javascript' ? '⚡ JavaScript' : '🔧 cURL'}
                </button>
              ))}
            </div>

            {/* Code Display with animated transition */}
            <div className="relative bg-slate-950/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
              <div className="relative p-6 overflow-x-auto">
                <pre className="text-sm leading-relaxed font-mono">
                  <code className="text-slate-200">
                    {codeExamples[activeCodeTab].split('\n').map((line, i) => (
                      <div key={i} className="hover:bg-slate-800/30 px-2 -mx-2 rounded transition-colors">
                        <span className="inline-block w-8 text-slate-600 select-none">{i + 1}</span>
                        <span className="syntax-highlight">{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Bottom gradient accent */}
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
          </div>

          <style jsx>{`
            .syntax-highlight {
              color: #e2e8f0;
            }
          `}</style>

           <div className="w-full flex items-center gap-4 mt-8">
             {user && apiKey && (
               <div className="flex-1 flex items-center gap-3">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Your API Key</label>
                 <div className="relative flex-1">
                   <Input
                     className="h-12 pr-28 font-mono text-sm bg-background text-foreground"
                     value={apiKey}
                     type={showApiKey ? "text" : "password"}
                     readOnly
                   />
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                     <button
                       onClick={() => setShowApiKey(!showApiKey)}
                       className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                     >
                       {showApiKey ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                         </svg>
                       ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                       )}
                     </button>
                     <button
                       onClick={handleCopyApiKey}
                       className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                     >
                       <Copy className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
               </div>
             )}

             <div className={`relative group inline-block ${user && apiKey ? '' : 'mx-auto'}`}>
               {/* Multi-layered LED-style glow with color shifting */}
               <div className="absolute -inset-[3px] rounded-lg opacity-90 blur-md animate-led-shimmer"></div>
               <div className="absolute -inset-[2px] rounded-lg opacity-80 blur-sm animate-led-shimmer" style={{ animationDelay: '0.5s' }}></div>

               {/* Elevated neon border - visible underneath */}
               <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-100 animate-led-shimmer" style={{ top: '2px' }}></div>

               {/* Button with elevation effect */}
               <Button
                 className="relative bg-black hover:bg-gray-900 text-white hover:text-white h-12 px-12 rounded-lg font-semibold transition-all duration-200 active:translate-y-[2px] active:shadow-none shadow-[0_2px_0_0_rgba(59,130,246,0.5),0_4px_12px_rgba(59,130,246,0.4)]"
                 onClick={handleGenerateApiKey}
               >
                 {user ? 'Claim Trial Credits' : 'Generate API Key'}
               </Button>
             </div>
           </div>

           <style jsx>{`
             @keyframes led-shimmer {
               0%, 100% {
                 background-position: 0% 50%;
               }
               50% {
                 background-position: 100% 50%;
               }
             }

             .animate-led-shimmer {
               background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4, #3b82f6);
               background-size: 200% 200%;
               animation: led-shimmer 4s ease-in-out infinite;
             }
           `}</style>
        </section>

        {/* Features Section */}
        <section className=" my-24 pt-12">
          <div className="mb-8 items-center justify-center">
            <h2 className="text-3xl font-bold text-center flex-1">What Makes Gatewayz Stand Out?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard icon="mynaui_api-solid" title="One API For Any Model" description={
                <>
                  Access all Major Models Through A Single, Unified Interface.
                  <br />
                  OpenAI SDK Works Out Of The Box.
                </>
              }  linkText="Browse all" linkHref="/models" />
            <FeatureCard icon="file-icons_api-blueprint" title="Higher Availability" description={
                <>
                Reliable AI Models Via Our Distributed Infrastructure. 
                <br />
                Fall Back To Other Providers When One Goes Down.
                </>
            } linkText="Learn more" linkHref="#" />
            <FeatureCard icon="streamline-ultimate_performance-increase-bold" title="Price and Performance" description={
                <>
                  Keep Costs In Check Without Sacrificing Speed. 
                  <br />
                  OpenRouter Runs At The Edge, Adding Just ~25ms Between Your Users And Their Inference.
                </>
            } linkText="Learn more" linkHref="#" />
            <FeatureCard icon="tdesign_data-filled" title="Custom Data Policies" description={
                <>
                  Protect Your Organization With Fine-Grained Data Policies.<br />
                  Ensure Prompts Only Go To The Models And Providers You Trust.
                </>
            } linkText="View docs" linkHref="#" />
          </div>
        </section>

        {/* Explore & Announcements */}
        <section className="grid md:grid-cols-1 gap-12 my-24 pt-12">
            <div className="space-y-8">
                <div className="p-6 border rounded-lg bg-card">
                    <h2 className="text-3xl font-bold mb-2">Explore Models</h2>
                    <p className="text-1xl mb-4">Discover AI Models Across Our Collection, From All Major Labs And Providers.</p>
                    <Link href="/models"><Button variant="outline" className="bg-white text-bold">View Models <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                </div>
                 <div className="p-6 border rounded-lg bg-card">
                    <h2 className="text-3xl font-bold mb-2">Model & App Rankings</h2>
                    <p className="text-1xl mb-4">Explore Token Usage Across Models, Labs, And Public Applications.</p>
                    <Link href="/rankings"><Button variant="outline" className="bg-white text-bold">View Rankings <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                    <h2 className="text-3xl font-bold mb-2">Chat With Any LLM</h2>
                    <p className="text-1xl mb-4">Select Between 1000+ Models To Help With Any Query You Have At Hand Or Integrate Into Your Systems.</p>
                    <Link href="/chat"><Button variant="outline" className="bg-white text-bold">Chat With LLM <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                </div>
            </div>
            {/* <div>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Recent Announcements</h3>
                    <Link href="#"><Button variant="link">View all <ArrowRight className="w-4 h-4 ml-1"/></Button></Link>
                 </div>
                 <div className="space-y-4">
                    <AnnouncementCard title="GPT-5 is now live" description="GPT-5 is here on OpenRouter - long-context, built for complex reasoning and code workflows." date="8/7/2025" isNew />
                    <AnnouncementCard title="Audio Inputs and PDF URLs for Apps" description="Add voice input and send PDFs by URL, on any model." date="8/4/2025" isNew />
                    <AnnouncementCard title="Presets: How To Seamlessly Transfer Model Configurations Across Apps" description="Customize once and use everywhere. Server-side presets now simplify your model workflows." date="7/29/2025" />
                 </div>
            </div> */}
        </section>

      </main>

      {/* Footer */}
      {/* <footer className="border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-[10px] flex justify-center items-center text-sm text-muted-foreground">
            <img src="/logo_black.svg" alt="Stats" width="45px" height="45px" />
          </div>
      </footer> */}
    </div>
  );
}

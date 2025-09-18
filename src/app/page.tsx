
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ChevronRight, GitMerge, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { AppFooter } from '@/components/layout/app-footer';

const FeaturedModelCard = ({ model, isNew }: { model: { name: string, by: string, tokens: string, latency: string, growth: string, color: string }, isNew?: boolean }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-8 rounded-full ${model.color}`}></div>
        <div>
          <p className="font-semibold text-sm flex items-center">{model.name} {isNew && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full ml-2">New</span>}</p>
          <p className="text-xs text-muted-foreground">by {model.by}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <p>{model.tokens}</p>
          <p className="text-xs text-muted-foreground">Tokens/sec</p>
        </div>
        <div className="text-right">
          <p>{model.latency}</p>
          <p className="text-xs text-muted-foreground">Latency</p>
        </div>
        <div className={`text-right ${model.growth.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
          <p>{model.growth}</p>
          <p className="text-xs text-muted-foreground">Weekly growth</p>
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
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{number}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-muted-foreground pl-12">{description}</p>
    <div className="pl-12">{children}</div>
  </div>
)

const FeatureCard = ({ icon: Icon, title, description, linkText, linkHref }: { icon: React.ElementType, title: string, description: string, linkText: string, linkHref: string }) => (
  <Card className="p-6 text-center">
    <div className="flex justify-center mb-4">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-muted">
        <Icon className="w-8 h-8 text-primary"/>
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm mb-4">{description}</p>
    <Link href={linkHref}>
      <Button variant="link" className="text-primary">{linkText} <ArrowRight className="w-4 h-4 ml-1"/></Button>
    </Link>
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
  const featuredModels = [
      { name: 'Gemini 2.5 Pro', by: 'google', tokens: '170.06', latency: '2.6s', growth: '-6.83%', color: 'bg-blue-400' },
      { name: 'GPT-5 Chat', by: 'openai', tokens: '20.98', latency: '850ms', growth: '--', color: 'bg-green-400' },
      { name: 'Claude Sonnet 4', by: 'anthropic', tokens: '585.26', latency: '1.9s', growth: '-9.04%', color: 'bg-purple-400' },
  ];
  
  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter">The Unified Interface For LLMs</h1>
            <p className="text-lg text-muted-foreground">Better prices, better uptime, no subscription.</p>
            <div className="relative">
              <Input placeholder="Start a message..." className="h-12 pr-14" />
              <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Featured Models</CardTitle>
              <Link href="/rankings">
                <Button variant="link" className="text-sm">View Trending <ArrowRight className="w-4 h-4 ml-1"/></Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
                {featuredModels.map((model, i) => <FeaturedModelCard key={i} model={model} isNew={model.name.includes('GPT-5')} />)}
            </CardContent>
          </Card>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 my-24">
            <StatItem value="8.4T" label="Monthly Tokens" />
            <StatItem value="2.5M+" label="Global Users" />
            <StatItem value="60+" label="Active Providers" />
            <StatItem value="400+" label="Models" />
        </section>

        {/* How It Works Section */}
        <section className="grid md:grid-cols-3 gap-12 my-24">
            <HowItWorksStep number={1} title="Signup" description="Create an account to get started. You can set up an org for your team later.">
                <div className="p-4 bg-muted rounded-lg h-24"></div>
            </HowItWorksStep>
             <HowItWorksStep number={2} title="Buy credits" description="Credits can be used with any model or provider.">
                <div className="p-4 bg-muted rounded-lg h-24"></div>
            </HowItWorksStep>
             <HowItWorksStep number={3} title="Get your API key" description="Create an API key and start making requests. Fully OpenAI compatible.">
                <div className="p-4 bg-muted rounded-lg h-24"></div>
            </HowItWorksStep>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 my-24">
            <FeatureCard icon={Zap} title="One API for Any Model" description="Access all major models through a single, unified interface. OpenAI SDK works out of the box." linkText="Browse all" linkHref="/models" />
            <FeatureCard icon={GitMerge} title="Higher Availability" description="Reliable AI models via our distributed infrastructure. Fall back to other providers when one goes down." linkText="Learn more" linkHref="#" />
            <FeatureCard icon={TrendingUp} title="Price and Performance" description="Keep costs in check without sacrificing speed. OpenRouter runs at the edge, adding just ~25ms between your users and their inference." linkText="Learn more" linkHref="#" />
            <FeatureCard icon={ShieldCheck} title="Custom Data Policies" description="Protect your organization with fine-grained data policies. Ensure prompts only go to the models and providers you trust." linkText="View docs" linkHref="#" />
        </section>

        {/* Explore & Announcements */}
        <section className="grid md:grid-cols-2 gap-12 my-24">
            <div className="space-y-8">
                <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Explore Models</h3>
                    <p className="text-muted-foreground text-sm mb-4">Discover AI models across our collection, from all major labs and providers.</p>
                    <Link href="/models"><Button variant="outline">View models <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                </div>
                 <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Model & App Rankings</h3>
                    <p className="text-muted-foreground text-sm mb-4">Explore token usage across models, labs, and public applications.</p>
                    <Link href="/rankings"><Button variant="outline">View rankings <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                </div>
            </div>
            <div>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Recent Announcements</h3>
                    <Link href="#"><Button variant="link">View all <ArrowRight className="w-4 h-4 ml-1"/></Button></Link>
                 </div>
                 <div className="space-y-4">
                    <AnnouncementCard title="GPT-5 is now live" description="GPT-5 is here on OpenRouter - long-context, built for complex reasoning and code workflows." date="8/7/2025" isNew />
                    <AnnouncementCard title="Audio Inputs and PDF URLs for Apps" description="Add voice input and send PDFs by URL, on any model." date="8/4/2025" isNew />
                    <AnnouncementCard title="Presets: How To Seamlessly Transfer Model Configurations Across Apps" description="Customize once and use everywhere. Server-side presets now simplify your model workflows." date="7/29/2025" />
                 </div>
            </div>
        </section>

      </main>

    </div>
  );
}

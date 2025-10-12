"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowRight, Code, MessageSquare, CreditCard, Sparkles, Terminal, Book } from "lucide-react";
import Link from "next/link";
import { getUserData } from '@/lib/api';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: string;
  actionLabel?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: "welcome",
      title: "Welcome to Gatewayz",
      description: "You're all set! You have $10 in free credits to get started.",
      icon: <Sparkles className="h-5 w-5" />,
      completed: true,
    },
    {
      id: "explore",
      title: "Explore 10,000+ AI Models",
      description: "Browse our model catalog to find the perfect AI for your needs.",
      icon: <Book className="h-5 w-5" />,
      completed: false,
      action: "/models",
      actionLabel: "Browse Models"
    },
    {
      id: "chat",
      title: "Start Your First Chat",
      description: "Try chatting with any of our AI models in the playground.",
      icon: <MessageSquare className="h-5 w-5" />,
      completed: false,
      action: "/chat",
      actionLabel: "Go to Chat"
    },
    {
      id: "credits",
      title: "Add More Credits (Optional)",
      description: "When you're ready, add more credits to keep using AI models.",
      icon: <CreditCard className="h-5 w-5" />,
      completed: false,
      action: "/settings/credits",
      actionLabel: "View Credits"
    },
  ]);

  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem('gatewayz_onboarding_completed');
    if (hasSeenOnboarding) {
      // Redirect to chat if they've already completed onboarding
      router.push('/chat');
    }

    // Auto-mark first task as complete
    const userData = getUserData();
    if (userData) {
      markTaskComplete('welcome');
    }
  }, [router]);

  const markTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    ));
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('gatewayz_onboarding_completed', 'true');
    router.push('/chat');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Top Banner for SDK and Claude Code */}
      {showBanner && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  <span className="font-semibold">Developers:</span>
                </div>
                <Link
                  href="https://docs.gatewayz.ai/sdk"
                  target="_blank"
                  className="flex items-center gap-2 hover:underline transition-all"
                >
                  <Code className="h-4 w-4" />
                  <span className="text-sm">Install SDK</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="https://claude.com/claude-code"
                  target="_blank"
                  className="flex items-center gap-2 hover:underline transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">Try Claude Code</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="text-white hover:bg-white/20"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Onboarding Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Gatewayz! 🎉</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Let's get you started with a few quick tasks
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{completedCount} of {totalCount} completed</span>
            <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4 mb-8">
          {tasks.map((task, index) => (
            <Card
              key={task.id}
              className={`transition-all duration-300 ${
                task.completed
                  ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                  : 'hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${task.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {task.icon}
                        {task.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {task.description}
                      </CardDescription>
                    </div>
                  </div>
                  {task.action && !task.completed && (
                    <Link href={task.action}>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => markTaskComplete(task.id)}
                      >
                        {task.actionLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Links Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Resources</CardTitle>
            <CardDescription>Everything you need to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="https://docs.gatewayz.ai"
                target="_blank"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Book className="h-5 w-5 mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">Documentation</h3>
                <p className="text-sm text-muted-foreground">Learn how to use the platform</p>
              </Link>
              <Link
                href="https://docs.gatewayz.ai/sdk"
                target="_blank"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Code className="h-5 w-5 mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">SDK Installation</h3>
                <p className="text-sm text-muted-foreground">Integrate with your code</p>
              </Link>
              <Link
                href="https://claude.com/claude-code"
                target="_blank"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Terminal className="h-5 w-5 mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">Claude Code</h3>
                <p className="text-sm text-muted-foreground">AI-powered coding assistant</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/models')}
          >
            Browse Models
          </Button>
          <Button
            size="lg"
            onClick={handleFinishOnboarding}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Start Chatting
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={handleFinishOnboarding}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Skip onboarding and go to chat
          </button>
        </div>
      </div>
    </div>
  );
}

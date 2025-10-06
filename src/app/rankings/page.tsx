
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import TokenStackedBarChart from '@/components/TokenStackedBarChart';
import { API_BASE_URL } from '@/lib/config';
import { extractTokenValue } from '@/lib/utils';

export interface ModelData {
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
  scraped_at: string; // ISO datetime string
}

interface AppData {
  id: number;
  rank: number;
  app_name: string;
  description: string;
  tokens: string;
  is_new: boolean;
  app_url: string;
  domain: string;
  image_url: string;
  time_period: string;
  scraped_at: string; // ISO datetime string
}

const MockModelsData: ModelData[] = [
  {
    id: 1,
    rank: 1,
    model_name: "Grok Code Fast 1",
    author: "x-ai",
    tokens: "1.05T tokens",
    trend_percentage: "1%",
    trend_direction: "down",
    trend_icon: "↓",
    trend_color: "red",
    model_url: "/x-ai/grok-code-fast-1",
    author_url: "/x-ai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 2,
    rank: 2,
    model_name: "Grok 4 Fast (free)",
    author: "x-ai",
    tokens: "645B tokens",
    trend_percentage: "29%",
    trend_direction: "down",
    trend_icon: "↓",
    trend_color: "red",
    model_url: "/x-ai/grok-4-fast:free",
    author_url: "/x-ai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 3,
    rank: 3,
    model_name: "Gemini 2.5 Flash",
    author: "google",
    tokens: "363B tokens",
    trend_percentage: "5%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/google/gemini-2.5-flash",
    author_url: "/google",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 4,
    rank: 4,
    model_name: "Claude Sonnet 4",
    author: "anthropic",
    tokens: "316B tokens",
    trend_percentage: "45%",
    trend_direction: "down",
    trend_icon: "↓",
    trend_color: "red",
    model_url: "/anthropic/claude-sonnet-4",
    author_url: "/anthropic",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 5,
    rank: 5,
    model_name: "Claude Sonnet 4.5",
    author: "anthropic",
    tokens: "298B tokens",
    trend_percentage: "new",
    trend_direction: "up",
    trend_icon: "•",
    trend_color: "purple",
    model_url: "/anthropic/claude-sonnet-4.5",
    author_url: "/anthropic",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 6,
    rank: 6,
    model_name: "DeepSeek V3.1 (free)",
    author: "deepseek",
    tokens: "223B tokens",
    trend_percentage: "7%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/deepseek/deepseek-chat-v3.1:free",
    author_url: "/deepseek",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 7,
    rank: 7,
    model_name: "GPT-4.1 Mini",
    author: "openai",
    tokens: "172B tokens",
    trend_percentage: "150%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/openai/gpt-4.1-mini",
    author_url: "/openai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 8,
    rank: 8,
    model_name: "Gemini 2.0 Flash",
    author: "google",
    tokens: "141B tokens",
    trend_percentage: "12%",
    trend_direction: "down",
    trend_icon: "↓",
    trend_color: "red",
    model_url: "/google/gemini-2.0-flash-001",
    author_url: "/google",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 9,
    rank: 9,
    model_name: "Gemini 2.5 Flash Lite",
    author: "google",
    tokens: "141B tokens",
    trend_percentage: "59%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/google/gemini-2.5-flash-lite",
    author_url: "/google",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 10,
    rank: 10,
    model_name: "Gemini 2.5 Pro",
    author: "google",
    tokens: "136B tokens",
    trend_percentage: "0%",
    trend_direction: "up",
    trend_icon: "→",
    trend_color: "gray",
    model_url: "/google/gemini-2.5-pro",
    author_url: "/google",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 11,
    rank: 11,
    model_name: "DeepSeek V3 0324",
    author: "deepseek",
    tokens: "120B tokens",
    trend_percentage: "15%",
    trend_direction: "down",
    trend_icon: "↓",
    trend_color: "red",
    model_url: "/deepseek/deepseek-chat-v3-0324",
    author_url: "/deepseek",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 12,
    rank: 12,
    model_name: "Grok 4 Fast",
    author: "x-ai",
    tokens: "85.8B tokens",
    trend_percentage: "505%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/x-ai/grok-4-fast",
    author_url: "/x-ai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 13,
    rank: 13,
    model_name: "Gemma 3 12B",
    author: "google",
    tokens: "80B tokens",
    trend_percentage: "7%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/google/gemma-3-12b-it",
    author_url: "/google",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 14,
    rank: 14,
    model_name: "Claude 3.7 Sonnet",
    author: "anthropic",
    tokens: "75.7B tokens",
    trend_percentage: "15%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/anthropic/claude-3.7-sonnet",
    author_url: "/anthropic",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 15,
    rank: 15,
    model_name: "GLM 4.6",
    author: "z-ai",
    tokens: "73.9B tokens",
    trend_percentage: "new",
    trend_direction: "up",
    trend_icon: "•",
    trend_color: "purple",
    model_url: "/z-ai/glm-4.6",
    author_url: "/z-ai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 16,
    rank: 16,
    model_name: "GPT-5",
    author: "openai",
    tokens: "71B tokens",
    trend_percentage: "49%",
    trend_direction: "down",
    trend_icon: "↓",
    trend_color: "red",
    model_url: "/openai/gpt-5",
    author_url: "/openai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 17,
    rank: 17,
    model_name: "gpt-oss-20b",
    author: "openai",
    tokens: "70.7B tokens",
    trend_percentage: "3%",
    trend_direction: "down",
    trend_icon: "↓",
    trend_color: "red",
    model_url: "/openai/gpt-oss-20b",
    author_url: "/openai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 18,
    rank: 18,
    model_name: "gpt-oss-120b",
    author: "openai",
    tokens: "70B tokens",
    trend_percentage: "39%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/openai/gpt-oss-120b",
    author_url: "/openai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 19,
    rank: 19,
    model_name: "GPT-4o-mini",
    author: "openai",
    tokens: "61.6B tokens",
    trend_percentage: "4%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/openai/gpt-4o-mini",
    author_url: "/openai",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 20,
    rank: 20,
    model_name: "Llama 3.1 8B Instruct",
    author: "meta-llama",
    tokens: "59.6B tokens",
    trend_percentage: "768%",
    trend_direction: "up",
    trend_icon: "↑",
    trend_color: "green",
    model_url: "/meta-llama/llama-3.1-8b-instruct",
    author_url: "/meta-llama",
    time_period: "Top this month",
    scraped_at: "2025-10-06T00:00:00Z",
  },
];

const MockAppssData: AppData[] = [
  {
    id: 1,
    rank: 1,
    app_name: "Kilo Code",
    description: "AI coding agent for VS Code",
    tokens: "89.1B tokens",
    is_new: false,
    app_url: "https://kilocode.ai/",
    domain: "kilocode.ai",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://kilocode.ai/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 2,
    rank: 2,
    app_name: "Cline",
    description: "Autonomous coding agent right in your IDE",
    tokens: "57B tokens",
    is_new: false,
    app_url: "https://cline.bot/",
    domain: "cline.bot",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://cline.bot/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 3,
    rank: 3,
    app_name: "janitorai.com",
    description: "",
    tokens: "48.5B tokens",
    is_new: true,
    app_url: "https://janitorai.com/",
    domain: "janitorai.com",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://janitorai.com/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 4,
    rank: 4,
    app_name: "BLACKBOXAI",
    description: "AI agent for builders",
    tokens: "47.8B tokens",
    is_new: false,
    app_url: "https://blackbox.ai/",
    domain: "blackbox.ai",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://blackbox.ai/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 5,
    rank: 5,
    app_name: "liteLLM",
    description: "Open-source library to simplify LLM calls",
    tokens: "34.2B tokens",
    is_new: false,
    app_url: "https://litellm.ai/",
    domain: "litellm.ai",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://litellm.ai/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 6,
    rank: 6,
    app_name: "Roo Code",
    description: "A whole dev team of AI agents in your editor",
    tokens: "22.4B tokens",
    is_new: false,
    app_url: "https://roocode.com/",
    domain: "roocode.com",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://roocode.com/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 7,
    rank: 7,
    app_name: "SillyTavern",
    description: "LLM frontend for power users",
    tokens: "8.88B tokens",
    is_new: false,
    app_url: "https://sillytavern.app/",
    domain: "sillytavern.app",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://sillytavern.app/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 8,
    rank: 8,
    app_name: "Zread.AI",
    description: "AI code wiki with multilingual guides and architecture insights",
    tokens: "6.87B tokens",
    is_new: false,
    app_url: "https://zread.ai/",
    domain: "zread.ai",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://zread.ai/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 9,
    rank: 9,
    app_name: "Chub AI",
    description: "GenAI for everyone",
    tokens: "4.82B tokens",
    is_new: false,
    app_url: "https://chub.ai/",
    domain: "chub.ai",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://chub.ai/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 10,
    rank: 10,
    app_name: "Pax Historia",
    description: "An alternate history sandbox game",
    tokens: "4.71B tokens",
    is_new: false,
    app_url: "https://www.paxhistoria.co/",
    domain: "paxhistoria.co",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.paxhistoria.co/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 11,
    rank: 11,
    app_name: "HammerAI",
    description: "Chat with AI characters for free",
    tokens: "4.4B tokens",
    is_new: false,
    app_url: "https://www.hammerai.com/",
    domain: "hammerai.com",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.hammerai.com/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 12,
    rank: 12,
    app_name: "Sophias Lorebary",
    description: "Unofficial JanitorAI extension with advanced lorebook management",
    tokens: "3.07B tokens",
    is_new: false,
    app_url: "https://lorebary.sophiamccarty.com/",
    domain: "lorebary.sophiamccarty.com",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://lorebary.sophiamccarty.com/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 13,
    rank: 13,
    app_name: "OpenCode",
    description: "AI coding agent built for the terminal",
    tokens: "2.71B tokens",
    is_new: false,
    app_url: "https://opencode.ai/",
    domain: "opencode.ai",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://opencode.ai/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 14,
    rank: 14,
    app_name: "OpenRouter: Chatroom",
    description: "Chat with multiple LLMs at once",
    tokens: "2.55B tokens",
    is_new: false,
    app_url: "https://openrouter.ai/chat",
    domain: "openrouter.ai",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://openrouter.ai/chat&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 15,
    rank: 15,
    app_name: "GDevelop",
    description: "AI-powered game engine",
    tokens: "2.09B tokens",
    is_new: false,
    app_url: "https://gdevelop.io/",
    domain: "gdevelop.io",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://gdevelop.io/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 16,
    rank: 16,
    app_name: "New API",
    description: "LLM gateway, fork of One API",
    tokens: "2.05B tokens",
    is_new: false,
    app_url: "https://github.com/Calcium-Ion/new-api",
    domain: "github.com",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://github.com/Calcium-Ion/new-api&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 17,
    rank: 17,
    app_name: "Meetup Address Extraction Evaluation",
    description: "",
    tokens: "1.94B tokens",
    is_new: true,
    app_url: "https://github.com/ai-product-manager/meetup-analysis",
    domain: "github.com",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://github.com/ai-product-manager/meetup-analysis&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 18,
    rank: 18,
    app_name: "Infinite Worlds",
    description: "Build your own adventures, share them with friends",
    tokens: "1.21B tokens",
    is_new: false,
    app_url: "https://infiniteworlds.app/",
    domain: "infiniteworlds.app",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://infiniteworlds.app/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 19,
    rank: 19,
    app_name: "shapes inc",
    description: "General purpose social agents",
    tokens: "1.18B tokens",
    is_new: false,
    app_url: "https://shapes.inc/",
    domain: "shapes.inc",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://shapes.inc/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
  {
    id: 20,
    rank: 20,
    app_name: "TLDL: Never Take Notes Again",
    description: "",
    tokens: "1.1B tokens",
    is_new: true,
    app_url: "https://tldl.club/",
    domain: "tldl.club",
    image_url: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://tldl.club/&size=256",
    time_period: "Today",
    scraped_at: "2025-10-06T00:00:00Z",
  },
];

export default function RankingsPage() {
  const [selectedSort, setSelectedSort] = useState('All');
  const [selectedTopModelsCount, setSelectedTopModelsCount] = useState<number>(5);
  const [selectedTopCount, setSelectedTopCount] = useState('Top 10');
  const [modelLogos, setModelLogos] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);


  const [selectedTimeRangeForModels, setSelectedTimeRangeForModels] = useState("Top this month");
  const [selectedTimeRangeForApps, setSelectedTimeRangeForApps] = useState("Today");

  const [models, setModels] = useState<ModelData[]>([]);
  const [apps, setApps] = useState<AppData[]>([]);

  // Fetch model logos
  useEffect(() => {
    const fetchLogos = async () => {
      const logoMap = new Map<string, string>();

      // Map of static logos for major providers
      const staticLogos: { [key: string]: string } = {
        'google': '/google-logo.svg',
        'openai': '/openai-logo.svg',
        'anthropic': '/anthropic-logo.svg',
      };

      await Promise.all(
        models.slice(0, 20).map(async (model) => {
          try {
            // Check if we have a static logo for this author
            const authorLower = model.author.toLowerCase();
            const staticLogo = staticLogos[authorLower];
            if (staticLogo) {
              logoMap.set(model.model_name, staticLogo);
              return;
            }

            // Special handling for specific models
            let modelId = '';

            // X-AI / Grok models - use xai organization
            if (authorLower.includes('x-ai') || authorLower.includes('xai')) {
              modelId = `xai/grok-2-1212`;  // Use a known Grok model for logo
            }
            // DeepSeek models - use deepseek-ai organization
            else if (authorLower.includes('deepseek')) {
              modelId = `deepseek-ai/DeepSeek-V3`;  // Use a known DeepSeek model for logo
            }
            // Default: use author/model-name
            else {
              modelId = `${model.author}/${model.model_name.replace(/ /g, '-')}`;
            }

            const response = await fetch(`/api/model-logo?modelId=${encodeURIComponent(modelId)}`);

            if (response.ok) {
              const data = await response.json();
              if (data.model?.authorData?.avatarUrl) {
                logoMap.set(model.model_name, data.model.authorData.avatarUrl);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch logo for ${model.model_name}:`, error);
          }
        })
      );

      setModelLogos(logoMap);
    };

    fetchLogos();
  }, [models]);

  useEffect(() => {
    const getModels = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/ranking/models`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
    
        if (response.ok) {
          const result = await response.json();
          setModels(result.data);
        } else {
          setModels(MockModelsData);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    }
    const getApps = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ranking/apps`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        if (response.ok) {
          const result = await response.json();
          setApps(result.data);
        } else {
          setApps(MockAppssData);
        } 
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      } finally {
        setLoading(false);
      }
    }

    getModels();
    getApps();
  },[]);

  const filteredModels = useMemo(() => {
    return models
    .filter((model) => model.time_period === selectedTimeRangeForModels)
    .sort((a, b) => a.rank - b.rank) // ascending order
    .slice(0, selectedTopModelsCount);
  }, [selectedTopModelsCount, selectedTimeRangeForModels, models])

  const filteredApps = useMemo(() => {
    return apps
    .filter((app) => app.time_period === selectedTimeRangeForApps)
    .sort((a, b) => a.rank - b.rank) // ascending orders
  }, [selectedTimeRangeForApps, apps])

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">LLM Rankings</h1>
          <p className="mt-2 text-sm lg:text-lg">
            Discover The Current Rankings For The Best Models On The Market
          </p>
        </header>

         {/* Chart Section */}
         <div className="mb-12">
           <Card className="p-4">
             <div className="mb-2">
               <h3 className="text-base font-semibold text-gray-800">Top 10 Models - Tokens Generated</h3>
             </div>
             <TokenStackedBarChart rankingData={models} />
           </Card>
         </div>

        {/* Top 10 Models Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold">{selectedTopCount} Models</h2>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[120px] justify-between">
                    Top {" "}{selectedTopModelsCount} <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedTopModelsCount(5)}>Top 5</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTopModelsCount(10)}>Top 10</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTopModelsCount(20)}>Top 20</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    {selectedTimeRangeForModels} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRangeForModels('Top today')}>Top today</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRangeForModels('Top this week')}>Top this week</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRangeForModels('Top this month')}>Top this month</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRangeForModels('Trending')}>Trending</DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-between">
                    Sort By: {selectedSort} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedSort('All')}>All</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedSort('Tokens')}>Tokens</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Header Row - Hidden on mobile */}
          <Card className='hidden lg:flex flex-col'>
            <div className="ranking-row bg-gray-50 rounded-lg">
              <div className="col-span-2 font-semibold text-xs text-gray-600">Rank</div>
              <div className="col-span-6 font-semibold text-xs text-gray-600">AI Model</div>
              <div className="col-span-3 font-semibold text-xs text-gray-600">Model Org</div>
              <div className="col-span-3 font-semibold text-xs text-gray-600">Category</div>
              <div className="col-span-3 font-semibold text-xs text-gray-600">Top Provider</div>
              <div className="col-span-3 font-semibold text-xs text-gray-600 text-right">Tokens Generated</div>
              <div className="col-span-3 font-semibold text-xs text-gray-600 text-right">Change</div>
            </div>
          </Card>

          <div className="space-y-3 mt-3">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="p-0 overflow-hidden">
                  <div className="grid grid-cols-24 gap-2 px-6 py-2">
                    <div className="col-span-24 h-16 animate-pulse bg-gray-100 rounded"></div>
                  </div>
                </Card>
              ))
            ) : filteredModels.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-gray-500">No models found for the selected time period.</p>
              </Card>
            ) : (
              filteredModels.map((model, index) => (
                <Card key={index} className="p-0 overflow-hidden">
                  <div className="ranking-row">
                      {/* Rank - 2 columns on mobile (col-span-2), 2 on desktop */}
                      <div className="col-span-2 flex flex-col items-start justify-center gap-0">
                        <span className="font-medium text-xs">#{model.rank}</span>
                        <div className={`flex items-center gap-0.5 ${model.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {model.trend_direction === 'up' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                          <span className="text-[10px]">{model.trend_percentage}</span>
                        </div>
                      </div>

                    {/* AI Model - 7 columns on mobile (col-span-7), 6 on desktop */}
                    <div className="col-span-7 lg:col-span-6">
                      <div className="flex items-center gap-2">
                        {modelLogos.get(model.model_name) ? (
                          <div className='ranking-logo'>
                            <img
                              src={modelLogos.get(model.model_name)}
                              alt={model.model_name}
                            />
                          </div>
                        ) : (
                          <div className='w-8 h-8 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center'>
                            <span className="text-sm font-medium">{model.author.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <span className="font-medium text-xs leading-tight truncate">{model.model_name}</span>
                      </div>
                    </div>

                    {/* Model Org - hidden on mobile, 3 columns on desktop */}
                    <div className="hidden lg:flex lg:col-span-3 items-center">
                      <span className="text-xs capitalize">{model.author}</span>
                    </div>

                    {/* Category - hidden on mobile, 3 columns on desktop */}
                    <div className="hidden lg:flex lg:col-span-3 items-center">
                      <span className="text-xs">{model.category || 'Language'}</span>
                    </div>

                    {/* Top Provider - hidden on mobile, 3 columns on desktop */}
                    <div className="hidden lg:flex lg:col-span-3 items-center">
                      <span className="text-xs">{model.provider || 'OpenRouter'}</span>
                    </div>

                    {/* Tokens Generated - 3 columns on mobile and desktop */}
                    <div className="col-span-3 text-right flex items-center justify-end">
                      <span className="text-xs font-medium">{model.tokens}</span>
                    </div>

                    {/* Change - hidden on mobile, 2 columns on desktop */}
                    <div className="hidden lg:flex lg:col-span-3 text-right items-center justify-end">
                      <span className={`text-xs font-medium ${model.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {model.trend_percentage}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Top 20 Apps Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Top 20 Apps</h2>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    {selectedTimeRangeForApps} <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRangeForApps('Today')}>Today</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRangeForApps('This Week')}>This Week</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRangeForApps('This Month')}>This Month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-between">
                    Sort By: {selectedSort} <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedSort('All')}>All</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedSort('Tokens')}>Tokens</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-gray-500">
                No apps found for the selected time period.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 cursor-pointer">
              {filteredApps.map((app) => (
                <Card key={app.id} className="p-4">
                  {/* App header */}
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={app.image_url}
                      alt={app.app_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">{app.app_name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats section */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-bold">
                        {/* {app.tokens ? app.tokens.replace(/[^\d.]/g, '') : '0'} */}
                        {app.tokens ? extractTokenValue(app.tokens) : '0'}
                      </p>
                      <p className="text-xs text-gray-500">Tokens Generated</p>
                    </div>
                    {/* <div className="text-right">
                      <p className="text-lg font-bold text-green-600">---</p>
                      <p className="text-xs text-gray-500">Weekly Growth</p>
                    </div> */}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

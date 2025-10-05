
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import TokenStackedBarChart from '@/components/TokenStackedBarChart';

interface RankingModel {
  id: number;
  rank: number;
  model_name: string;
  author: string;
  tokens: string;
  trend_percentage: string;
  trend_direction: 'up' | 'down';
  trend_icon: string;
  trend_color: string;
  model_url: string;
  author_url: string;
  time_period: string;
  scraped_at: string;
  logoUrl?: string;
}

// Mock data for the rankings - 60 diverse models for testing
const topModels = [
  // Top tier models
  { rank: 1, change: 4, model: "GPT-4o", org: "OpenAI", category: "Multimodal", provider: "OpenAI", tokens: "2.1B", value: "$1.2B", changePercent: "+15.3%" },
  { rank: 2, change: 1, model: "Claude-3.5-Sonnet", org: "Anthropic", category: "Language", provider: "Anthropic", tokens: "1.8B", value: "$980M", changePercent: "+22.7%" },
  { rank: 3, change: 2, model: "Gemini-2.0-Pro", org: "Google", category: "Multimodal", provider: "Google", tokens: "1.6B", value: "$850M", changePercent: "+18.9%" },
  { rank: 4, change: 3, model: "GPT-4-Turbo", org: "OpenAI", category: "Language", provider: "OpenAI", tokens: "1.4B", value: "$720M", changePercent: "+12.4%" },
  { rank: 5, change: 1, model: "Claude-3-Opus", org: "Anthropic", category: "Language", provider: "Anthropic", tokens: "1.2B", value: "$650M", changePercent: "+8.7%" },
  
  // High performing models
  { rank: 6, change: 2, model: "Gemini-1.5-Pro", org: "Google", category: "Multimodal", provider: "Google", tokens: "980M", value: "$520M", changePercent: "+25.1%" },
  { rank: 7, change: 4, model: "Llama-3.1-405B", org: "Meta", category: "Language", provider: "Meta", tokens: "850M", value: "$480M", changePercent: "+31.2%" },
  { rank: 8, change: 1, model: "Mistral-Large", org: "Mistral AI", category: "Language", provider: "Mistral AI", tokens: "720M", value: "$420M", changePercent: "+19.8%" },
  { rank: 9, change: 3, model: "Qwen-2.5-72B", org: "Alibaba", category: "Language", provider: "Alibaba", tokens: "680M", value: "$380M", changePercent: "+27.5%" },
  { rank: 10, change: 2, model: "DeepSeek-V3", org: "DeepSeek", category: "Programming", provider: "DeepSeek", tokens: "650M", value: "$350M", changePercent: "+33.4%" },
  
  // Mid-tier models
  { rank: 11, change: 4, model: "GPT-4o-Mini", org: "OpenAI", category: "Language", provider: "OpenAI", tokens: "580M", value: "$320M", changePercent: "+16.9%" },
  { rank: 12, change: 1, model: "Claude-3-Haiku", org: "Anthropic", category: "Language", provider: "Anthropic", tokens: "520M", value: "$290M", changePercent: "+21.3%" },
  { rank: 13, change: 2, model: "Gemini-1.5-Flash", org: "Google", category: "Multimodal", provider: "Google", tokens: "480M", value: "$260M", changePercent: "+14.7%" },
  { rank: 14, change: 3, model: "Llama-3.1-70B", org: "Meta", category: "Language", provider: "Meta", tokens: "450M", value: "$240M", changePercent: "+18.2%" },
  { rank: 15, change: 1, model: "Mistral-Medium", org: "Mistral AI", category: "Language", provider: "Mistral AI", tokens: "420M", value: "$220M", changePercent: "+12.8%" },
  { rank: 16, change: 2, model: "Qwen-2.5-32B", org: "Alibaba", category: "Language", provider: "Alibaba", tokens: "380M", value: "$200M", changePercent: "+24.6%" },
  { rank: 17, change: 4, model: "DeepSeek-Coder-V2", org: "DeepSeek", category: "Programming", provider: "DeepSeek", tokens: "350M", value: "$180M", changePercent: "+29.1%" },
  { rank: 18, change: 1, model: "PaLM-2-Large", org: "Google", category: "Language", provider: "Google", tokens: "320M", value: "$160M", changePercent: "+7.4%" },
  { rank: 19, change: 3, model: "Codex-Davinci-003", org: "OpenAI", category: "Programming", provider: "OpenAI", tokens: "300M", value: "$150M", changePercent: "+11.9%" },
  { rank: 20, change: 2, model: "Claude-Instant", org: "Anthropic", category: "Language", provider: "Anthropic", tokens: "280M", value: "$140M", changePercent: "+15.7%" },
  
  // Specialized models
  { rank: 21, change: 4, model: "Stable-Diffusion-XL", org: "Stability AI", category: "Vision", provider: "Stability AI", tokens: "250M", value: "$130M", changePercent: "+22.3%" },
  { rank: 22, change: 1, model: "DALL-E-3", org: "OpenAI", category: "Vision", provider: "OpenAI", tokens: "230M", value: "$120M", changePercent: "+18.6%" },
  { rank: 23, change: 2, model: "Midjourney-V6", org: "Midjourney", category: "Vision", provider: "Midjourney", tokens: "210M", value: "$110M", changePercent: "+26.8%" },
  { rank: 24, change: 3, model: "Whisper-Large-V3", org: "OpenAI", category: "Audio & Speech Models", provider: "OpenAI", tokens: "190M", value: "$100M", changePercent: "+13.2%" },
  { rank: 25, change: 1, model: "TTS-1-HD", org: "OpenAI", category: "Audio & Speech Models", provider: "OpenAI", tokens: "170M", value: "$90M", changePercent: "+9.8%" },
  { rank: 26, change: 2, model: "MusicGen-Large", org: "Meta", category: "Audio & Speech Models", provider: "Meta", tokens: "150M", value: "$80M", changePercent: "+17.4%" },
  { rank: 27, change: 4, model: "Embedding-3-Large", org: "OpenAI", category: "Embedding Models", provider: "OpenAI", tokens: "130M", value: "$70M", changePercent: "+20.1%" },
  { rank: 28, change: 1, model: "Text-Embedding-3-Small", org: "OpenAI", category: "Embedding Models", provider: "OpenAI", tokens: "120M", value: "$65M", changePercent: "+14.7%" },
  { rank: 29, change: 3, model: "E5-Large-V2", org: "Microsoft", category: "Embedding Models", provider: "Microsoft", tokens: "110M", value: "$60M", changePercent: "+11.3%" },
  { rank: 30, change: 2, model: "BGE-Large-EN-V1.5", org: "BAAI", category: "Embedding Models", provider: "BAAI", tokens: "100M", value: "$55M", changePercent: "+16.9%" },
  
  // Domain-specific models
  { rank: 31, change: 4, model: "AlphaFold-3", org: "DeepMind", category: "Domain-Specific", provider: "DeepMind", tokens: "90M", value: "$50M", changePercent: "+28.5%" },
  { rank: 32, change: 1, model: "Gato", org: "DeepMind", category: "Reinforcement Learning", provider: "DeepMind", tokens: "85M", value: "$48M", changePercent: "+19.2%" },
  { rank: 33, change: 2, model: "PaLM-2-Medical", org: "Google", category: "Domain-Specific", provider: "Google", tokens: "80M", value: "$45M", changePercent: "+13.8%" },
  { rank: 34, change: 3, model: "BioBERT", org: "Allen Institute", category: "Domain-Specific", provider: "Allen Institute", tokens: "75M", value: "$42M", changePercent: "+8.9%" },
  { rank: 35, change: 1, model: "ClinicalBERT", org: "Microsoft", category: "Domain-Specific", provider: "Microsoft", tokens: "70M", value: "$40M", changePercent: "+12.4%" },
  { rank: 36, change: 2, model: "SciBERT", org: "Allen Institute", category: "Domain-Specific", provider: "Allen Institute", tokens: "65M", value: "$38M", changePercent: "+15.7%" },
  { rank: 37, change: 4, model: "Legal-BERT", org: "Hugging Face", category: "Domain-Specific", provider: "Hugging Face", tokens: "60M", value: "$35M", changePercent: "+21.6%" },
  { rank: 38, change: 1, model: "FinBERT", org: "Hugging Face", category: "Domain-Specific", provider: "Hugging Face", tokens: "55M", value: "$32M", changePercent: "+7.3%" },
  { rank: 39, change: 3, model: "RoBERTa-Large", org: "Facebook", category: "Language", provider: "Facebook", tokens: "50M", value: "$30M", changePercent: "+10.2%" },
  { rank: 40, change: 2, model: "DeBERTa-V3-Large", org: "Microsoft", category: "Language", provider: "Microsoft", tokens: "45M", value: "$28M", changePercent: "+14.8%" },
  
  // Smaller but growing models
  { rank: 41, change: 4, model: "T5-11B", org: "Google", category: "Language", provider: "Google", tokens: "40M", value: "$25M", changePercent: "+18.9%" },
  { rank: 42, change: 1, model: "BART-Large", org: "Facebook", category: "Language", provider: "Facebook", tokens: "38M", value: "$23M", changePercent: "+6.7%" },
  { rank: 43, change: 2, model: "ELECTRA-Large", org: "Google", category: "Language", provider: "Google", tokens: "35M", value: "$21M", changePercent: "+9.4%" },
  { rank: 44, change: 3, model: "ALBERT-XXLarge", org: "Google", category: "Language", provider: "Google", tokens: "32M", value: "$19M", changePercent: "+12.1%" },
  { rank: 45, change: 1, model: "DistilBERT", org: "Hugging Face", category: "Language", provider: "Hugging Face", tokens: "30M", value: "$17M", changePercent: "+5.8%" },
  { rank: 46, change: 2, model: "MobileBERT", org: "Google", category: "Language", provider: "Google", tokens: "28M", value: "$16M", changePercent: "+8.3%" },
  { rank: 47, change: 4, model: "TinyBERT", org: "Huawei", category: "Language", provider: "Huawei", tokens: "25M", value: "$14M", changePercent: "+16.2%" },
  { rank: 48, change: 1, model: "BERT-Base", org: "Google", category: "Language", provider: "Google", tokens: "22M", value: "$12M", changePercent: "+3.9%" },
  { rank: 49, change: 3, model: "GPT-2-Large", org: "OpenAI", category: "Language", provider: "OpenAI", tokens: "20M", value: "$11M", changePercent: "+7.6%" },
  { rank: 50, change: 2, model: "CTRL", org: "Salesforce", category: "Language", provider: "Salesforce", tokens: "18M", value: "$10M", changePercent: "+4.2%" },
  
  // Additional models for comprehensive testing
  { rank: 51, change: 4, model: "XLM-RoBERTa", org: "Facebook", category: "Language", provider: "Facebook", tokens: "16M", value: "$9M", changePercent: "+11.7%" },
  { rank: 52, change: 1, model: "mT5-Base", org: "Google", category: "Language", provider: "Google", tokens: "15M", value: "$8M", changePercent: "+6.4%" },
  { rank: 53, change: 2, model: "UniLMv2", org: "Microsoft", category: "Language", provider: "Microsoft", tokens: "14M", value: "$7M", changePercent: "+9.1%" },
  { rank: 54, change: 3, model: "ProphetNet", org: "Microsoft", category: "Language", provider: "Microsoft", tokens: "13M", value: "$6M", changePercent: "+13.8%" },
  { rank: 55, change: 1, model: "PEGASUS", org: "Google", category: "Language", provider: "Google", tokens: "12M", value: "$5M", changePercent: "+2.7%" },
  { rank: 56, change: 2, model: "BART-Base", org: "Facebook", category: "Language", provider: "Facebook", tokens: "11M", value: "$4M", changePercent: "+8.5%" },
  { rank: 57, change: 4, model: "T5-Base", org: "Google", category: "Language", provider: "Google", tokens: "10M", value: "$3M", changePercent: "+15.3%" },
  { rank: 58, change: 1, model: "GPT-2-Medium", org: "OpenAI", category: "Language", provider: "OpenAI", tokens: "9M", value: "$2M", changePercent: "+1.9%" },
  { rank: 59, change: 3, model: "DistilGPT-2", org: "Hugging Face", category: "Language", provider: "Hugging Face", tokens: "8M", value: "$1M", changePercent: "+5.6%" },
  { rank: 60, change: 2, model: "GPT-2-Small", org: "OpenAI", category: "Language", provider: "OpenAI", tokens: "7M", value: "$500K", changePercent: "+0.8%" },
];

const topApps = Array.from({ length: 20 }, (_, index) => ({
  id: `app-${index}`,
  name: "Google",
  description: "Autonomous Coding Agent...",
  tokens: "21.7B",
  growth: "+13.06%"
}));

export default function RankingsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Top This Month');
  const [selectedSort, setSelectedSort] = useState('All');
  const [selectedTopCount, setSelectedTopCount] = useState('Top 10');
  const [rankingModels, setRankingModels] = useState<RankingModel[]>([]);
  const [modelLogos, setModelLogos] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch ranking models from API
  useEffect(() => {
    const fetchRankingModels = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';
        const url = `${apiBaseUrl}/ranking/models`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setRankingModels(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch ranking models:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingModels();
  }, []);

  // Fetch model logos
  useEffect(() => {
    const fetchLogos = async () => {
      if (rankingModels.length === 0) return;

      const logoMap = new Map<string, string>();

      // Map of static logos for major providers
      const staticLogos: { [key: string]: string } = {
        'google': '/google-logo.svg',
        'openai': '/openai-logo.svg',
        'anthropic': '/anthropic-logo.svg',
      };

      await Promise.all(
        rankingModels.slice(0, 20).map(async (model) => {
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
  }, [rankingModels]);

  // Helper function to parse token values
  const parseTokens = (tokenStr: string): number => {
    const num = parseFloat(tokenStr.replace(/[BMK]/g, ''));
    if (tokenStr.includes('B')) return num * 1e9;
    if (tokenStr.includes('M')) return num * 1e6;
    if (tokenStr.includes('K')) return num * 1e3;
    return num;
  };

  // Helper function to parse value strings
  const parseValue = (valueStr: string): number => {
    const num = parseFloat(valueStr.replace(/[$BMK]/g, ''));
    if (valueStr.includes('B')) return num * 1e9;
    if (valueStr.includes('M')) return num * 1e6;
    if (valueStr.includes('K')) return num * 1e3;
    return num;
  };

  // Filter and sort the models based on selected options
  const filteredAndSortedModels = useMemo(() => {
    let filtered = [...rankingModels];

    // Filter by time period
    const timePeriodMap: { [key: string]: string } = {
      'Top This Year': 'Top this year',
      'Top This Month': 'Top this month',
      'Top This Week': 'Top this week'
    };

    const targetPeriod = timePeriodMap[selectedTimeRange];
    if (targetPeriod) {
      filtered = filtered.filter(model => model.time_period === targetPeriod);
    }

    // Apply sorting
    if (selectedSort === 'Tokens') {
      filtered.sort((a, b) => {
        const aTokens = parseTokens(a.tokens);
        const bTokens = parseTokens(b.tokens);
        return bTokens - aTokens;
      });
    } else {
      // Default sort by rank
      filtered.sort((a, b) => a.rank - b.rank);
    }

    // Apply top count filter
    const count = parseInt(selectedTopCount.replace('Top ', ''));
    filtered = filtered.slice(0, count);

    return filtered;
  }, [rankingModels, selectedTimeRange, selectedSort, selectedTopCount]);

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
             <TokenStackedBarChart rankingData={rankingModels} />
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
                    {selectedTopCount} <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedTopCount('Top 10')}>Top 10</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTopCount('Top 20')}>Top 20</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTopCount('Top 50')}>Top 50</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-between">
                    {selectedTimeRange} <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRange('Top This Year')}>Top This Year</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRange('Top This Month')}>Top This Month</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRange('Top This Week')}>Top This Week</DropdownMenuItem>
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
                  <DropdownMenuItem onSelect={() => setSelectedSort('Value')}>Value</DropdownMenuItem>
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
              <div className="col-span-2 font-semibold text-xs text-gray-600 text-right">Value</div>
              <div className="col-span-2 font-semibold text-xs text-gray-600 text-right">Change</div>
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
            ) : filteredAndSortedModels.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-gray-500">No models found for the selected time period.</p>
              </Card>
            ) : (
              filteredAndSortedModels.map((model, index) => (
                <Card key={model.id} className="p-0 overflow-hidden">
                  <div className="ranking-row">
                      {/* Rank - 2 columns on mobile (col-span-2), 2 on desktop */}
                      <div className="col-span-2 flex flex-col items-start justify-center gap-0">
                        <span className="font-medium text-xs">#{model.rank}</span>
                        <div className={`flex items-center gap-0.5 ${model.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {model.trend_direction === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
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
                      <span className="text-xs">Language</span>
                    </div>

                    {/* Top Provider - hidden on mobile, 3 columns on desktop */}
                    <div className="hidden lg:flex lg:col-span-3 items-center">
                      <span className="text-xs">OpenRouter</span>
                    </div>

                    {/* Tokens Generated - 3 columns on mobile and desktop */}
                    <div className="col-span-3 text-right flex items-center justify-end">
                      <span className="text-xs font-medium">{model.tokens}</span>
                    </div>

                    {/* Value - hidden on mobile, 2 columns on desktop */}
                    <div className="hidden lg:flex lg:col-span-2 text-right items-center justify-end">
                      <span className="text-xs font-medium">-</span>
                    </div>

                    {/* Change - hidden on mobile, 2 columns on desktop */}
                    <div className="hidden lg:flex lg:col-span-2 text-right items-center justify-end">
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
                    {selectedTimeRange} <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRange('Top This Year')}>Top This Year</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRange('Top This Month')}>Top This Month</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSelectedTimeRange('Top This Week')}>Top This Week</DropdownMenuItem>
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
                  <DropdownMenuItem onSelect={() => setSelectedSort('Value')}>Value</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
            {topApps.map((app) => (
              <Card key={app.id} className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <img src="/devicon_google.svg" alt={app.name} className="w-10 h-10 rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{app.name}</h3>
                    <p className="text-sm ">{app.description}</p>
                  </div>
                </div>
                <div className="space-y-2 flex ">
                  <div className='flex-1'>
                    <p className="text-2xl font-bold">{app.tokens}</p>
                    <p className="text-xs ">Tokens Generated</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{app.growth}</p>
                    <p className="text-xs ">Weekly Growth</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

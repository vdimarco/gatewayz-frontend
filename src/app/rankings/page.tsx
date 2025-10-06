
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

export default function RankingsPage() {
  const [selectedTopModelsCount, setSelectedTopModelsCount] = useState<number>(5);
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
            console.log(`Failed to fetch logo for ${model.model_name}:`, error);
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
          setModels([])
        }
      } catch (error) {
        console.log('Failed to fetch models:', error);
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
          setApps([]);
        }
      } catch (error) {
        console.log('Failed to fetch apps:', error);
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
            <h2 className="text-2xl lg:text-3xl font-bold">Top{" "}{selectedTopModelsCount} Models</h2>
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
                <Card key={app.id} className="p-4 flex flex-col h-full">
                  {/* App header */}
                  <div className="flex items-start gap-3 mb-4 flex-grow">
                    <img
                      src={app.image_url}
                      alt={app.app_name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="min-h-[60px]">
                      <h3 className="font-semibold">{app.app_name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats section - positioned at bottom */}
                  <div className="mt-auto">
                    <div>
                      <p className="text-2xl font-bold">
                        {app.tokens ? extractTokenValue(app.tokens) : '0'}
                      </p>
                      <p className="text-xs text-gray-500">Tokens Generated</p>
                    </div>
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

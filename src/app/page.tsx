
"use client";

import { useState } from 'react';
import ModelInsightsDashboard from '@/components/dashboard/model-insights-dashboard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { ModelData } from '@/lib/data';
import { topModels, monthlyModelTokenData, weeklyModelTokenData, yearlyModelTokenData, adjustModelDataForTimeRange } from '@/lib/data';
import { TooltipProvider } from '@/components/ui/tooltip';

const categories: ModelData['category'][] = ['Language', 'Vision', 'Multimodal', 'Audio & Speech Models', 'Code Models', 'Reinforcement Learning', 'Embedding Models', 'Domain-Specific'];

type TimeRange = 'year' | 'month' | 'week';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<ModelData['category'] | 'All'>('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('year');

  const timeRangeLabels: Record<TimeRange, string> = {
    year: 'Top This Year',
    month: 'Top This Month',
    week: 'Top This Week',
  };

  const getChartData = () => {
    switch (selectedTimeRange) {
      case 'week':
        return weeklyModelTokenData;
      case 'month':
        return monthlyModelTokenData;
      case 'year':
      default:
        return yearlyModelTokenData;
    }
  };

  const getFilteredModels = () => {
    const adjustedModels = adjustModelDataForTimeRange(topModels, selectedTimeRange);
    
    let filtered;
    if (selectedCategory === 'All') {
      filtered = [...adjustedModels];
    } else {
      filtered = adjustedModels.filter(model => model.category === selectedCategory);
    }
    
    if (filtered.length < 10 && selectedCategory !== 'All') {
        const additionalModels = topModels
            .filter(m => m.category !== selectedCategory && !filtered.find(f => f.name === m.name))
            .slice(0, 10 - filtered.length);
        filtered.push(...additionalModels);
        filtered.sort((a,b) => b.tokens - a.tokens);
    }
    
    return filtered.slice(0, 20);
  };

  const filteredModels = getFilteredModels();
  const chartData = getChartData();

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">LLM Rankings</h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline-gradient" className="w-[180px] justify-between">
                  {timeRangeLabels[selectedTimeRange]} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                <DropdownMenuItem onSelect={() => setSelectedTimeRange('year')}>Top This Year</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedTimeRange('month')}>Top This Month</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSelectedTimeRange('week')}>Top This Week</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline-gradient" className="w-[240px] justify-between">
                  Sort By: {selectedCategory} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[240px] max-h-80 overflow-y-auto">
                 <DropdownMenuItem onSelect={() => setSelectedCategory('All')}>
                  All
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onSelect={() => setSelectedCategory(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <TooltipProvider>
          <ModelInsightsDashboard models={filteredModels} chartData={chartData} timeRange={selectedTimeRange} />
        </TooltipProvider>
      </div>
    </main>
  );
}

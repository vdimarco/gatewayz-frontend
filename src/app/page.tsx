
"use client";

import { useState } from 'react';
import ModelInsightsDashboard from '@/components/dashboard/model-insights-dashboard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { ModelData } from '@/lib/data';
import { topModels } from '@/lib/data';
import { faker } from '@faker-js/faker';
import { TooltipProvider } from '@/components/ui/tooltip';

const categories: ModelData['category'][] = ['Language', 'Vision', 'Multimodal', 'Audio & Speech Models', 'Code Models', 'Reinforcement Learning Agents', 'Embedding Models', 'Scientific/Domain-Specific Models'];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<ModelData['category'] | 'All'>('All');

  const getFilteredModels = () => {
    let filtered;
    if (selectedCategory === 'All') {
      filtered = [...topModels];
    } else {
      filtered = topModels.filter(model => model.category === selectedCategory);
    }
    
    // Ensure there are at least 10 models for any category view
    if (filtered.length < 10 && selectedCategory !== 'All') {
        const additionalModels = topModels
            .filter(m => m.category !== selectedCategory && !filtered.find(f => f.name === m.name)) // get models from other cats
            .slice(0, 10 - filtered.length); // get only what's needed
        filtered.push(...additionalModels);
        filtered.sort((a,b) => b.tokens - a.tokens); // re-sort with the new models
    }
    
    return filtered.slice(0, 20);
  };

  const filteredModels = getFilteredModels();

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
                <Button variant="outline" className="w-[150px] justify-between">
                  Top This Year <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Top This Month</DropdownMenuItem>
                <DropdownMenuItem>Top All Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-between">
                  Sort By: {selectedCategory} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-80 overflow-y-auto">
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
          <ModelInsightsDashboard models={filteredModels} />
        </TooltipProvider>
      </div>
    </main>
  );
}

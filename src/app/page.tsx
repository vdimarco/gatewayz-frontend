
"use client";

import { useState } from 'react';
import ModelInsightsDashboard from '@/components/dashboard/model-insights-dashboard';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { ModelData } from '@/lib/data';
import { topModels } from '@/lib/data';

const categories: ModelData['category'][] = ['Language', 'Vision', 'Multimodal'];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<ModelData['category'] | 'All'>('All');

  const getFilteredModels = () => {
    if (selectedCategory === 'All') {
      return topModels;
    }

    const filtered = topModels.filter(model => model.category === selectedCategory);

    if (filtered.length < 10) {
      const needed = 10 - filtered.length;
      const placeholderModels: ModelData[] = [];
      for (let i = 1; i <= needed; i++) {
        placeholderModels.push({
          name: `${selectedCategory} Model ${i + filtered.length}`,
          organization: 'Generated Inc.',
          category: selectedCategory,
          provider: 'Other',
          tokens: Math.round((Math.random() * 10 + 5) * 10) / 10,
          value: `$${Math.floor(Math.random() * 500) + 100}M`,
          change: Math.round((Math.random() * 20 - 10) * 10) / 10,
        });
      }
      return [...filtered, ...placeholderModels];
    }

    return filtered;
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
                <Button variant="outline" className="w-[180px] justify-between">
                  Sort By: {selectedCategory} <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
        <ModelInsightsDashboard models={filteredModels} />
      </div>
    </main>
  );
}

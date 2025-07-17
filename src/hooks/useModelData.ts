
import { useState, useEffect, useMemo } from 'react';
import type { ModelData } from '@/lib/data';
import { topModels, monthlyModelTokenData, weeklyModelTokenData, yearlyModelTokenData, adjustModelDataForTimeRange } from '@/lib/data';

export type TimeRange = 'year' | 'month' | 'week';

export function useModelData(selectedTimeRange: TimeRange, selectedCategory: ModelData['category'] | 'All') {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = useMemo(() => {
    switch (selectedTimeRange) {
      case 'week':
        return weeklyModelTokenData;
      case 'month':
        return monthlyModelTokenData;
      case 'year':
      default:
        return yearlyModelTokenData;
    }
  }, [selectedTimeRange]);

  const filteredModels = useMemo(() => {
    if (!isClient) {
      // Return a stable, non-randomized list on the server
      const initialModels = topModels.filter(model => selectedCategory === 'All' || model.category === selectedCategory);
      return initialModels.slice(0,20);
    }
    
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
        filtered.push(...adjustModelDataForTimeRange(additionalModels, selectedTimeRange));
        filtered.sort((a,b) => b.tokens - a.tokens);
    }
    
    return filtered.slice(0, 20);
  }, [isClient, selectedTimeRange, selectedCategory]);

  return { filteredModels, chartData };
}

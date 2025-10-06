'use client';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import mockData from '@/lib/mock_token_generation_data.json';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

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
}

interface TokenStackedBarChartProps {
  rankingData?: RankingModel[];
}

const TokenStackedBarChart = ({ rankingData }: TokenStackedBarChartProps) => {
  // If we have ranking data, use it; otherwise fall back to mock data
  const useRankingData = rankingData && rankingData.length > 0;

  // Extract all labels (dates or ranks)
  const labels = useRankingData
    ? rankingData.slice(0, 10).map(model => model.model_name.split(' ').slice(0, 2).join(' '))
    : mockData.dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

  // Define consistent colors for each model
  const modelColors: Record<string, string> = {
    'DeepSeek v3': '#1e40af',
    'Claude Sonnet 4': '#ea580c',
    'Gemini 2.5 Pro': '#3b82f6',
    'Gemini 2.0 Flash': '#eab308',
    'Gemini 2.5 Flash': '#2563eb',
    'GPT-4o-mini': '#10b981',
    'Mistral Nemo': '#8b5cf6',
    'Llama 3.3': '#14b8a6',
    'Grok 3 Beta': '#4f46e5',
    'Others': '#f97316',
  };

  // Helper function to parse token values from strings like "4.8T tokens", "2.35T tokens", etc.
  const parseTokenValue = (tokenStr: string): number => {
    const num = parseFloat(tokenStr.replace(/[^\d.]/g, ''));
    if (tokenStr.includes('T')) return num * 1000; // Convert to billions for chart
    if (tokenStr.includes('B')) return num;
    if (tokenStr.includes('M')) return num / 1000;
    return num;
  };

  const datasets = useRankingData
    ? [
        {
          label: 'Tokens Generated',
          data: rankingData!.slice(0, 10).map(model => parseTokenValue(model.tokens)),
          backgroundColor: rankingData!.slice(0, 10).map((model, index) => {
            const colors = ['#1e40af', '#ea580c', '#3b82f6', '#eab308', '#2563eb', '#10b981', '#8b5cf6', '#14b8a6', '#4f46e5', '#f97316'];
            return colors[index] || '#6b7280';
          }),
        },
      ]
    : mockData.models.map(model => ({
        label: model.name,
        data: model.data.map(value => value / 1e9), // Convert to billions
        backgroundColor: modelColors[model.name] || '#6b7280',
        stack: 'Stack 0',
      }));

  const data = {
    labels,
    datasets,
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        display: !useRankingData, // Hide legend for ranking data (single dataset)
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}T tokens`;
            if (value >= 1) return `${value.toFixed(1)}B tokens`;
            return `${(value * 1000).toFixed(0)}M tokens`;
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        type: 'category',
        stacked: !useRankingData, // Only stack for mock data
        ticks: {
          font: { size: 9 },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        stacked: !useRankingData, // Only stack for mock data
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tokens (Billions)',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        ticks: {
          callback: function (value: any) {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}T`;
            if (value >= 1) return `${value.toFixed(0)}B`;
            return `${(value * 1000).toFixed(0)}M`;
          },
          font: {
            size: 10,
          },
          padding: 5,
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="w-full h-[24rem]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TokenStackedBarChart;

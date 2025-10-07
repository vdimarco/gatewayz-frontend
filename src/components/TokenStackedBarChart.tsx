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
import { ModelData } from '@/app/rankings/page';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

interface TokenStackedBarChartProps {
  rankingData?: ModelData[];
}

const TokenStackedBarChart = ({ rankingData }: TokenStackedBarChartProps) => {
  // If we have ranking data, use it; otherwise fall back to mock data
  const useRankingData = rankingData && rankingData.length > 0;

  const labels = rankingData ? rankingData.slice(0, 10).map(model => model.model_name.split(' ').slice(0, 2).join(' ')) : [];

  // Helper function to parse token values from strings like "4.8T tokens", "2.35T tokens", etc.
  const parseTokenValue = (tokenStr: string): number => {
    const num = parseFloat(tokenStr.replace(/[^\d.]/g, ''));
    if (tokenStr.includes('T')) return num * 1000; // Convert to billions for chart
    if (tokenStr.includes('B')) return num;
    if (tokenStr.includes('M')) return num / 1000;
    return num;
  };

  const datasets = rankingData ? [
    {
      label: 'Tokens Generated',
      data: rankingData!.slice(0, 10).map(model => parseTokenValue(model.tokens)),
      backgroundColor: rankingData!.slice(0, 10).map((model, index) => {
        const colors = ['#1e40af', '#ea580c', '#3b82f6', '#eab308', '#2563eb', '#10b981', '#8b5cf6', '#14b8a6', '#4f46e5', '#f97316'];
        return colors[index] || '#6b7280';
      }),
    },
  ] : [];

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

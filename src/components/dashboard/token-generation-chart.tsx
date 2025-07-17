
"use client";

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import type { ModelData } from '@/lib/data';
import { format } from 'date-fns';

interface TokenGenerationChartProps {
  models: ModelData[];
  chartData: any[];
  timeRange: 'year' | 'month' | 'week';
}

export default function TokenGenerationChart({ models, chartData: rawChartData, timeRange }: TokenGenerationChartProps) {
    const top10Models = models.slice(0, 10);
    const otherModels = models.slice(10, 20);

    const chartData = rawChartData.map(dataPoint => {
        const newDataPoint = { ...dataPoint };
        
        let othersTotal = 0;
        otherModels.forEach(model => {
            if (newDataPoint[model.name]) {
                othersTotal += newDataPoint[model.name];
                delete newDataPoint[model.name];
            }
        });
        
        newDataPoint['Others'] = othersTotal;
        return newDataPoint;
    });


    const chartConfig = top10Models.reduce((acc, model, index) => {
        acc[model.name] = {
            label: model.name,
            color: `hsl(var(--chart-${(index % 10) + 1}))`,
        };
        return acc;
    }, {} as ChartConfig);

    chartConfig['Others'] = {
        label: 'Others',
        color: 'hsl(var(--muted-foreground))',
    };
  
  const yAxisFormatter = (value: number) => {
    if (value >= 1000) return `${value / 1000}T`;
    if (value > 0) return `${value}B`;
    return '0';
  };

  const xAxisFormatter = (value: string) => {
    const date = new Date(value);
    switch (timeRange) {
        case 'year':
            return format(date, 'MMM');
        case 'month':
            return format(date, 'd');
        case 'week':
            return format(date, 'EEE');
        default:
            return value;
    }
  };
  
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Tokens Generated</CardTitle>
        <CardDescription>Unit: Trillions of Tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[450px] w-full">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
            accessibilityLayer
            barCategoryGap="5%"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={xAxisFormatter}
              interval="preserveStartEnd"
            />
            <YAxis 
              tickFormatter={yAxisFormatter}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              domain={[0, (dataMax: number) => Math.ceil(dataMax / 500) * 500]}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Legend content={({ payload }) => (
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 absolute -bottom-10 left-0 right-0">
                  {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-muted-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
            {Object.keys(chartConfig).map(modelName => (
              <Bar 
                key={modelName}
                dataKey={modelName} 
                stackId="a" 
                fill={`var(--color-${modelName})`}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

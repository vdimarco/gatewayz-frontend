
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
import { monthlyModelTokenData } from '@/lib/data';
import type { ModelData } from '@/lib/data';

interface TokenGenerationChartProps {
  models: ModelData[];
}

export default function TokenGenerationChart({ models }: TokenGenerationChartProps) {
  const chartConfig = models.reduce((acc, model, index) => {
    acc[model.name] = {
      label: model.name,
      color: `hsl(var(--chart-${(index % 10) + 1}))`,
    };
    return acc;
  }, {} as ChartConfig);
  
  const yAxisFormatter = (value: number) => {
    if (value >= 1000) return `${value / 1000}T`;
    if (value > 0) return `${value}B`;
    return '0';
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
            data={monthlyModelTokenData} 
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value, index) => {
                 // Show roughly 8 ticks
                const total = monthlyModelTokenData.length;
                const step = Math.floor(total / 8);
                if (index % step === 0 || index === total -1) {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return "";
              }}
            />
            <YAxis 
              tickFormatter={yAxisFormatter}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              domain={[0, (dataMax: number) => Math.ceil(dataMax / 500) * 500]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
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
              <Bar key={modelName} dataKey={modelName} stackId="a" fill={`var(--color-${modelName})`} radius={[2, 2, 2, 2]} barSize={20} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

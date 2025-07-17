"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
import { chartData } from '@/lib/data';

const chartConfig = {
  tokens: {
    label: "Tokens (Trillions)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function TokenGenerationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 AI Models by Token Generation</CardTitle>
        <CardDescription>Tokens generated over the past year (in trillions)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              dataKey="tokens"
              tickFormatter={(value) => `${value}T`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="tokens" fill="var(--color-tokens)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

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
import { monthlyTokenData } from '@/lib/data';

const chartConfig = {
  Language: {
    label: "Language",
    color: "hsl(var(--chart-1))",
  },
  Vision: {
    label: "Vision",
    color: "hsl(var(--chart-2))",
  },
  Multimodal: {
    label: "Multimodal",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function TokenGenerationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Generation by Category</CardTitle>
        <CardDescription>Monthly token generation over the past year (in trillions), stacked by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart 
            data={monthlyTokenData} 
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
            />
            <YAxis 
              tickFormatter={(value) => `${value}T`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="Language" stackId="a" fill="var(--color-Language)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Vision" stackId="a" fill="var(--color-Vision)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Multimodal" stackId="a" fill="var(--color-Multimodal)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

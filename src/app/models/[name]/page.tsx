
"use client";

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { models, type Model } from '@/lib/models-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { addDays, format } from 'date-fns';
import TopAppsTable from '@/components/dashboard/top-apps-table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProvidersDisplay } from '@/components/models/provider-card';
import { Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: format(addDays(new Date(), -29 + i), 'MMM d'),
    throughput: Math.floor(Math.random() * 100 + 10),
    latency: parseFloat((Math.random() * 0.5 + 0.2).toFixed(2)),
}));


const Section = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <section className="py-8">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
        <div className="mt-6">{children}</div>
    </section>
);

const ChartCard = ({ title, dataKey, yAxisFormatter }: { title: string; dataKey: "throughput" | "latency"; yAxisFormatter: (value: any) => string; }) => {
    return (
        <Dialog>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                    <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="w-6 h-6">
                            <Maximize className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DialogTrigger>
                </CardHeader>
                <CardContent>
                     <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <Tooltip
                                    formatter={(value) => [`${value}${dataKey === 'latency' ? 's' : ' tps'}`, title]}
                                    labelFormatter={(label) => format(new Date(label), "PPP")}
                                     contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                      }}
                                />
                                <Area type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={yAxisFormatter} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
             <DialogContent className="max-w-4xl h-3/4 flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="date" />
                             <YAxis tickFormatter={yAxisFormatter} />
                            <Tooltip
                                formatter={(value) => [`${value}${dataKey === 'latency' ? 's' : ' tps'}`, title]}
                                labelFormatter={(label) => format(new Date(label), "PPP")}
                                 contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                  }}
                             />
                            <Area type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function ModelProfilePage() {
    const params = useParams();
    const modelName = useMemo(() => {
        const name = params.name as string;
        return name ? decodeURIComponent(name) : '';
    }, [params.name]);

    const model = useMemo(() => {
        return models.find(m => m.name === modelName);
    }, [modelName]);
    
    const relatedModels = useMemo(() => {
      if(!model) return [];
      return models.filter(m => m.developer === model.developer && m.name !== model.name).slice(0,3);
    }, [model])


    if (!model) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <h1 className="text-2xl font-bold">Model not found.</h1>
            </div>
        );
    }

    return (
      <TooltipProvider>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{model.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{model.category}</Badge>
                            <Badge variant="outline">{model.series}</Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button>Chat</Button>
                        <Button variant="outline">Compare</Button>
                    </div>
                </div>
                 <div className="mt-4 text-muted-foreground">
                    <p>{model.description}</p>
                    <Link href="#" className="text-primary hover:underline mt-2 inline-block">Paper &rarr;</Link>
                </div>
            </header>

            <nav className="border-b">
                <div className="flex gap-6">
                    {['Overview', 'Providers', 'Apps', 'Activity', 'Uptime', 'API'].map(item => (
                        <Button key={item} variant="ghost" className="rounded-none border-b-2 border-transparent hover:border-primary data-[active]:border-primary data-[active]:text-primary">
                            {item}
                        </Button>
                    ))}
                </div>
            </nav>

            <main>
                <Section 
                  title={`Providers for ${model.name}`}
                  description="OpenRouter routes requests to the best providers that are able to handle your prompt size and parameters, with fallbacks to maximize uptime."
                >
                    <ProvidersDisplay modelName={model.name} />
                </Section>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    <ChartCard 
                        title="Throughput"
                        dataKey="throughput"
                        yAxisFormatter={(value) => `${value} tps`}
                    />
                     <ChartCard 
                        title="Latency"
                        dataKey="latency"
                        yAxisFormatter={(value) => `${value}s`}
                    />
                </div>
                
                <TopAppsTable />

                <Section title={`Uptime from our API and our providers`}>
                    <Card>
                        <CardContent className="h-[200px] p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <Tooltip 
                                        formatter={(value) => [value, "Uptime"]}
                                    />
                                    <Area type="monotone" dataKey="throughput" strokeWidth={2} stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.1)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Section>

                <Section title="Is My Data Private?">
                    <p className="text-muted-foreground">Yes, your data is private by default. See our <Link href="#" className="text-primary hover:underline">privacy policy</Link>.</p>
                </Section>

                <Section title={`More models from ${model.developer}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedModels.map(relatedModel => (
                            <Link key={relatedModel.name} href={`/models/${encodeURIComponent(relatedModel.name)}`}>
                                <Card className="hover:border-primary h-full">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold">{relatedModel.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-2 truncate">{relatedModel.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </Section>
            </main>
        </div>
        </TooltipProvider>
    );
}


"use client";

import { useParams } from 'next/navigation';
import { useMemo, useEffect, useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { addDays, format } from 'date-fns';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProvidersDisplay } from '@/components/models/provider-card';
import { Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { providerData } from '@/lib/provider-data';
import { generateChartData, generateStatsTable } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { stringToColor } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';

// Lazy load heavy components
const TopAppsTable = lazy(() => import('@/components/dashboard/top-apps-table'));

interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture: {
    input_modalities: string[];
  };
  supported_parameters: string[];
  provider_slug: string;
}

const Section = ({ title, description, children, className }: { title: string, description?: string, children: React.ReactNode, className?: string }) => (
    <section className={cn("py-8", className)}>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
        <div className="mt-6">{children}</div>
    </section>
);

const ChartCard = ({ modelName, title, dataKey, yAxisFormatter }: { modelName: string, title: string; dataKey: "throughput" | "latency"; yAxisFormatter: (value: any) => string; }) => {
    const providers = useMemo(() => providerData[modelName] || [], [modelName]);
    const chartData = useMemo(() => generateChartData(providers, dataKey), [providers, dataKey]);
    const statsTable = useMemo(() => generateStatsTable(providers, dataKey), [providers, dataKey]);
    
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
                            <LineChart data={chartData}>
                                <Tooltip
                                    formatter={(value, name) => [`${value}${dataKey === 'latency' ? 's' : ' tps'}`, name]}
                                    labelFormatter={(label) => format(new Date(label), "PPP")}
                                     contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                      }}
                                />
                                {providers.map((p, i) => (
                                     <Line key={p.name} type="monotone" dataKey={p.name} stroke={`hsl(var(--chart-${(i % 5) + 1}))`} dot={false} strokeWidth={2} />
                                ))}
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={yAxisFormatter} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
             <DialogContent className="max-w-4xl h-auto flex flex-col bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                     <p className="text-sm text-muted-foreground">Median {title} of the top providers for this model.</p>
                </DialogHeader>
                <div className="flex-grow my-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="date" tickFormatter={(label) => format(new Date(label), 'MMM d')} />
                             <YAxis tickFormatter={yAxisFormatter} />
                            <Tooltip
                                formatter={(value, name) => [`${value}${dataKey === 'latency' ? 's' : ' tps'}`, name]}
                                labelFormatter={(label) => format(new Date(label), "PPP")}
                                 contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                  }}
                             />
                            <Legend />
                            {providers.map((p, i) => (
                                <Line key={p.name} type="monotone" dataKey={p.name} stroke={`hsl(var(--chart-${(i % 5) + 1}))`} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Provider</TableHead>
                            <TableHead className="text-right">Min {title}</TableHead>
                            <TableHead className="text-right">Max {title}</TableHead>
                            <TableHead className="text-right">Avg {title}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {statsTable.map(stat => (
                            <TableRow key={stat.provider}>
                                <TableCell className="font-medium">{stat.provider}</TableCell>
                                <TableCell className="text-right">{stat.min.toFixed(2)}{dataKey === 'latency' ? 's' : ' tps'}</TableCell>
                                <TableCell className="text-right">{stat.max.toFixed(2)}{dataKey === 'latency' ? 's' : ' tps'}</TableCell>
                                <TableCell className="text-right">{stat.avg.toFixed(2)}{dataKey === 'latency' ? 's' : ' tps'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}

export default function ModelProfilePage() {
    const params = useParams();
    const [model, setModel] = useState<Model | null>(null);
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);

    const modelId = useMemo(() => {
        const id = params.name as string;
        return id ? decodeURIComponent(id) : '';
    }, [params.name]);

    useEffect(() => {
        const CACHE_KEY = 'gatewayz_models_cache';
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        const fetchModels = async () => {
            try {
                // Check cache first
                const cached = localStorage.getItem(CACHE_KEY);
                let models: Model[] = [];

                if (cached) {
                    try {
                        const { data, timestamp } = JSON.parse(cached);
                        if (Date.now() - timestamp < CACHE_DURATION) {
                            models = data;
                            setAllModels(models);
                            const foundModel = models.find((m: Model) => m.id === modelId);
                            setModel(foundModel || null);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.error('Cache parse error:', e);
                    }
                }

                // Fetch from API if no valid cache
                const response = await fetch(`${API_BASE_URL}/models?gateway=all`);
                const data = await response.json();
                models = data.data || [];

                // Cache the result
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: models,
                    timestamp: Date.now()
                }));

                setAllModels(models);
                const foundModel = models.find((m: Model) => m.id === modelId);
                setModel(foundModel || null);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, [modelId]);

    const relatedModels = useMemo(() => {
      if(!model) return [];
      return allModels.filter(m => m.provider_slug === model.provider_slug && m.id !== model.id).slice(0,3);
    }, [model, allModels]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <p className="text-muted-foreground">Loading model...</p>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <h1 className="text-2xl font-bold">Model not found.</h1>
            </div>
        );
    }

    return (
      <TooltipProvider>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-screen-2xl">
            <header className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">{model.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" style={{ backgroundColor: stringToColor(model.provider_slug) }}>{model.provider_slug}</Badge>
                            <Badge variant="outline">{Math.round(model.context_length / 1000)}K context</Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/chat?model=${encodeURIComponent(model.id)}`}>
                            <Button>Chat</Button>
                        </Link>
                        <Button variant="outline" className="hidden sm:flex">Compare</Button>
                    </div>
                </div>
                 <div className="mt-4 text-muted-foreground">
                    <p>{model.description}</p>
                </div>
            </header>

            <nav className="border-b overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="flex gap-4 lg:gap-6">
                    {['Overview', 'Providers', 'Apps', 'Activity', 'Uptime', 'API'].map(item => (
                        <Button key={item} variant="ghost" className="rounded-none border-b-2 border-transparent hover:border-primary data-[active]:border-primary data-[active]:text-primary whitespace-nowrap flex-shrink-0">
                            {item}
                        </Button>
                    ))}
                </div>
            </nav>

            <main>
                <Section 
                  title={`Providers for ${model.name}`}
                  description="OpenRouter routes requests to the best providers that are able to handle your prompt size and parameters, with fallbacks to maximize uptime."
                  className="pt-8 pb-0"
                >
                    <ProvidersDisplay modelName={model.name} />
                </Section>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    <ChartCard
                        modelName={model.name}
                        title="Throughput"
                        dataKey="throughput"
                        yAxisFormatter={(value) => `${value} tps`}
                    />
                     <ChartCard
                        modelName={model.name}
                        title="Latency"
                        dataKey="latency"
                        yAxisFormatter={(value) => `${value}s`}
                    />
                </div>

                <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading apps...</div>}>
                    <TopAppsTable />
                </Suspense>

                <Section title={`Uptime from our API and our providers`}>
                    <Card>
                        <CardContent className="h-[200px] p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={generateChartData([], 'throughput').slice(0,30)}>
                                    <Tooltip 
                                        formatter={(value) => [value, "Uptime"]}
                                    />
                                    <Area type="monotone" dataKey="value" strokeWidth={2} stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.1)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Section>

                <Section title="Is My Data Private?">
                    <p className="text-muted-foreground">Yes, your data is private by default. See our <Link href="#" className="text-primary hover:underline">privacy policy</Link>.</p>
                </Section>

                <Section title={`More models from ${model.provider_slug}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedModels.map(relatedModel => (
                            <Link key={relatedModel.id} href={`/models/${encodeURIComponent(relatedModel.id)}`}>
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

    

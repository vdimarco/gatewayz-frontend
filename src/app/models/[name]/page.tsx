
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
import { Maximize, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { providerData } from '@/lib/provider-data';
import { generateChartData, generateStatsTable } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ReactMarkdown from "react-markdown";
import { cn } from '@/lib/utils';
import { stringToColor } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';
import { models as staticModels } from '@/lib/models-data';

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

type TabType = 'Providers' | 'Activity' | 'Apps';

// Transform static model to API format
function transformStaticModel(staticModel: typeof staticModels[0]): Model {
    return {
        id: `${staticModel.developer}/${staticModel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: staticModel.name,
        description: staticModel.description,
        context_length: staticModel.context * 1000,
        pricing: {
            prompt: staticModel.inputCost.toString(),
            completion: staticModel.outputCost.toString()
        },
        architecture: {
            input_modalities: staticModel.modalities.map(m => m.toLowerCase())
        },
        supported_parameters: staticModel.supportedParameters,
        provider_slug: staticModel.developer
    };
}

export default function ModelProfilePage() {
    const params = useParams();
    const [model, setModel] = useState<Model | null>(null);
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('Providers');
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

    const modelId = useMemo(() => {
        const id = params.name as string;
        return id ? decodeURIComponent(id) : '';
    }, [params.name]);

    useEffect(() => {
        const CACHE_KEY = 'gatewayz_models_cache_v4_all_gateways';
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
        let mounted = true;

        // Load static data immediately for instant page render (only if found)
        const staticModelsTransformed = staticModels.map(transformStaticModel);
        const staticFoundModel = staticModelsTransformed.find((m: Model) => m.id === modelId);

        if (staticFoundModel && mounted) {
            setModel(staticFoundModel);
            setAllModels(staticModelsTransformed);
            setLoading(false);
        }
        // If not found in static data, keep loading=true until API data arrives

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
                            if (mounted) {
                                setAllModels(models);
                                const foundModel = models.find((m: Model) => m.id === modelId);
                                if (foundModel) {
                                    setModel(foundModel);
                                    setLoading(false);
                                    return; // Only return if model was found in cache
                                }
                                // If model not found in cache, continue to fetch from API
                                console.log(`Model ${modelId} not in cache, fetching from API...`);
                            }
                        }
                    } catch (e) {
                        console.log('Cache parse error:', e);
                    }
                }

                // Fetch from all gateways to get all models via frontend API proxy
                // Add timeout to prevent hanging
                const fetchWithTimeout = (url: string, timeout = 10000) => {
                    return Promise.race([
                        fetch(url),
                        new Promise<Response>((_, reject) =>
                            setTimeout(() => reject(new Error('Request timeout')), timeout)
                        )
                    ]);
                };

                const [openrouterRes, portkeyRes, featherlessRes] = await Promise.allSettled([
                    fetchWithTimeout(`/api/models?gateway=openrouter`),
                    fetchWithTimeout(`/api/models?gateway=portkey`),
                    fetchWithTimeout(`/api/models?gateway=featherless`)
                ]);

                const getData = async (result: PromiseSettledResult<Response>) => {
                    if (result.status === 'fulfilled') {
                        try {
                            const data = await result.value.json();
                            return data.data || [];
                        } catch (e) {
                            console.log('Error parsing gateway response:', e);
                            return [];
                        }
                    }
                    return [];
                };

                const [openrouterData, portkeyData, featherlessData] = await Promise.all([
                    getData(openrouterRes),
                    getData(portkeyRes),
                    getData(featherlessRes)
                ]);

                // Combine models from all gateways
                const allModels = [
                    ...openrouterData,
                    ...portkeyData,
                    ...featherlessData
                ];

                // Deduplicate models by ID - keep the first occurrence
                const uniqueModelsMap = new Map();
                allModels.forEach((model: any) => {
                    if (!uniqueModelsMap.has(model.id)) {
                        uniqueModelsMap.set(model.id, model);
                    }
                });
                models = Array.from(uniqueModelsMap.values());

                // Try to cache the result with compression (only essential fields)
                try {
                    // Only cache essential fields to reduce size
                    const compactModels = models.map((m: Model) => ({
                        id: m.id,
                        name: m.name,
                        description: m.description.substring(0, 200), // Truncate descriptions
                        context_length: m.context_length,
                        pricing: m.pricing,
                        architecture: m.architecture,
                        supported_parameters: m.supported_parameters,
                        provider_slug: m.provider_slug
                    }));

                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: compactModels,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    // If still too large, don't cache at all (we have static fallback)
                    console.log('Cache skipped (storage quota), using static data fallback');
                    try {
                        localStorage.removeItem(CACHE_KEY);
                        localStorage.removeItem('gatewayz_models_cache'); // Old cache key
                    } catch (clearError) {
                        // Ignore cleanup errors
                    }
                }

                if (mounted) {
                    setAllModels(models);
                    const foundModel = models.find((m: Model) => m.id === modelId);
                    // Update if found, or set to null if not found (after API fetch completes)
                    if (foundModel) {
                        setModel(foundModel);
                    } else if (!staticFoundModel) {
                        // Model not in static data and not in API - show "not found"
                        setModel(null);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.log('Failed to fetch models:', error);
                if (mounted && !staticFoundModel) {
                    setLoading(false);
                }
            }
        };

        // Fetch API data in background (non-blocking)
        fetchModels();

        return () => {
            mounted = false;
        };
    }, [modelId]);

    const relatedModels = useMemo(() => {
      if(!model) return [];
      return allModels.filter(m => m.provider_slug === model.provider_slug && m.id !== model.id).slice(0,3);
    }, [model, allModels]);

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedStates({ ...copiedStates, [id]: true });
            setTimeout(() => {
                setCopiedStates({ ...copiedStates, [id]: false });
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center flex-1">
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
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">{model.name}</h1>
                        <p className="text-sm text-muted-foreground mb-3">
                            Created Apr 14, 2025 | By <span className="text-blue-600">{model.provider_slug} AI</span>
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-black text-white hover:bg-gray-800">Free</Badge>
                            <Badge variant="secondary">Multi-Lingual</Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">Chat</Button>
                        <Link href={`/chat?model=${encodeURIComponent(model.id)}`}>
                            <Button>Create API Key</Button>
                        </Link>
                    </div>
                </div>
                 <div className="mt-6 text-muted-foreground leading-relaxed">
                    <ReactMarkdown
                        components={{
                        a: ({ children, ...props }) => (
                            <span className="text-blue-600 underline cursor-pointer" {...props}>
                            {children}
                            </span>
                        ),
                        }}
                    >
                        {model.description}
                    </ReactMarkdown>
                </div>
            </header>

            <nav className="border-b overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex gap-4 lg:gap-6">
                    {(['Providers', 'Activity', 'Apps'] as TabType[]).map(item => (
                        <Button
                            key={item}
                            variant="ghost"
                            className={cn(
                                "rounded-none border-b-2 whitespace-nowrap flex-shrink-0",
                                activeTab === item
                                    ? "border-primary text-primary"
                                    : "border-transparent hover:border-primary"
                            )}
                            onClick={() => setActiveTab(item)}
                        >
                            {item}
                        </Button>
                    ))}
                </div>
            </nav>

            <main>
                {activeTab === 'Providers' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Providers for {model.name}</h2>
                            <p className="text-sm text-muted-foreground">2 Providers</p>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[200px]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                    <img src="/OpenAI_Logo-black.svg" alt="OpenAI" className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold">OpenAI</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Tokens</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                        <TableHead className="text-right">Max Output</TableHead>
                                        <TableHead className="text-right">Input</TableHead>
                                        <TableHead className="text-right">Output</TableHead>
                                        <TableHead className="text-right">Latency</TableHead>
                                        <TableHead className="text-right">Throughput</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6"></div>
                                                <div className="flex gap-1">
                                                    <button className="w-5 h-5 text-muted-foreground hover:text-foreground">
                                                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
                                                    </button>
                                                    <button className="w-5 h-5 text-muted-foreground hover:text-foreground">
                                                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"/></svg>
                                                    </button>
                                                    <button className="w-5 h-5 text-muted-foreground hover:text-foreground">
                                                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">170.02m</TableCell>
                                        <TableCell className="text-right">$10.35m</TableCell>
                                        <TableCell className="text-right">4096k</TableCell>
                                        <TableCell className="text-right">$0.15</TableCell>
                                        <TableCell className="text-right">$0.60</TableCell>
                                        <TableCell className="text-right">0.49s</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>24.99 Tps</span>
                                                <div className="w-8 h-6 bg-green-500 rounded"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                    <img src="/OpenAI_Logo-black.svg" alt="OpenAI" className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold">OpenAI</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">170.02m</TableCell>
                                        <TableCell className="text-right">$10.35m</TableCell>
                                        <TableCell className="text-right">4096k</TableCell>
                                        <TableCell className="text-right">$0.15</TableCell>
                                        <TableCell className="text-right">$0.60</TableCell>
                                        <TableCell className="text-right">0.49s</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>24.99 Tps</span>
                                                <div className="w-8 h-6 bg-green-500 rounded"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {activeTab === 'Activity' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Recent Activity Of {model.name}</h2>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">Total usage per day on Gatewayz</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={generateChartData([], 'throughput').slice(0,90)}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(label) => format(new Date(label), 'MMM d')}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <Tooltip
                                                formatter={(value: any) => [`${(value / 1000000).toFixed(2)}M`, "Usage"]}
                                                labelFormatter={(label) => format(new Date(label), "PPP")}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--background))',
                                                    borderColor: 'hsl(var(--border))',
                                                }}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                name="Prompt Tokens"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.6}
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value2"
                                                name="Completion Tokens"
                                                stroke="#9ca3af"
                                                fill="#9ca3af"
                                                fillOpacity={0.3}
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'Apps' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Top Apps Using {model.name}</h2>
                            <div className="flex items-center gap-4">
                                <select className="border rounded px-3 py-2 text-sm">
                                    <option>Top This Year</option>
                                    <option>Top This Month</option>
                                    <option>Top This Week</option>
                                </select>
                                <select className="border rounded px-3 py-2 text-sm">
                                    <option>Sort By: All</option>
                                    <option>Sort By: Tokens</option>
                                    <option>Sort By: Growth</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1,2,3,4,5,6,7,8].map((i) => (
                                <Card key={i} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                                                    <img src="/Google_Logo-black.svg" alt="Google" className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Google</h3>
                                                    <span className="text-xs text-muted-foreground">#{i}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                            Autonomous Coding Agent That Is...
                                        </p>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-2xl font-bold">21.7B</span>
                                                <p className="text-xs text-muted-foreground">Tokens Generated</p>
                                            </div>
                                            <div className="text-green-600 font-semibold text-sm">
                                                +13.06%
                                                <span className="text-xs text-muted-foreground ml-1">Weekly Growth</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-4">
                                            View App →
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Button variant="outline">Load More</Button>
                        </div>
                    </div>
                )}

            </main>
        </div>
        </TooltipProvider>
    );
}

    

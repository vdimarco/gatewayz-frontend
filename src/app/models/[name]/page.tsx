
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

type TabType = 'Overview' | 'Providers' | 'Apps' | 'Activity' | 'Uptime' | 'API';

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
    const [activeTab, setActiveTab] = useState<TabType>('Overview');
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
                                }
                                setLoading(false);
                            }
                            return;
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
                    {/* <p>{model.description}</p> */}
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

            <nav className="border-b overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="flex gap-4 lg:gap-6">
                    {(['Overview', 'Providers', 'Apps', 'Activity', 'Uptime', 'API'] as TabType[]).map(item => (
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
                {activeTab === 'Overview' && (
                    <>
                        <Section
                          title="Model Details"
                          className="pt-8 pb-0"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Pricing</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Prompt:</span>
                                                <span className="font-medium">${model.pricing.prompt}/1M tokens</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Completion:</span>
                                                <span className="font-medium">${model.pricing.completion}/1M tokens</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Capabilities</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {model.architecture.input_modalities.map((modality) => (
                                                <Badge key={modality} variant="secondary">{modality}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
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
                    </>
                )}

                {activeTab === 'Providers' && (
                    <Section
                      title={`Providers for ${model.name}`}
                      description="Gatewayz routes requests to the best providers that are able to handle your prompt size and parameters, with fallbacks to maximize uptime."
                      className="pt-8 pb-0"
                    >
                        <ProvidersDisplay modelName={model.name} />
                    </Section>
                )}

                {activeTab === 'Apps' && (
                    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading apps...</div>}>
                        <Section title="Top Apps" className="pt-8">
                            <TopAppsTable />
                        </Section>
                    </Suspense>
                )}

                {activeTab === 'Activity' && (
                    <Section title="Recent Activity" className="pt-8">
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Activity tracking coming soon
                            </CardContent>
                        </Card>
                    </Section>
                )}

                {activeTab === 'Uptime' && (
                    <Section title={`Uptime from our API and our providers`} className="pt-8">
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
                )}

                {activeTab === 'API' && (
                    <Section title="API Documentation" className="pt-8">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">Model ID</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2"
                                            onClick={() => copyToClipboard(model.id, 'model-id')}
                                        >
                                            {copiedStates['model-id'] ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <code className="bg-muted px-3 py-2 rounded block">{model.id}</code>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">Example Request</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2"
                                            onClick={() => copyToClipboard(
`curl https://api.gatewayz.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${model.id}",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'`,
                                                'example-request'
                                            )}
                                        >
                                            {copiedStates['example-request'] ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <pre className="bg-muted p-4 rounded overflow-x-auto text-xs">
{`curl https://api.gatewayz.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${model.id}",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'`}
                                    </pre>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Supported Parameters</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {model.supported_parameters.map((param) => (
                                            <Badge key={param} variant="outline">{param}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Section>
                )}
            </main>
        </div>
        </TooltipProvider>
    );
}

    

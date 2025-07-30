
"use client";

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { models, type Model } from '@/lib/models-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { addDays, format } from 'date-fns';
import TopAppsTable from '@/components/dashboard/top-apps-table';

const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: format(addDays(new Date(), -29 + i), 'MMM d'),
    value: Math.floor(Math.random() * 100 + 10),
}));

const barChartData = Array.from({ length: 30 }, (_, i) => ({
    date: format(addDays(new Date(), -29 + i), 'MMM d'),
    'Model A': Math.floor(Math.random() * 5000),
    'Model B': Math.floor(Math.random() * 3000),
}));

const Section = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <section className="py-8">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
        <div className="mt-6">{children}</div>
    </section>
);


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
                <Section title={`Providers for ${model.name}`}>
                    <Card>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Context</TableHead>
                                        <TableHead>Input</TableHead>
                                        <TableHead>Output</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-semibold">{model.developer}</TableCell>
                                        <TableCell>{model.context}K</TableCell>
                                        <TableCell>${model.inputCost}/M</TableCell>
                                        <TableCell>${model.outputCost}/M</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Section>
                
                <Section title="Throughput">
                     <Card>
                        <CardContent className="h-[200px] p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Section>
                
                <TopAppsTable />

                <Section title={`Tokens served daily for ${model.name}`}>
                     <Card>
                        <CardContent className="h-[300px] p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData}>
                                    <CartesianGrid vertical={false}/>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="Model A" stackId="a" fill="hsl(var(--chart-1))" />
                                    <Bar dataKey="Model B" stackId="a" fill="hsl(var(--chart-2))" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Section>
                
                <Section title={`Uptime from our API and our providers`}>
                    <Card>
                        <CardContent className="h-[200px] p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" strokeWidth={2} stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.1)" />
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
    );
}


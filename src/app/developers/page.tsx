
"use client"

import { useMemo, useState, useEffect } from 'react';
import { models, type Model } from "@/lib/models-data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Search, ArrowRight, Package, BarChart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type RankingModel = {
    id: number;
    rank: number;
    model_name: string;
    author: string;
    tokens: string;
    trend_percentage: string;
    trend_direction: 'up' | 'down';
    trend_icon: string;
    trend_color: string;
    model_url: string;
    author_url: string;
    time_period: string;
    scraped_at: string;
}

type Organization = {
    id: string;
    name: string;
    author: string;
    modelCount: number;
    totalTokens: string;
    topModel: string;
    performanceChange: number;
    models: RankingModel[];
    logoUrl?: string;
}

const OrganizationCard = ({ org }: { org: Organization }) => {
    const avgTrendPercentage = org.performanceChange;
    const trendColor = avgTrendPercentage >= 0 ? 'text-green-600' : 'text-red-600';
    const trendSign = avgTrendPercentage >= 0 ? '+' : '';

    return (
        <Card className="flex flex-col bg-card border rounded-lg">
            <CardContent className="p-6 pb-2 flex-grow">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 overflow-hidden">
                        {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} className="w-12 h-12 object-cover" />
                        ) : (
                            <Bot className="w-6 h-6 text-gray-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">{org.name}</h3>
                        <p className="text-sm text-muted-foreground">{org.modelCount} Models</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold">{org.totalTokens}</p>
                            <p className="text-xs text-muted-foreground">Tokens Generated</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-bold ${trendColor}`}>
                                {trendSign}{avgTrendPercentage.toFixed(2)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Growth</p>
                        </div>
                    </div>
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">Top Model</p>
                        <p className="text-sm font-medium truncate">{org.topModel}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-4">
                <Link href={`/organizations/${encodeURIComponent(org.author)}`} className="w-full">
                    <Button variant="outline" className="w-full bg-white">
                        View Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
};


export default function DevelopersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'top' | 'trending'>('top');
    const [timeFrame, setTimeFrame] = useState<'month' | 'week' | 'today'>('month');
    const [rankingModels, setRankingModels] = useState<RankingModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [organizationLogos, setOrganizationLogos] = useState<Map<string, string>>(new Map());

    const timeFrameLabels: Record<typeof timeFrame, string> = {
        month: 'Past Month',
        week: 'Past Week',
        today: 'Today',
    };

    const timeFrameMapping: Record<typeof timeFrame, string> = {
        month: 'Top this month',
        week: 'Top this week',
        today: 'Top today',
    };

    useEffect(() => {
        const fetchRankingModels = async () => {
            try {
                setLoading(true);
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';
                const url = `${apiBaseUrl}/ranking/models`;
                console.log('Fetching ranking models from:', url);

                const response = await fetch(url);
                console.log('Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Received data:', data.success, 'models count:', data.data?.length);

                if (data.success && data.data) {
                    setRankingModels(data.data);
                    console.log('Set ranking models:', data.data.length);
                }
            } catch (error) {
                console.error('Failed to fetch ranking models:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRankingModels();
    }, []);

    // Fetch organization logos
    useEffect(() => {
        const fetchLogos = async () => {
            // Get unique authors from ranking models
            const uniqueAuthors = Array.from(new Set(rankingModels.map(m => m.author)));
            const logoMap = new Map<string, string>();

            await Promise.all(
                uniqueAuthors.map(async (author) => {
                    try {
                        // Use the first model from this author to get the logo
                        const authorModel = rankingModels.find(m => m.author === author);
                        if (!authorModel) return;

                        // Format model name for API: "author/model-name"
                        const modelId = `${author}/${authorModel.model_name.replace(/ /g, '-')}`;
                        const response = await fetch(`/api/model-logo?modelId=${encodeURIComponent(modelId)}`);

                        if (response.ok) {
                            const data = await response.json();
                            if (data.author_avatar_url) {
                                logoMap.set(author, data.author_avatar_url);
                            }
                        }
                    } catch (error) {
                        console.error(`Failed to fetch logo for ${author}:`, error);
                    }
                })
            );

            setOrganizationLogos(logoMap);
        };

        if (rankingModels.length > 0) {
            fetchLogos();
        }
    }, [rankingModels]);

    const organizations: Organization[] = useMemo(() => {
        console.log('Processing organizations, rankingModels count:', rankingModels.length);
        console.log('Active tab:', activeTab, 'Time frame:', timeFrame);

        // Filter models by time period and tab
        const timePeriod = timeFrameMapping[timeFrame];
        console.log('Looking for time period:', timePeriod);

        const filteredModels = rankingModels.filter(model => {
            if (activeTab === 'trending') {
                return model.time_period.toLowerCase() === 'trending';
            } else {
                return model.time_period.toLowerCase() === timePeriod.toLowerCase();
            }
        });

        console.log('Filtered models count:', filteredModels.length);

        // Group models by author
        const orgMap = new Map<string, RankingModel[]>();
        filteredModels.forEach(model => {
            if (!orgMap.has(model.author)) {
                orgMap.set(model.author, []);
            }
            orgMap.get(model.author)!.push(model);
        });

        // Convert to Organization objects
        return Array.from(orgMap.entries()).map(([author, models]) => {
            // Parse tokens and sum them up
            const totalTokensNum = models.reduce((sum, model) => {
                const tokensStr = model.tokens.replace(/[^0-9.]/g, '');
                const multiplier = model.tokens.includes('T') ? 1000000000000 :
                                  model.tokens.includes('B') ? 1000000000 :
                                  model.tokens.includes('M') ? 1000000 : 1;
                return sum + (parseFloat(tokensStr) || 0) * multiplier;
            }, 0);

            // Format total tokens
            const formatTokens = (num: number): string => {
                if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + 'T';
                if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                return num.toString();
            };

            // Calculate average trend percentage
            const avgTrend = models.reduce((sum, model) => {
                const trendNum = parseFloat(model.trend_percentage.replace('%', ''));
                return sum + (isNaN(trendNum) ? 0 : trendNum);
            }, 0) / models.length;

            // Get top model (highest rank, which means lowest rank number)
            const topModel = models.reduce((top, model) =>
                model.rank < top.rank ? model : top
            , models[0]);

            return {
                id: author,
                name: author.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                author: author,
                modelCount: models.length,
                totalTokens: formatTokens(totalTokensNum),
                topModel: topModel.model_name,
                performanceChange: avgTrend,
                models: models,
                logoUrl: organizationLogos.get(author),
            };
        }).sort((a, b) => {
            // Sort by total tokens (descending)
            const aTokens = parseFloat(a.totalTokens.replace(/[^0-9.]/g, ''));
            const bTokens = parseFloat(b.totalTokens.replace(/[^0-9.]/g, ''));
            return bTokens - aTokens;
        });
    }, [rankingModels, timeFrame, activeTab, organizationLogos]);

    const filteredOrgs = useMemo(() => {
        const filtered = organizations.filter(org =>
            org.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Limit to 12 organizations for clean grid layout (3 columns x 4 rows or 2 rows x 6 cols)
        return filtered.slice(0, 12);
    }, [organizations, searchTerm, activeTab]);


    return (
        <div className="min-h-[calc(100vh-130px)] bg-white">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Developers</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Discover The Organisations Building The Future Of AI
                    </p>
                </header>
                
                <div className="max-w-xl mx-auto mb-6">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Organisation..."
                            className="pr-9 bg-white border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={activeTab === 'top' ? 'default' : 'ghost'} 
                            onClick={() => setActiveTab('top')}
                            className={activeTab === 'top' ? 'bg-gray-100 text-foreground' : ''}
                        >
                            Top Models
                        </Button>
                        <Button 
                            variant={activeTab === 'trending' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('trending')}
                            className={activeTab === 'trending' ? 'bg-gray-100 text-foreground' : ''}
                        >
                            Trending
                        </Button>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[160px] justify-between">
                            {timeFrameLabels[timeFrame]} <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            <DropdownMenuItem onSelect={() => setTimeFrame('month')}>Past Month</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTimeFrame('week')}>Past Week</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setTimeFrame('today')}>Today</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <main>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <Card key={i} className="flex flex-col bg-card border rounded-lg">
                                    <CardContent className="p-6">
                                        <div className="animate-pulse space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : filteredOrgs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrgs.map(org => (
                                <OrganizationCard key={org.id} org={org} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground mt-12">
                            {searchTerm ? 'No developers found matching your search.' : 'No developers found for this time period.'}
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
}

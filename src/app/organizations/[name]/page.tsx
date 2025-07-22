
"use client";

import { useParams } from 'next/navigation';
import { topModels } from '@/lib/data';
import { models as allModelsData, type Model } from '@/lib/models-data';
import { Building, Bot, BarChart, HardHat, Package } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

const ModelCard = ({ model }: { model: Model }) => (
  <Card className="p-6 flex flex-col">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {model.name} {model.isFree && <Badge>Free</Badge>}
        </h3>
        <Badge variant="outline" className="mt-2">{model.category}</Badge>
      </div>
      <div className="text-sm text-muted-foreground whitespace-nowrap">{model.tokens}</div>
    </div>
    <p className="text-muted-foreground mt-4 text-sm flex-grow">{model.description}</p>
    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t">
      <span>by {model.developer}</span>
      <span>{model.context}K context</span>
      <span>${model.inputCost}/M input</span>
      <span>${model.outputCost}/M output</span>
    </div>
  </Card>
);

const StatCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string | number }) => (
    <Card>
        <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <p className="text-muted-foreground text-sm">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </CardContent>
    </Card>
);

export default function OrganizationPage() {
  const params = useParams();
  const organizationName = useMemo(() => {
    const name = params.name as string;
    return name ? decodeURIComponent(name) : '';
  }, [params.name]);


  const orgModels = useMemo(() => {
    return allModelsData.filter(model => model.developer.toLowerCase() === organizationName.toLowerCase());
  }, [organizationName]);

  const orgRankingData = useMemo(() => {
    return topModels.find(model => model.organization.toLowerCase() === organizationName.toLowerCase());
  }, [organizationName]);

  const totalTokens = useMemo(() => {
      const orgRankedModels = topModels.filter(m => m.organization.toLowerCase() === organizationName.toLowerCase());
      const total = orgRankedModels.reduce((acc, model) => acc + model.tokens, 0);
      return `${total.toFixed(1)}T`;
  }, [organizationName]);


  if (!organizationName) {
    return <div>Loading...</div>;
  }
  
  if (!orgRankingData && orgModels.length === 0) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h1 className="text-2xl font-bold">Organization not found.</h1>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
                <Building className="w-10 h-10 text-primary" />
                <h1 className="text-4xl font-bold">{organizationName}</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard icon={Package} title="Total Models" value={orgModels.length} />
                <StatCard icon={BarChart} title="Total Tokens" value={totalTokens} />
                <StatCard icon={HardHat} title="Top Provider" value={orgRankingData?.provider || 'N/A'} />
                <StatCard icon={Bot} title="Top Model" value={orgRankingData?.name || 'N/A'} />
            </div>
        </header>

        <main>
            <h2 className="text-2xl font-bold mb-6">Models by {organizationName}</h2>
            {orgModels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orgModels.map(model => (
                        <ModelCard key={model.name} model={model} />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No models found for this organization in the detailed list.</p>
            )}
        </main>
    </div>
  );
}

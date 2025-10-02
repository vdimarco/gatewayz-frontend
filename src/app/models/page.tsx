
"use client"

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { BookText, Bot, ChevronDown, ChevronUp, Code, FileText, ImageIcon, LayoutGrid, LayoutList, Search, Sliders as SlidersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { stringToColor } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';

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

const ModelCard = ({ model }: { model: Model }) => {
  const isFree = parseFloat(model.pricing.prompt) === 0 && parseFloat(model.pricing.completion) === 0;
  const inputCost = (parseFloat(model.pricing.prompt) * 1000000).toFixed(2);
  const outputCost = (parseFloat(model.pricing.completion) * 1000000).toFixed(2);
  const contextK = Math.round(model.context_length / 1000);

  return (
    <Link href={`/models/${encodeURIComponent(model.id)}`}>
      <Card className="p-4 sm:p-6 flex flex-col h-full hover:border-primary">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 flex-wrap">
              <span className="truncate">{model.name}</span> {isFree && <Badge>Free</Badge>}
            </h3>
            <Badge variant="outline" className="mt-2 text-xs" style={{ backgroundColor: stringToColor(model.provider_slug) }}>{model.provider_slug}</Badge>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">{contextK}K</div>
        </div>
        <p className="text-muted-foreground mt-3 sm:mt-4 text-xs sm:text-sm flex-grow line-clamp-3">{model.description}</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
          <span className="whitespace-nowrap">by {model.provider_slug}</span>
          <span className="whitespace-nowrap">{contextK}K context</span>
          <span className="whitespace-nowrap">${inputCost}/M in</span>
          <span className="whitespace-nowrap">${outputCost}/M out</span>
        </div>
      </Card>
    </Link>
  );
};

export default function ModelsPage() {
  const [layout, setLayout] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [contextLength, setContextLength] = useState(64);
  const [promptPricing, setPromptPricing] = useState(0.5);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('tokens-desc');
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/models`);
        const data = await response.json();
        setModels(data.data || []);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string, checked: boolean) => {
    setter(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedModalities([]);
    setContextLength(64);
    setPromptPricing(0.5);
    setSelectedParameters([]);
    setSelectedProviders([]);
    setSortBy('tokens-desc');
  };

  const filteredModels = useMemo(() => {
    let sortedModels = [...models];

    sortedModels.sort((a, b) => {
        switch (sortBy) {
            case 'tokens-desc':
                return b.context_length - a.context_length;
            case 'tokens-asc':
                return a.context_length - b.context_length;
            case 'price-desc':
                return (parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion)) - (parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion));
            case 'price-asc':
                return (parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion)) - (parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion));
            default:
                return 0;
        }
    });

    return sortedModels.filter((model) => {
      const searchTermMatch =
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase());

      const modalityMatch = selectedModalities.length === 0 || selectedModalities.every(m =>
        model.architecture.input_modalities.some(im => im.toLowerCase() === m.toLowerCase())
      );
      const contextMatch = model.context_length >= contextLength * 1000;
      const isFree = parseFloat(model.pricing.prompt) === 0 && parseFloat(model.pricing.completion) === 0;
      const avgPrice = (parseFloat(model.pricing.prompt) + parseFloat(model.pricing.completion)) / 2;
      const priceMatch = avgPrice <= promptPricing / 1000000 || isFree;
      const parameterMatch = selectedParameters.length === 0 || selectedParameters.every(p => model.supported_parameters.includes(p));
      const providerMatch = selectedProviders.length === 0 || selectedProviders.includes(model.provider_slug);

      return searchTermMatch && modalityMatch && contextMatch && priceMatch && parameterMatch && providerMatch;
    });
  }, [models, searchTerm, selectedModalities, contextLength, promptPricing, selectedParameters, selectedProviders, sortBy]);

  const allParameters = useMemo(() => Array.from(new Set(models.flatMap(m => m.supported_parameters))), [models]);
  const allProviders = useMemo(() => Array.from(new Set(models.map(m => m.provider_slug))), [models]);


  return (
    <SidebarProvider>
      <div className="relative flex h-[calc(100vh-theme(spacing.14))]">
        <Sidebar
          variant="sidebar"
          collapsible="icon"
          className="hidden lg:flex"
        >
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel>Input Modalities</SidebarGroupLabel>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="text-modal" checked={selectedModalities.includes('Text')} onCheckedChange={(c) => handleCheckboxChange(setSelectedModalities)('Text', !!c)} />
                  <Label htmlFor="text-modal" className="flex items-center gap-2 font-normal"><BookText className="w-4 h-4"/>Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="image-modal" checked={selectedModalities.includes('Image')} onCheckedChange={(c) => handleCheckboxChange(setSelectedModalities)('Image', !!c)} />
                  <Label htmlFor="image-modal" className="flex items-center gap-2 font-normal"><ImageIcon className="w-4 h-4"/>Image</Label>
                </div>
                  <div className="flex items-center space-x-2">
                  <Checkbox id="file-modal" checked={selectedModalities.includes('File')} onCheckedChange={(c) => handleCheckboxChange(setSelectedModalities)('File', !!c)} />
                  <Label htmlFor="file-modal" className="flex items-center gap-2 font-normal"><FileText className="w-4 h-4"/>File</Label>
                </div>
              </div>
            </SidebarGroup>

            <FilterSlider label="Context Length" value={contextLength} onValueChange={setContextLength} min={4} max={1024} step={4} unit="K" />
            <FilterSlider label="Prompt Pricing" value={promptPricing} onValueChange={setPromptPricing} min={0} max={10} step={0.1} unit="$" />

            <FilterDropdown
              label="Supported Parameters"
              items={allParameters}
              selectedItems={selectedParameters}
              onSelectionChange={handleCheckboxChange(setSelectedParameters)}
              icon={<SlidersIcon className="w-4 h-4"/>}
            />
            <FilterDropdown
              label="Providers"
              items={allProviders}
              selectedItems={selectedProviders}
              onSelectionChange={handleCheckboxChange(setSelectedProviders)}
              icon={<Bot className="w-4 h-4"/>}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-2">
                  <SidebarTrigger className="lg:hidden" />
                  <h1 className="text-xl sm:text-2xl font-bold">Models</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs sm:text-sm text-muted-foreground">{filteredModels.length} models</span>
                <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
              </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Filter models"
                  className="pl-9 bg-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="tokens-desc">Tokens (High to Low)</SelectItem>
                  <SelectItem value="tokens-asc">Tokens (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              </SelectContent>
              </Select>
              <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
              <Button
                  variant={layout === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setLayout('grid')}
              >
                  <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button
                  variant={layout === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setLayout('list')}
              >
                  <LayoutList className="w-5 h-5" />
              </Button>
              </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading models...</p>
            </div>
          ) : (
            <div
              className={
                layout === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'
                  : 'flex flex-col gap-6'
              }
            >
              {filteredModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const FilterSlider = ({ label, value, onValueChange, min, max, step, unit }: { label: string, value: number, onValueChange: (value: number) => void, min: number, max: number, step: number, unit: string }) => {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <Slider defaultValue={[value]} min={min} max={max} step={step} onValueChange={(v) => onValueChange(v[0])} />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{min}{unit}</span>
                <span>{value}{unit}</span>
                <span>{max}{unit}+</span>
            </div>
        </SidebarGroup>
    );
};

const FilterDropdown = ({ label, items, icon, selectedItems, onSelectionChange }: { label: string, items: string[], icon: React.ReactNode, selectedItems: string[], onSelectionChange: (value: string, checked: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const displayedItems = items.slice(0, 3);
  const moreItems = items.slice(3);

  return (
    <SidebarGroup>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full">
        <SidebarGroupLabel className="flex justify-between items-center cursor-pointer">
            <span className="flex items-center gap-2">{icon} {label}</span>
            {isOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
        </SidebarGroupLabel>
      </button>
      {isOpen && (
        <div className="flex flex-col gap-2 mt-2">
          {displayedItems.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox id={item.toLowerCase()} checked={selectedItems.includes(item)} onCheckedChange={(c) => onSelectionChange(item, !!c)} />
              <Label htmlFor={item.toLowerCase()} className="font-normal">{item}</Label>
            </div>
          ))}
          {moreItems.length > 0 && <Label className="font-normal text-muted-foreground">More...</Label>}
        </div>
      )}
    </SidebarGroup>
  );
};

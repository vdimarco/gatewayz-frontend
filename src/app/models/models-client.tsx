"use client"

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { BookText, Bot, ChevronDown, ChevronUp, FileText, ImageIcon, LayoutGrid, LayoutList, Search, Sliders as SlidersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { stringToColor } from '@/lib/utils';

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
  const isFree = parseFloat(model.pricing?.prompt || '0') === 0 && parseFloat(model.pricing?.completion || '0') === 0;
  const inputCost = (parseFloat(model.pricing?.prompt || '0') * 1000000).toFixed(2);
  const outputCost = (parseFloat(model.pricing?.completion || '0') * 1000000).toFixed(2);
  const contextK = model.context_length > 0 ? Math.round(model.context_length / 1000) : 0;

  return (
    <Link href={`/models/${encodeURIComponent(model.id)}`} className="h-full">
      <Card className="p-5 flex flex-col h-full hover:border-primary transition-colors">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold flex items-center gap-2 flex-wrap mb-2">
              <span className="truncate">{model.name}</span> {isFree && <Badge className="text-xs">Free</Badge>}
            </h3>
            <Badge variant="outline" className="text-xs" style={{ backgroundColor: stringToColor(model.provider_slug) }}>{model.provider_slug}</Badge>
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0 font-medium">{contextK > 0 ? `${contextK}K` : 'Pending'}</div>
        </div>
        <p className="text-muted-foreground text-sm flex-grow line-clamp-2 mb-4">{model.description || 'No description available'}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-3 border-t">
          <span className="whitespace-nowrap">{contextK > 0 ? `${contextK}K context` : 'Pending sync'}</span>
          <span className="whitespace-nowrap">${inputCost}/M in</span>
          <span className="whitespace-nowrap">${outputCost}/M out</span>
        </div>
      </Card>
    </Link>
  );
};

export default function ModelsClient({ initialModels }: { initialModels: Model[] }) {
  const [layout, setLayout] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [contextLength, setContextLength] = useState(64);
  const [promptPricing, setPromptPricing] = useState(0.5);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('tokens-desc');

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
    let sortedModels = [...initialModels];

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
        (model.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      const modalityMatch = selectedModalities.length === 0 || selectedModalities.every(m =>
        model.architecture?.input_modalities?.some(im => im.toLowerCase() === m.toLowerCase())
      );
      // Include models with context_length of 0 (pending metadata sync)
      const contextMatch = model.context_length === 0 || model.context_length >= contextLength * 1000;
      const isFree = parseFloat(model.pricing?.prompt || '0') === 0 && parseFloat(model.pricing?.completion || '0') === 0;
      const avgPrice = (parseFloat(model.pricing?.prompt || '0') + parseFloat(model.pricing?.completion || '0')) / 2;
      const priceMatch = avgPrice <= promptPricing / 1000000 || isFree;
      const parameterMatch = selectedParameters.length === 0 || selectedParameters.every(p => (model.supported_parameters || []).includes(p));
      const providerMatch = selectedProviders.length === 0 || selectedProviders.includes(model.provider_slug);

      return searchTermMatch && modalityMatch && contextMatch && priceMatch && parameterMatch && providerMatch;
    });
  }, [initialModels, searchTerm, selectedModalities, contextLength, promptPricing, selectedParameters, selectedProviders, sortBy]);

  const allParameters = useMemo(() => Array.from(new Set(initialModels.flatMap(m => m.supported_parameters))), [initialModels]);
  const allProviders = useMemo(() => Array.from(new Set(initialModels.map(m => m.provider_slug))), [initialModels]);


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
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <h1 className="text-2xl font-bold">Models</h1>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm text-muted-foreground">{filteredModels.length} models</span>
                <Button variant="ghost" size="sm" onClick={resetFilters}>Reset Filters</Button>
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

          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6'
                : 'flex flex-col gap-4 lg:gap-6 max-w-5xl'
            }
          >
            {filteredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
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

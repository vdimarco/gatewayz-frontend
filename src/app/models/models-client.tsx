"use client"

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { BookText, Bot, ChevronDown, ChevronUp, FileText, ImageIcon, LayoutGrid, LayoutList, Search, Sliders as SlidersIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { stringToColor } from '@/lib/utils';

interface Model {
  id: string;
  name: string;
  description: string | null;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  } | null;
  architecture: {
    input_modalities: string[] | null;
    output_modalities: string[] | null;
  } | null;
  supported_parameters: string[] | null;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [layout, setLayout] = useState("list");
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedInputFormats, setSelectedInputFormats] = useState<string[]>(searchParams.get('inputFormats')?.split(',').filter(Boolean) || []);
  const [selectedOutputFormats, setSelectedOutputFormats] = useState<string[]>(searchParams.get('outputFormats')?.split(',').filter(Boolean) || []);
  const [contextLength, setContextLength] = useState(parseInt(searchParams.get('contextLength') || '4'));
  const [promptPricing, setPromptPricing] = useState(parseFloat(searchParams.get('promptPricing') || '10'));
  const [selectedParameters, setSelectedParameters] = useState<string[]>(searchParams.get('parameters')?.split(',').filter(Boolean) || []);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(searchParams.get('providers')?.split(',').filter(Boolean) || []);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'tokens-desc');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.set('search', searchTerm);
    if (selectedInputFormats.length > 0) params.set('inputFormats', selectedInputFormats.join(','));
    if (selectedOutputFormats.length > 0) params.set('outputFormats', selectedOutputFormats.join(','));
    if (contextLength !== 4) params.set('contextLength', contextLength.toString());
    if (promptPricing !== 10) params.set('promptPricing', promptPricing.toString());
    if (selectedParameters.length > 0) params.set('parameters', selectedParameters.join(','));
    if (selectedProviders.length > 0) params.set('providers', selectedProviders.join(','));
    if (sortBy !== 'tokens-desc') params.set('sortBy', sortBy);

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '/models', { scroll: false });
  }, [searchTerm, selectedInputFormats, selectedOutputFormats, contextLength, promptPricing, selectedParameters, selectedProviders, sortBy, router]);

  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string, checked: boolean) => {
    setter(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedInputFormats([]);
    setSelectedOutputFormats([]);
    setContextLength(4);
    setPromptPricing(10);
    setSelectedParameters([]);
    setSelectedProviders([]);
    setSortBy('tokens-desc');
  };

  // Calculate search matches separately from other filters
  const searchFilteredModels = useMemo(() => {
    if (!debouncedSearchTerm) return initialModels;

    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return initialModels.filter((model) => {
      return (model.name || '').toLowerCase().includes(lowerSearch) ||
        (model.description || '').toLowerCase().includes(lowerSearch) ||
        (model.id || '').toLowerCase().includes(lowerSearch) ||
        (model.provider_slug || '').toLowerCase().includes(lowerSearch);
    });
  }, [initialModels, debouncedSearchTerm]);

  const filteredModels = useMemo(() => {
    // First filter, then sort
    const filtered = searchFilteredModels.filter((model) => {
      const inputFormatMatch = selectedInputFormats.length === 0 || selectedInputFormats.every(m =>
        model.architecture?.input_modalities?.some(im => im.toLowerCase() === m.toLowerCase())
      );
      const outputFormatMatch = selectedOutputFormats.length === 0 || selectedOutputFormats.every(m =>
        model.architecture?.output_modalities?.some(om => om.toLowerCase() === m.toLowerCase())
      );
      // Include models with context_length of 0 (pending metadata sync)
      const contextMatch = model.context_length === 0 || model.context_length >= contextLength * 1000;
      const isFree = parseFloat(model.pricing?.prompt || '0') === 0 && parseFloat(model.pricing?.completion || '0') === 0;
      const avgPrice = (parseFloat(model.pricing?.prompt || '0') + parseFloat(model.pricing?.completion || '0')) / 2;
      const priceMatch = avgPrice <= promptPricing / 1000000 || isFree;
      const parameterMatch = selectedParameters.length === 0 || selectedParameters.every(p => (model.supported_parameters || []).includes(p));
      const providerMatch = selectedProviders.length === 0 || selectedProviders.includes(model.provider_slug);

      return inputFormatMatch && outputFormatMatch && contextMatch && priceMatch && parameterMatch && providerMatch;
    });

    // Then sort the filtered results
    const sorted = [...filtered];
    sorted.sort((a, b) => {
        switch (sortBy) {
            case 'tokens-desc':
                return b.context_length - a.context_length;
            case 'tokens-asc':
                return a.context_length - b.context_length;
            case 'price-desc':
                return (parseFloat(b.pricing?.prompt || '0') + parseFloat(b.pricing?.completion || '0')) - (parseFloat(a.pricing?.prompt || '0') + parseFloat(a.pricing?.completion || '0'));
            case 'price-asc':
                return (parseFloat(a.pricing?.prompt || '0') + parseFloat(a.pricing?.completion || '0')) - (parseFloat(b.pricing?.prompt || '0') + parseFloat(b.pricing?.completion || '0'));
            default:
                return 0;
        }
    });

    return sorted;
  }, [searchFilteredModels, selectedInputFormats, selectedOutputFormats, contextLength, promptPricing, selectedParameters, selectedProviders, sortBy]);

  const allInputFormats = useMemo(() => Array.from(new Set(initialModels.flatMap(m => m.architecture?.input_modalities || []))).filter(Boolean), [initialModels]);
  const allOutputFormats = useMemo(() => Array.from(new Set(initialModels.flatMap(m => m.architecture?.output_modalities || []))).filter(Boolean), [initialModels]);
  const allParameters = useMemo(() => Array.from(new Set(initialModels.flatMap(m => m.supported_parameters || []))), [initialModels]);
  const allProviders = useMemo(() => Array.from(new Set(initialModels.map(m => m.provider_slug).filter(Boolean))), [initialModels]);


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
              <SidebarGroupLabel>Input Formats</SidebarGroupLabel>
              <div className="flex flex-col gap-2">
                {allInputFormats.map((format) => {
                  const icon = format.toLowerCase() === 'text' ? <BookText className="w-4 h-4"/> :
                               format.toLowerCase() === 'image' ? <ImageIcon className="w-4 h-4"/> :
                               format.toLowerCase() === 'file' ? <FileText className="w-4 h-4"/> : null;
                  return (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={`input-${format.toLowerCase()}`}
                        checked={selectedInputFormats.includes(format)}
                        onCheckedChange={(c) => handleCheckboxChange(setSelectedInputFormats)(format, !!c)}
                      />
                      <Label htmlFor={`input-${format.toLowerCase()}`} className="flex items-center gap-2 font-normal capitalize">
                        {icon}{format}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Output Formats</SidebarGroupLabel>
              <div className="flex flex-col gap-2">
                {allOutputFormats.map((format) => {
                  const icon = format.toLowerCase() === 'text' ? <BookText className="w-4 h-4"/> :
                               format.toLowerCase() === 'image' ? <ImageIcon className="w-4 h-4"/> :
                               format.toLowerCase() === 'file' ? <FileText className="w-4 h-4"/> : null;
                  return (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={`output-${format.toLowerCase()}`}
                        checked={selectedOutputFormats.includes(format)}
                        onCheckedChange={(c) => handleCheckboxChange(setSelectedOutputFormats)(format, !!c)}
                      />
                      <Label htmlFor={`output-${format.toLowerCase()}`} className="flex items-center gap-2 font-normal capitalize">
                        {icon}{format}
                      </Label>
                    </div>
                  );
                })}
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
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <h1 className="text-2xl font-bold">Models</h1>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm text-muted-foreground">
                  {debouncedSearchTerm && filteredModels.length !== searchFilteredModels.length
                    ? `${filteredModels.length} of ${searchFilteredModels.length} models`
                    : `${filteredModels.length} models`}
                </span>
                <Button variant="ghost" size="sm" onClick={resetFilters}>Reset Filters</Button>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {selectedInputFormats.map(format => (
                <Badge key={`input-${format}`} variant="secondary" className="gap-1">
                  Input: {format}
                  <button onClick={() => setSelectedInputFormats(prev => prev.filter(f => f !== format))} className="ml-1 hover:bg-muted rounded-sm">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedOutputFormats.map(format => (
                <Badge key={`output-${format}`} variant="secondary" className="gap-1">
                  Output: {format}
                  <button onClick={() => setSelectedOutputFormats(prev => prev.filter(f => f !== format))} className="ml-1 hover:bg-muted rounded-sm">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedParameters.map(param => (
                <Badge key={param} variant="secondary" className="gap-1">
                  {param}
                  <button onClick={() => setSelectedParameters(prev => prev.filter(p => p !== param))} className="ml-1 hover:bg-muted rounded-sm">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedProviders.map(provider => (
                <Badge key={provider} variant="secondary" className="gap-1">
                  {provider}
                  <button onClick={() => setSelectedProviders(prev => prev.filter(p => p !== provider))} className="ml-1 hover:bg-muted rounded-sm">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
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
  const [showAll, setShowAll] = useState(false);

  const displayedItems = showAll ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

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
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {showAll ? 'Show less...' : `More... (${items.length - 3} more)`}
            </button>
          )}
        </div>
      )}
    </SidebarGroup>
  );
};


"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronRight, ChevronsUpDown, Loader2, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ModelOption = {
    value: string;
    label: string;
    category: string;
    sourceGateway?: string;
    developer?: string;
};

interface ModelSelectProps {
    selectedModel: ModelOption | null;
    onSelectModel: (model: ModelOption | null) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';

const CACHE_KEY = 'gatewayz_models_cache_v4_all_gateways';
const FAVORITES_KEY = 'gatewayz_favorite_models';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - longer cache for better performance

// Extract developer from model ID (e.g., "openai/gpt-4" -> "OpenAI")
const getDeveloper = (modelId: string): string => {
  const parts = modelId.split('/');
  if (parts.length > 1) {
    const dev = parts[0];
    // Capitalize and format common developers
    const formatted: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google': 'Google',
      'meta-llama': 'Meta',
      'mistralai': 'Mistral AI',
      'cohere': 'Cohere',
      'amazon': 'Amazon',
      'microsoft': 'Microsoft',
      'deepseek': 'DeepSeek',
      'qwen': 'Qwen',
      'x-ai': 'xAI'
    };
    return formatted[dev] || dev.charAt(0).toUpperCase() + dev.slice(1);
  }
  return 'Other';
};

export function ModelSelect({ selectedModel, onSelectModel }: ModelSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [models, setModels] = React.useState<ModelOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set())
  const [expandedDevelopers, setExpandedDevelopers] = React.useState<Set<string>>(new Set(['Favorites']))

  // Load favorites from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        console.log('Failed to load favorites:', e);
      }
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (modelId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  React.useEffect(() => {
    async function fetchModels() {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Models loaded from cache (v4):', data.length);
            setModels(data);
            return;
          } else {
            console.log('Cache expired, fetching fresh data');
          }
        } catch (e) {
          console.log('Cache parse error:', e);
        }
      } else {
        console.log('No cache found, fetching from API');
      }

      // Fetch from all gateways to get all models
      setLoading(true);
      try {
        console.log('Fetching models from API proxy...');
        // Fetch from OpenRouter, Portkey, and Featherless separately via frontend API proxy
        const [openrouterRes, portkeyRes, featherlessRes] = await Promise.all([
          fetch(`/api/models?gateway=openrouter`),
          fetch(`/api/models?gateway=portkey`),
          fetch(`/api/models?gateway=featherless`)
        ]);

        console.log('Fetch responses:', {
          openrouter: openrouterRes.status,
          portkey: portkeyRes.status,
          featherless: featherlessRes.status
        });

        const [openrouterData, portkeyData, featherlessData] = await Promise.all([
          openrouterRes.json(),
          portkeyRes.json(),
          featherlessRes.json()
        ]);

        // Combine models from all gateways
        const allModels = [
          ...(openrouterData.data || []),
          ...(portkeyData.data || []),
          ...(featherlessData.data || [])
        ];

        console.log('Models fetched from API:', {
          openrouter: openrouterData.data?.length || 0,
          portkey: portkeyData.data?.length || 0,
          featherless: featherlessData.data?.length || 0,
          total: allModels.length
        });

        // Deduplicate models by ID - keep the first occurrence
        const uniqueModelsMap = new Map();
        allModels.forEach((model: any) => {
          if (!uniqueModelsMap.has(model.id)) {
            uniqueModelsMap.set(model.id, model);
          }
        });
        const uniqueModels = Array.from(uniqueModelsMap.values());

        console.log(`After deduplication: ${uniqueModels.length} unique models`);

        const modelOptions: ModelOption[] = uniqueModels.map((model: any) => {
          const sourceGateway = model.source_gateway || 'openrouter';
          const promptPrice = Number(model.pricing?.prompt ?? 0);
          const completionPrice = Number(model.pricing?.completion ?? 0);
          const isPaid = promptPrice > 0 || completionPrice > 0;
          const category = sourceGateway === 'portkey' ? 'Portkey' : (isPaid ? 'Paid' : 'Free');
          const developer = getDeveloper(model.id);

          return {
            value: model.id,
            label: model.name,
            category,
            sourceGateway,
            developer,
          };
        });
        setModels(modelOptions);

        // Try to cache the results, but don't fail if quota exceeded
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: modelOptions,
            timestamp: Date.now()
          }));
          console.log('Model options cached:', modelOptions.length);
        } catch (e) {
          console.log('Failed to cache models (storage quota exceeded), clearing old cache');
          try {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem('gatewayz_models_cache');
          } catch (clearError) {
            console.log('Failed to clear cache:', clearError);
          }
        }
        console.log('Model options set:', modelOptions.length);
      } catch (error) {
        console.log('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  // Group models by developer and sort by model count (descending)
  const modelsByDeveloper = React.useMemo(() => {
    const groups: Record<string, ModelOption[]> = {};

    models.forEach(model => {
      const dev = model.developer || 'Other';
      if (!groups[dev]) {
        groups[dev] = [];
      }
      groups[dev].push(model);
    });

    // Sort developers by model count (descending), then alphabetically
    return Object.keys(groups)
      .sort((a, b) => {
        const countDiff = groups[b].length - groups[a].length;
        if (countDiff !== 0) return countDiff;
        return a.localeCompare(b);
      })
      .reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {} as Record<string, ModelOption[]>);
  }, [models]);

  // Get favorite models
  const favoriteModels = React.useMemo(() => {
    return models.filter(m => favorites.has(m.value));
  }, [models, favorites]);

  const toggleDeveloper = (developer: string) => {
    setExpandedDevelopers(prev => {
      const next = new Set(prev);
      if (next.has(developer)) {
        next.delete(developer);
      } else {
        next.add(developer);
      }
      return next;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between bg-muted/30 hover:bg-muted/50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
              <span className="truncate">Loading...</span>
            </>
          ) : selectedModel ? (
            <span className="truncate">{selectedModel.label}</span>
          ) : (
            <span className="truncate">Select model...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>No model found.</CommandEmpty>

            {/* Favorites Section */}
            {favoriteModels.length > 0 && (
              <div className="border-b">
                <button
                  onClick={() => toggleDeveloper('Favorites')}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-semibold hover:bg-muted"
                >
                  {expandedDevelopers.has('Favorites') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>Favorites ({favoriteModels.length})</span>
                </button>
                {expandedDevelopers.has('Favorites') && (
                  <div className="pb-2">
                    {favoriteModels.map((model) => (
                      <CommandItem
                        key={model.value}
                        value={model.label}
                        onSelect={(currentValue) => {
                          const selected = models.find(m => m.label.toLowerCase() === currentValue.toLowerCase());
                          onSelectModel(selected || null);
                          setOpen(false);
                        }}
                        className="cursor-pointer pl-8 pr-2"
                      >
                        <Star
                          className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0 cursor-pointer"
                          onClick={(e) => toggleFavorite(model.value, e)}
                        />
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            selectedModel?.value === model.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate flex-1">{model.label}</span>
                      </CommandItem>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Developer Groups */}
            {Object.entries(modelsByDeveloper).map(([developer, devModels]) => (
              <div key={developer} className="border-b last:border-0">
                <button
                  onClick={() => toggleDeveloper(developer)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-semibold hover:bg-muted"
                >
                  {expandedDevelopers.has(developer) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>{developer} ({devModels.length})</span>
                </button>
                {expandedDevelopers.has(developer) && (
                  <div className="pb-2">
                    {devModels.map((model) => (
                      <CommandItem
                        key={model.value}
                        value={model.label}
                        onSelect={(currentValue) => {
                          const selected = models.find(m => m.label.toLowerCase() === currentValue.toLowerCase());
                          onSelectModel(selected || null);
                          setOpen(false);
                        }}
                        className="cursor-pointer pl-8 pr-2 group"
                      >
                        <Star
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0 cursor-pointer transition-colors",
                            favorites.has(model.value)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30 hover:text-yellow-400"
                          )}
                          onClick={(e) => toggleFavorite(model.value, e)}
                        />
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            selectedModel?.value === model.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate flex-1">{model.label}</span>
                      </CommandItem>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

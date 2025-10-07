
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
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
};

interface ModelSelectProps {
    selectedModel: ModelOption | null;
    onSelectModel: (model: ModelOption | null) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';

const CACHE_KEY = 'gatewayz_models_cache_v2_all';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function ModelSelect({ selectedModel, onSelectModel }: ModelSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [models, setModels] = React.useState<ModelOption[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    async function fetchModels() {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Models loaded from cache:', data.length);
            setModels(data);
            return;
          }
        } catch (e) {
          console.log('Cache parse error:', e);
        }
      }

      // Fetch from API
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/models?gateway=all`);
        const data = await response.json();
        console.log('Models fetched from API:', data.data?.length || 0);
        const modelOptions: ModelOption[] = (data.data || []).map((model: any) => {
          const sourceGateway = model.source_gateway || 'openrouter';
          const promptPrice = Number(model.pricing?.prompt ?? 0);
          const completionPrice = Number(model.pricing?.completion ?? 0);
          const isPaid = promptPrice > 0 || completionPrice > 0;
          const category = sourceGateway === 'portkey' ? 'Portkey' : (isPaid ? 'Paid' : 'Free');

          return {
            value: model.id,
            label: model.name,
            category,
            sourceGateway,
          };
        });
        setModels(modelOptions);

        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: modelOptions,
          timestamp: Date.now()
        }));
        console.log('Model options set:', modelOptions.length);
      } catch (error) {
        console.log('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  const modelGroups = React.useMemo(() => {
    return models.reduce((groups, model) => {
      const category = model.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(model);
      return groups;
    }, {} as Record<string, typeof models>);
  }, [models])

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
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No model found.</CommandEmpty>
            {Object.entries(modelGroups).map(([groupName, groupModels]) => (
                <CommandGroup key={groupName} heading={groupName}>
                    {groupModels.map((model) => (
                    <CommandItem
                        key={model.value}
                        value={model.label}
                        disabled={false}
                        onSelect={(currentValue) => {
                            const selected = models.find(m => m.label.toLowerCase() === currentValue.toLowerCase());
                            onSelectModel(selected || null);
                            setOpen(false);
                        }}
                        className="cursor-pointer"
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            selectedModel?.value === model.value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        <span className="truncate">{model.label}</span>
                    </CommandItem>
                    ))}
                </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

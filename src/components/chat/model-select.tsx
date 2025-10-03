
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
};

interface ModelSelectProps {
    selectedModel: ModelOption | null;
    onSelectModel: (model: ModelOption | null) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';

export function ModelSelect({ selectedModel, onSelectModel }: ModelSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [models, setModels] = React.useState<ModelOption[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch(`${API_BASE_URL}/models`);
        const data = await response.json();
        const modelOptions: ModelOption[] = (data.data || []).map((model: any) => ({
          value: model.id,
          label: model.name,
          category: model.pricing?.prompt ? 'Paid' : 'Free'
        }));
        setModels(modelOptions);
      } catch (error) {
        console.error('Failed to fetch models:', error);
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
          className="w-[200px] justify-between bg-muted/30 hover:bg-muted/50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : selectedModel ? (
            selectedModel.label
          ) : (
            "Select model..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {Object.entries(modelGroups).map(([groupName, groupModels]) => (
                <CommandGroup key={groupName} heading={groupName}>
                    {groupModels.map((model) => (
                    <CommandItem
                        key={model.value}
                        value={model.value}
                        onSelect={(currentValue) => {
                            const selected = models.find(m => m.value === currentValue);
                            onSelectModel(selected || null);
                            setOpen(false);
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            selectedModel?.value === model.value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        {model.label}
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

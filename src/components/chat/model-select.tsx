
"use client"

import * as React from "use-client"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

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
import { models } from "@/lib/models-data"

const allModels = models.map(model => ({
    value: model.name.toLowerCase(),
    label: model.name,
    category: model.series
}));

const modelGroups = allModels.reduce((groups, model) => {
    const category = model.category;
    if (!groups[category]) {
        groups[category] = [];
    }
    groups[category].push(model);
    return groups;
}, {} as Record<string, typeof allModels>);


export function ModelSelect() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? allModels.find((model) => model.value === value)?.label
            : "Select model..."}
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
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            value === model.value ? "opacity-100" : "opacity-0"
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

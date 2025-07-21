"use client"

import { useState } from 'react';
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
import { models, type Model } from "@/lib/models-data";
import { BookText, Bot, ChevronDown, ChevronUp, Code, FileText, ImageIcon, LayoutGrid, LayoutList, Search } from 'lucide-react';

const ModelCard = ({ model }: { model: Model }) => (
  <Card className="p-6">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {model.name} {model.isFree && <Badge>Free</Badge>}
        </h3>
        <Badge variant="outline" className="mt-2">{model.category}</Badge>
      </div>
      <div className="text-sm text-muted-foreground">{model.tokens}</div>
    </div>
    <p className="text-muted-foreground mt-4 text-sm">{model.description}</p>
    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
      <span>by {model.developer}</span>
      <span>{model.context}K context</span>
      <span>${model.inputCost}/M input tokens</span>
      <span>${model.outputCost}/M output tokens</span>
    </div>
  </Card>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
    {children}
  </span>
);

export default function ModelsPage() {
  const [layout, setLayout] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
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
                    <Checkbox id="text-modal" />
                    <Label htmlFor="text-modal" className="flex items-center gap-2 font-normal"><BookText className="w-4 h-4"/>Text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="image-modal" />
                    <Label htmlFor="image-modal" className="flex items-center gap-2 font-normal"><ImageIcon className="w-4 h-4"/>Image</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <Checkbox id="file-modal" />
                    <Label htmlFor="file-modal" className="flex items-center gap-2 font-normal"><FileText className="w-4 h-4"/>File</Label>
                  </div>
                </div>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Context Length</SidebarGroupLabel>
                <Slider defaultValue={[64]} max={1000} step={1} />
                 <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>4K</span>
                    <span>64K</span>
                    <span>1M</span>
                </div>
              </SidebarGroup>
              
               <SidebarGroup>
                <SidebarGroupLabel>Prompt Pricing</SidebarGroupLabel>
                <Slider defaultValue={[0.5]} max={10} step={0.1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>FREE</span>
                    <span>$0.5</span>
                    <span>$10+</span>
                </div>
              </SidebarGroup>

              <FilterDropdown label="Series" items={["GPT", "Claude", "Gemini", "More..."]} icon={<Bot className="w-4 h-4"/>} />
              <FilterDropdown label="Categories" items={["Programming", "Roleplay", "Marketing", "More..."]} icon={<Code className="w-4 h-4"/>} />
              <FilterDropdown label="Supported Parameters" items={["tools", "temperature", "top_p", "More..."]} icon={<ChevronDown className="w-4 h-4"/>} />
              <FilterDropdown label="Providers" items={["AI21", "AionLabs", "Alibaba", "More..."]} icon={<ChevronUp className="w-4 h-4"/>} />
            </SidebarContent>
          </Sidebar>

          <SidebarInset className="flex-1">
            <div className="p-0 md:p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <h1 className="text-2xl font-bold">Models</h1>
                </div>
                <span className="text-sm text-muted-foreground">{filteredModels.length} models</span>
                <Button variant="ghost">Reset Filters</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter models"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <Select>
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
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-6'
                }
            >
                {filteredModels.map((model) => (
                <ModelCard key={model.name} model={model} />
                ))}
            </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

const FilterDropdown = ({ label, items, icon }: { label: string, items: string[], icon: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
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
          {items.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Label htmlFor={item.toLowerCase()} className="font-normal">{item}</Label>
            </div>
          ))}
        </div>
      )}
    </SidebarGroup>
  );
};

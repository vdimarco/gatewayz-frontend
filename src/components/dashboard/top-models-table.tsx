import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ModelData } from '@/lib/data';
import { ArrowUp, ArrowDown, Bot, Building, Eye, MessageSquare, Boxes, Server, Box, Code, Sliders, Puzzle, Dna, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<ModelData['category'], React.ElementType> = {
  Language: MessageSquare,
  Vision: Eye,
  Multimodal: Boxes,
  'Audio & Speech Models': Mic,
  'Code Models': Code,
  'Reinforcement Learning Agents': Puzzle,
  'Embedding Models': Sliders,
  'Scientific/Domain-Specific Models': Dna,
};

const providerIcons: Record<ModelData['provider'], React.ElementType> = {
  OpenAI: Bot,
  Google: Bot,
  Anthropic: Bot,
  Meta: Bot,
  Mistral: Bot,
  Other: Server,
};

interface TopModelsTableProps {
  models: ModelData[];
}

export default function TopModelsTable({ models }: TopModelsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 20 Models</CardTitle>
        <CardDescription>Detailed comparison of leading AI models.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="hidden sm:table-cell">Organization</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Provider</TableHead>
              <TableHead className="text-right">Tokens (T)</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Value</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => {
              const CategoryIcon = categoryIcons[model.category] || Box;
              const ProviderIcon = providerIcons[model.provider] || Server;
              const isPositiveChange = model.change >= 0;

              return (
                <TableRow key={model.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span>{model.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{model.organization}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                      <CategoryIcon className="h-3 w-3" />
                      {model.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <div className="flex items-center gap-2">
                      <ProviderIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{model.provider}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{model.tokens.toFixed(1)}T</TableCell>
                  <TableCell className="hidden lg:table-cell text-right">{model.value}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn('flex items-center justify-end gap-1', isPositiveChange ? 'text-green-400' : 'text-red-400')}>
                      {isPositiveChange ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {Math.abs(model.change)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

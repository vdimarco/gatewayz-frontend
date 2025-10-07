"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReasoningDisplayProps {
  reasoning: string;
  className?: string;
}

export function ReasoningDisplay({ reasoning, className }: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!reasoning) return null;

  return (
    <div className={cn("mb-4 rounded-lg border bg-muted/50", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 p-3 text-left hover:bg-muted/80 transition-colors rounded-lg"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        )}
        <BrainCircuit className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-muted-foreground">
          {isExpanded ? 'Hide' : 'Show'} Reasoning
        </span>
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap">
          {reasoning}
        </div>
      )}
    </div>
  );
}

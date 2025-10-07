"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export type StreamingMessageProps = {
  content: string;
  reasoning?: string;
  modelName?: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
};

export function StreamingMessage({ content, reasoning, modelName, isStreaming, onRegenerate }: StreamingMessageProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "AI Response",
          text: content,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(content);
        toast({
          title: "Copied!",
          description: "Response copied to clipboard (share not supported)",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share response",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Reasoning Section */}
      {reasoning && (
        <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Reasoning {isStreaming && !content ? '(thinking...)' : ''}
              </span>
              {!isStreaming && reasoning && (
                <span className="text-xs text-muted-foreground">
                  (thought for {Math.round(reasoning.length / 50)}s)
                </span>
              )}
            </div>
            {showReasoning ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showReasoning && (
            <div className="p-3 pt-0 text-sm text-muted-foreground prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {reasoning}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {content && (
        <div className="rounded-lg p-3 bg-white border">
          <div className="flex items-center justify-between mb-2">
            {modelName && <p className="text-xs font-semibold">{modelName}</p>}
          </div>
          <div className="text-sm prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  return !inline ? (
                    <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
          </div>
          {/* Action Buttons - always visible in bottom right */}
          {!isStreaming && (
            <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Copy response"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Share response"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title="Regenerate response"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

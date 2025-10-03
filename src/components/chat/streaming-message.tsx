"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
};

export function StreamingMessage({ content, reasoning, modelName, isStreaming }: StreamingMessageProps) {
  const [showReasoning, setShowReasoning] = useState(false);

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
          {modelName && <p className="text-xs font-semibold mb-1">{modelName}</p>}
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
        </div>
      )}
    </div>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button>Create API Key</Button>
      </div>
      <p className="text-muted-foreground flex items-center gap-1">
        Create a new API key to access all models from OpenRouter <Info className="inline h-4 w-4" />
      </p>
    </div>
  );
}

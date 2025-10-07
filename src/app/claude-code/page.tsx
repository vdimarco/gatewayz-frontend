"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal, Key, Code, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { getApiKey } from "@/lib/api";

export default function ClaudeCodePage() {
  const { toast } = useToast();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { ready, authenticated, login } = usePrivy();
  const [apiKey, setApiKey] = useState('YOUR_API_KEY');

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  // Load API key when authenticated
  useEffect(() => {
    const loadApiKey = () => {
      const userApiKey = getApiKey();
      if (userApiKey) {
        setApiKey(userApiKey);
      }
    };

    loadApiKey();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gatewayz_api_key') {
        loadApiKey();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also poll for changes every second
    const interval = setInterval(loadApiKey, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [authenticated]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [id]: true });
      toast({ title: "Copied to clipboard" });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [id]: false });
      }, 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => copyToClipboard(text, id)}
    >
      {copiedStates[id] ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  const npmInstall = "npm install -g @anthropic-ai/claude-code";
  const curlCommand = `curl https://api.gatewayz.ai/v1/chat/completions\\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer ${apiKey}" \\
-d '{
  "model": "anthropic/claude-sonnet-4",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}'`;

  const pythonCode = `import requests
import json

API_URL = "https://api.gatewayz.ai/v1/chat/completions"
API_KEY = "${apiKey}"  # ⚠️ Don't share this publicly!

def chat(prompt):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    data = {
        "model": "anthropic/claude-sonnet-4",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(API_URL, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        res_json = response.json()
        message = res_json["choices"][0]["message"]["content"]
        print(f"\\n🧠 AI: {message}\\n")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")

def main():
    print("=== Gatewayz AI Terminal Chat ===")
    print("Type 'exit' to quit.\\n")

    while True:
        user_input = input("💬 You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("👋 Goodbye!")
            break
        chat(user_input)

if __name__ == "__main__":
    main()`;

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Gatewayz Claude Code Guide</h1>
        <p className="text-xl text-muted-foreground">
          Integrate Claude AI into your development workflow with Gatewayz API
        </p>
      </div>

      {/* Step 1: Install Claude Code */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <Terminal className="h-6 w-6" />
            Install Claude Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-sm flex items-center justify-between">
            <code>{npmInstall}</code>
            <CopyButton text={npmInstall} id="npm-install" />
          </div>
          <p className="text-muted-foreground">
            Or download from{" "}
            <a
              href="https://claude.ai/code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              claude.ai/code
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Step 2: Get Gatewayz API Key */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <Key className="h-6 w-6" />
            Get Gatewayz API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              Sign up at{" "}
              <a
                href="https://beta.gatewayz.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                beta.gatewayz.ai
              </a>
            </li>
            <li>Click on your profile and navigate to API Keys</li>
            <li>Generate your API key</li>
          </ol>
          <Link href="/settings/keys">
            <Button className="w-full sm:w-auto">
              Go to API Keys →
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Step 3: API Request */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <Code className="h-6 w-6" />
            API Request to Communicate with AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
            <div className="absolute top-2 right-2">
              <CopyButton text={curlCommand} id="curl-command" />
            </div>
            <pre className="text-xs sm:text-sm">{curlCommand}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Python Integration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              4
            </div>
            <Terminal className="h-6 w-6" />
            Claude Terminal Integration Python Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
            <div className="absolute top-2 right-2">
              <CopyButton text={pythonCode} id="python-code" />
            </div>
            <pre className="text-xs sm:text-sm">{pythonCode}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Run and Code Faster */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              5
            </div>
            <Play className="h-6 w-6" />
            Run the Python File and Code Faster with Claude
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Save the code above as <code className="bg-muted px-2 py-1 rounded">chat.py</code> and run:
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm flex items-center justify-between">
            <code>python chat.py</code>
            <CopyButton text="python chat.py" id="run-python" />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Tip:</strong> Use Claude Code with Gatewayz API to access multiple AI models,
              save costs, and build faster with intelligent routing and caching.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/settings/keys">
            <Button size="lg" className="w-full sm:w-auto">
              Get Your API Key
            </Button>
          </Link>
          <a
            href="https://docs.gatewayz.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Documentation
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

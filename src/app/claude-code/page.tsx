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

  const macosSetupScript = `#!/usr/bin/env bash
# Usage:  chmod +x setup-claude-openrouter.sh
#         ./setup-claude-openrouter.sh

set -euo pipefail

# 0) Ask for OpenRouter key if not present
if [[ -z "\${OPENROUTER_API_KEY:-}" ]]; then
  read -r -p "Enter your OpenRouter API key (starts with or- ): " OPENROUTER_API_KEY
  if [[ -z "$OPENROUTER_API_KEY" ]]; then echo "No key provided"; exit 1; fi
  export OPENROUTER_API_KEY
fi

# 1) Install Node via NVM
if [[ ! -d "$HOME/.nvm" ]]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts

# Ensure npm global bin is on PATH now and later
NPM_BIN="$(npm bin -g)"
case ":$PATH:" in
  *":$NPM_BIN:"*) ;;
  *) export PATH="$NPM_BIN:$PATH"; echo "export PATH=\\"$NPM_BIN:\\$PATH\\"" >> "$HOME/.zshrc" ;;
esac

# 2) Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 3) Create a tiny OpenRouter proxy
PROXY_DIR="$HOME/claude-openrouter-proxy"
mkdir -p "$PROXY_DIR"
cat > "$PROXY_DIR/proxy.mjs" <<"EOF"
import http from 'node:http';

const PORT = process.env.PORT || 3000;
const OR_KEY = process.env.OPENROUTER_API_KEY;
if (!OR_KEY) { console.error('OPENROUTER_API_KEY not set'); process.exit(1); }

function textFromContent(block) {
  if (!block) return '';
  if (typeof block === 'string') return block;
  if (Array.isArray(block)) return block.map(b => b?.text || '').join('\\n');
  if (block.text) return block.text;
  return '';
}
function mapMessages(anthropicMsgs = [], system) {
  const msgs = [];
  if (system) msgs.push({ role: 'system', content: typeof system === 'string' ? system : textFromContent(system) });
  for (const m of anthropicMsgs) msgs.push({ role: m.role, content: textFromContent(m.content) });
  return msgs;
}

async function handleMessages(req, res, body) {
  const payload = JSON.parse(body || '{}');
  const { model, messages, system, temperature = 0.2, max_tokens = 4096 } = payload || {};
  const chosen = model || process.env.REASONING_MODEL || process.env.COMPLETION_MODEL || 'anthropic/claude-3.5-haiku';

  const chatBody = { model: chosen, messages: mapMessages(messages, system), temperature, max_tokens };
  const headers = {
    'Authorization': \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
    'Content-Type': 'application/json'
  };
  if (process.env.HTTP_REFERER) headers['HTTP-Referer'] = process.env.HTTP_REFERER;
  if (process.env.X_TITLE) headers['X-Title'] = process.env.X_TITLE;

  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST', headers, body: JSON.stringify(chatBody)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    res.writeHead(resp.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: txt } }));
    return;
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  const usage = data?.usage || {};

  const out = {
    id: \`msg_\${Date.now()}\`,
    type: 'message',
    role: 'assistant',
    model: chosen,
    content: [{ type: 'text', text: content }],
    stop_reason: 'end_turn',
    usage: {
      input_tokens: usage.prompt_tokens,
      output_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens
    }
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(out));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (req.method === 'POST' && req.url === '/v1/messages') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => handleMessages(req, res, body).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: String(err) } }));
    }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: { message: 'Not found' } }));
});
server.listen(PORT, () => console.log(\`OpenRouter proxy on http://127.0.0.1:\${PORT}\`));
EOF

# 4) Start proxy in background
export HTTP_REFERER="https://yourapp.example"
export X_TITLE="Vaughn-CLI"
cd "$PROXY_DIR"
nohup node proxy.mjs > proxy.log 2>&1 & echo $! > proxy.pid
sleep 1

# 5) Point Claude Code at the proxy and launch
export ANTHROPIC_BASE_URL="http://127.0.0.1:3000"
export ANTHROPIC_CUSTOM_HEADERS=$'HTTP-Referer: https://yourapp.example\\nX-Title: Vaughn-CLI'

# Optional default model mapping
export COMPLETION_MODEL="anthropic/claude-3.5-haiku"
export REASONING_MODEL="anthropic/claude-sonnet-4.5"

claude
`;
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

      {/* macOS Automated Setup */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <Terminal className="h-6 w-6" />
            macOS Automated Setup Script
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This script automatically installs Node.js, Claude Code CLI, and sets up an OpenRouter proxy for macOS users.
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto relative max-h-96 overflow-y-auto">
            <div className="absolute top-2 right-2 z-10">
              <CopyButton text={macosSetupScript} id="macos-setup" />
            </div>
            <pre>{macosSetupScript}</pre>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>📝 Instructions:</strong>
            </p>
            <ol className="text-sm text-amber-900 dark:text-amber-100 list-decimal ml-5 mt-2 space-y-1">
              <li>Save the script as <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">setup-claude-openrouter.sh</code></li>
              <li>Make it executable: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">chmod +x setup-claude-openrouter.sh</code></li>
              <li>Run it: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">./setup-claude-openrouter.sh</code></li>
              <li>Enter your OpenRouter API key when prompted</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Python Integration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              3
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

      {/* Step 4: Run and Code Faster */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              4
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

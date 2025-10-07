"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal, Key, Code, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { getApiKey } from "@/lib/api";

type OSType = 'macos' | 'windows' | 'linux';

export default function ClaudeCodePage() {
  const { toast } = useToast();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { ready, authenticated, login } = usePrivy();
  const [apiKey, setApiKey] = useState('YOUR_API_KEY');
  const [selectedOS, setSelectedOS] = useState<OSType>('macos');

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  // Detect OS on mount
  useEffect(() => {
    const detectOS = (): OSType => {
      if (typeof window === 'undefined') return 'macos';

      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) return 'windows';
      if (userAgent.includes('linux')) return 'linux';
      if (userAgent.includes('mac')) return 'macos';

      return 'macos';
    };

    setSelectedOS(detectOS());
  }, []);

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
# Usage:  chmod +x setup-claude-gatewayz.sh
#         ./setup-claude-gatewayz.sh

set -euo pipefail

# 0) Ask for Gatewayz API key if not present
if [[ -z "\${GATEWAYZ_API_KEY:-}" ]]; then
  read -r -p "Enter your Gatewayz API key (starts with gw_): " GATEWAYZ_API_KEY
  if [[ -z "$GATEWAYZ_API_KEY" ]]; then echo "No key provided"; exit 1; fi
  export GATEWAYZ_API_KEY
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

# 3) Create Gatewayz proxy for Claude Code
PROXY_DIR="$HOME/claude-gatewayz-proxy"
mkdir -p "$PROXY_DIR"
cat > "$PROXY_DIR/proxy.mjs" <<"EOF"
import http from 'node:http';

const PORT = process.env.PORT || 3000;
const GW_KEY = process.env.GATEWAYZ_API_KEY;
if (!GW_KEY) { console.error('GATEWAYZ_API_KEY not set'); process.exit(1); }

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
    'Authorization': \`Bearer \${process.env.GATEWAYZ_API_KEY}\`,
    'Content-Type': 'application/json'
  };

  const resp = await fetch('https://api.gatewayz.ai/v1/chat/completions', {
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
server.listen(PORT, () => console.log(\`Gatewayz proxy on http://127.0.0.1:\${PORT}\`));
EOF

# 4) Start proxy in background
cd "$PROXY_DIR"
nohup node proxy.mjs > proxy.log 2>&1 & echo $! > proxy.pid
sleep 1

# 5) Point Claude Code at the proxy and launch
export ANTHROPIC_BASE_URL="http://127.0.0.1:3000"

# Optional default model mapping
export COMPLETION_MODEL="anthropic/claude-3.5-haiku"
export REASONING_MODEL="anthropic/claude-sonnet-4.5"

claude
`;

  const windowsSetupScript = `@echo off
REM Usage: setup-claude-gatewayz.bat

REM 0) Ask for Gatewayz API key if not present
if "%GATEWAYZ_API_KEY%"=="" (
  set /p GATEWAYZ_API_KEY="Enter your Gatewayz API key (starts with gw_): "
  if "%GATEWAYZ_API_KEY%"=="" (
    echo No key provided
    exit /b 1
  )
)

REM 1) Install Node.js (user should have Node.js installed)
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Node.js not found. Please install from https://nodejs.org/
  exit /b 1
)

REM 2) Install Claude Code CLI
call npm install -g @anthropic-ai/claude-code

REM 3) Create Gatewayz proxy for Claude Code
set PROXY_DIR=%USERPROFILE%\\claude-gatewayz-proxy
if not exist "%PROXY_DIR%" mkdir "%PROXY_DIR%"

echo import http from 'node:http'; > "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo const PORT = process.env.PORT ^|^| 3000; >> "%PROXY_DIR%\\proxy.mjs"
echo const GW_KEY = process.env.GATEWAYZ_API_KEY; >> "%PROXY_DIR%\\proxy.mjs"
echo if (!GW_KEY) { console.error('GATEWAYZ_API_KEY not set'); process.exit(1); } >> "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo function textFromContent(block) { >> "%PROXY_DIR%\\proxy.mjs"
echo   if (!block) return ''; >> "%PROXY_DIR%\\proxy.mjs"
echo   if (typeof block === 'string') return block; >> "%PROXY_DIR%\\proxy.mjs"
echo   if (Array.isArray(block)) return block.map(b =^> b?.text ^|^| '').join('\\n'); >> "%PROXY_DIR%\\proxy.mjs"
echo   if (block.text) return block.text; >> "%PROXY_DIR%\\proxy.mjs"
echo   return ''; >> "%PROXY_DIR%\\proxy.mjs"
echo } >> "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo function mapMessages(anthropicMsgs = [], system) { >> "%PROXY_DIR%\\proxy.mjs"
echo   const msgs = []; >> "%PROXY_DIR%\\proxy.mjs"
echo   if (system) msgs.push({ role: 'system', content: typeof system === 'string' ? system : textFromContent(system) }); >> "%PROXY_DIR%\\proxy.mjs"
echo   for (const m of anthropicMsgs) msgs.push({ role: m.role, content: textFromContent(m.content) }); >> "%PROXY_DIR%\\proxy.mjs"
echo   return msgs; >> "%PROXY_DIR%\\proxy.mjs"
echo } >> "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo async function handleMessages(req, res, body) { >> "%PROXY_DIR%\\proxy.mjs"
echo   const payload = JSON.parse(body ^|^| '{}'); >> "%PROXY_DIR%\\proxy.mjs"
echo   const { model, messages, system, temperature = 0.2, max_tokens = 4096 } = payload ^|^| {}; >> "%PROXY_DIR%\\proxy.mjs"
echo   const chosen = model ^|^| process.env.REASONING_MODEL ^|^| process.env.COMPLETION_MODEL ^|^| 'anthropic/claude-3.5-haiku'; >> "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo   const chatBody = { model: chosen, messages: mapMessages(messages, system), temperature, max_tokens }; >> "%PROXY_DIR%\\proxy.mjs"
echo   const headers = { 'Authorization': \`Bearer $\{process.env.GATEWAYZ_API_KEY}\`, 'Content-Type': 'application/json' }; >> "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo   const resp = await fetch('https://api.gatewayz.ai/v1/chat/completions', { >> "%PROXY_DIR%\\proxy.mjs"
echo     method: 'POST', headers, body: JSON.stringify(chatBody) >> "%PROXY_DIR%\\proxy.mjs"
echo   }); >> "%PROXY_DIR%\\proxy.mjs"
echo   if (!resp.ok) { >> "%PROXY_DIR%\\proxy.mjs"
echo     const txt = await resp.text(); >> "%PROXY_DIR%\\proxy.mjs"
echo     res.writeHead(resp.status, { 'Content-Type': 'application/json' }); >> "%PROXY_DIR%\\proxy.mjs"
echo     res.end(JSON.stringify({ error: { message: txt } })); >> "%PROXY_DIR%\\proxy.mjs"
echo     return; >> "%PROXY_DIR%\\proxy.mjs"
echo   } >> "%PROXY_DIR%\\proxy.mjs"
echo   const data = await resp.json(); >> "%PROXY_DIR%\\proxy.mjs"
echo   const content = data?.choices?.[0]?.message?.content ?? ''; >> "%PROXY_DIR%\\proxy.mjs"
echo   const usage = data?.usage ^|^| {}; >> "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo   const out = { >> "%PROXY_DIR%\\proxy.mjs"
echo     id: \`msg_$\{Date.now()}\`, >> "%PROXY_DIR%\\proxy.mjs"
echo     type: 'message', >> "%PROXY_DIR%\\proxy.mjs"
echo     role: 'assistant', >> "%PROXY_DIR%\\proxy.mjs"
echo     model: chosen, >> "%PROXY_DIR%\\proxy.mjs"
echo     content: [{ type: 'text', text: content }], >> "%PROXY_DIR%\\proxy.mjs"
echo     stop_reason: 'end_turn', >> "%PROXY_DIR%\\proxy.mjs"
echo     usage: { >> "%PROXY_DIR%\\proxy.mjs"
echo       input_tokens: usage.prompt_tokens, >> "%PROXY_DIR%\\proxy.mjs"
echo       output_tokens: usage.completion_tokens, >> "%PROXY_DIR%\\proxy.mjs"
echo       total_tokens: usage.total_tokens >> "%PROXY_DIR%\\proxy.mjs"
echo     } >> "%PROXY_DIR%\\proxy.mjs"
echo   }; >> "%PROXY_DIR%\\proxy.mjs"
echo   res.writeHead(200, { 'Content-Type': 'application/json' }); >> "%PROXY_DIR%\\proxy.mjs"
echo   res.end(JSON.stringify(out)); >> "%PROXY_DIR%\\proxy.mjs"
echo } >> "%PROXY_DIR%\\proxy.mjs"
echo. >> "%PROXY_DIR%\\proxy.mjs"
echo const server = http.createServer((req, res) =^> { >> "%PROXY_DIR%\\proxy.mjs"
echo   if (req.method === 'GET' ^&^& req.url === '/health') { >> "%PROXY_DIR%\\proxy.mjs"
echo     res.writeHead(200, { 'Content-Type': 'application/json' }); >> "%PROXY_DIR%\\proxy.mjs"
echo     return res.end(JSON.stringify({ ok: true })); >> "%PROXY_DIR%\\proxy.mjs"
echo   } >> "%PROXY_DIR%\\proxy.mjs"
echo   if (req.method === 'POST' ^&^& req.url === '/v1/messages') { >> "%PROXY_DIR%\\proxy.mjs"
echo     let body = ''; >> "%PROXY_DIR%\\proxy.mjs"
echo     req.on('data', chunk =^> body += chunk); >> "%PROXY_DIR%\\proxy.mjs"
echo     req.on('end', () =^> handleMessages(req, res, body).catch(err =^> { >> "%PROXY_DIR%\\proxy.mjs"
echo       res.writeHead(500, { 'Content-Type': 'application/json' }); >> "%PROXY_DIR%\\proxy.mjs"
echo       res.end(JSON.stringify({ error: { message: String(err) } })); >> "%PROXY_DIR%\\proxy.mjs"
echo     })); >> "%PROXY_DIR%\\proxy.mjs"
echo     return; >> "%PROXY_DIR%\\proxy.mjs"
echo   } >> "%PROXY_DIR%\\proxy.mjs"
echo   res.writeHead(404, { 'Content-Type': 'application/json' }); >> "%PROXY_DIR%\\proxy.mjs"
echo   res.end(JSON.stringify({ error: { message: 'Not found' } })); >> "%PROXY_DIR%\\proxy.mjs"
echo }); >> "%PROXY_DIR%\\proxy.mjs"
echo server.listen(PORT, () =^> console.log(\`Gatewayz proxy on http://127.0.0.1:$\{PORT}\`)); >> "%PROXY_DIR%\\proxy.mjs"

REM 4) Start proxy in background
cd /d "%PROXY_DIR%"
start /b node proxy.mjs > proxy.log 2>&1

REM 5) Set environment variables and launch Claude Code
set ANTHROPIC_BASE_URL=http://127.0.0.1:3000
set COMPLETION_MODEL=anthropic/claude-3.5-haiku
set REASONING_MODEL=anthropic/claude-sonnet-4.5

claude
`;

  const linuxSetupScript = `#!/usr/bin/env bash
# Usage:  chmod +x setup-claude-gatewayz.sh
#         ./setup-claude-gatewayz.sh

set -euo pipefail

# 0) Ask for Gatewayz API key if not present
if [[ -z "\${GATEWAYZ_API_KEY:-}" ]]; then
  read -r -p "Enter your Gatewayz API key (starts with gw_): " GATEWAYZ_API_KEY
  if [[ -z "$GATEWAYZ_API_KEY" ]]; then echo "No key provided"; exit 1; fi
  export GATEWAYZ_API_KEY
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
  *) export PATH="$NPM_BIN:$PATH"; echo "export PATH=\\"$NPM_BIN:\\$PATH\\"" >> "$HOME/.bashrc" ;;
esac

# 2) Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 3) Create Gatewayz proxy for Claude Code
PROXY_DIR="$HOME/claude-gatewayz-proxy"
mkdir -p "$PROXY_DIR"
cat > "$PROXY_DIR/proxy.mjs" <<"EOF"
import http from 'node:http';

const PORT = process.env.PORT || 3000;
const GW_KEY = process.env.GATEWAYZ_API_KEY;
if (!GW_KEY) { console.error('GATEWAYZ_API_KEY not set'); process.exit(1); }

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
    'Authorization': \`Bearer \${process.env.GATEWAYZ_API_KEY}\`,
    'Content-Type': 'application/json'
  };

  const resp = await fetch('https://api.gatewayz.ai/v1/chat/completions', {
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
server.listen(PORT, () => console.log(\`Gatewayz proxy on http://127.0.0.1:\${PORT}\`));
EOF

# 4) Start proxy in background
cd "$PROXY_DIR"
nohup node proxy.mjs > proxy.log 2>&1 & echo $! > proxy.pid
sleep 1

# 5) Point Claude Code at the proxy and launch
export ANTHROPIC_BASE_URL="http://127.0.0.1:3000"

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

      {/* Automated Setup Script */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <Terminal className="h-6 w-6" />
            Automated Setup Script
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This script automatically installs Node.js, Claude Code CLI, and sets up a Gatewayz proxy for your operating system.
          </p>

          {/* OS Toggle Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedOS === 'macos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedOS('macos')}
            >
              macOS
            </Button>
            <Button
              variant={selectedOS === 'windows' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedOS('windows')}
            >
              Windows
            </Button>
            <Button
              variant={selectedOS === 'linux' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedOS('linux')}
            >
              Linux
            </Button>
          </div>

          {/* Script Display */}
          <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto relative max-h-96 overflow-y-auto">
            <div className="absolute top-2 right-2 z-10">
              <CopyButton
                text={selectedOS === 'macos' ? macosSetupScript : selectedOS === 'windows' ? windowsSetupScript : linuxSetupScript}
                id="setup-script"
              />
            </div>
            <pre>
              {selectedOS === 'macos' && macosSetupScript}
              {selectedOS === 'windows' && windowsSetupScript}
              {selectedOS === 'linux' && linuxSetupScript}
            </pre>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>📝 Instructions:</strong>
            </p>
            {selectedOS === 'macos' && (
              <ol className="text-sm text-amber-900 dark:text-amber-100 list-decimal ml-5 mt-2 space-y-1">
                <li>Save the script as <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">setup-claude-gatewayz.sh</code></li>
                <li>Make it executable: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">chmod +x setup-claude-gatewayz.sh</code></li>
                <li>Run it: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">./setup-claude-gatewayz.sh</code></li>
                <li>Enter your Gatewayz API key when prompted (starts with gw_)</li>
              </ol>
            )}
            {selectedOS === 'windows' && (
              <ol className="text-sm text-amber-900 dark:text-amber-100 list-decimal ml-5 mt-2 space-y-1">
                <li>Save the script as <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">setup-claude-gatewayz.bat</code></li>
                <li>Run it: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">setup-claude-gatewayz.bat</code></li>
                <li>Enter your Gatewayz API key when prompted (starts with gw_)</li>
              </ol>
            )}
            {selectedOS === 'linux' && (
              <ol className="text-sm text-amber-900 dark:text-amber-100 list-decimal ml-5 mt-2 space-y-1">
                <li>Save the script as <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">setup-claude-gatewayz.sh</code></li>
                <li>Make it executable: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">chmod +x setup-claude-gatewayz.sh</code></li>
                <li>Run it: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">./setup-claude-gatewayz.sh</code></li>
                <li>Enter your Gatewayz API key when prompted (starts with gw_)</li>
              </ol>
            )}
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

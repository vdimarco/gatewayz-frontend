# Claude Code Router + GatewayZ Integration

This setup configures Claude Code to use [claude-code-router](https://github.com/musistudio/claude-code-router) with GatewayZ as the API provider.

## 🚀 Quick Start

### Option 1: PowerShell Script (Recommended)
```powershell
powershell -ExecutionPolicy Bypass -File ~/.claude-code-router/quickstart.ps1
```

### Option 2: Manual Installation
```bash
# Install the router
npm install -g @musistudio/claude-code-router

# Set your GatewayZ API key
setx GATEWAYZ_API_KEY "your-api-key-here"

# Start the router
ccr code
```

## 📁 Configuration Files Created

All configuration files are in `~/.claude-code-router/`:
- **config.json** - Main router configuration
- **setup.bat** - Windows batch setup script
- **quickstart.ps1** - PowerShell setup script (recommended)
- **README.md** - Detailed documentation

## 🔑 Getting Your API Key

1. Go to https://gatewayz.ai/settings/keys
2. Click "Generate API Key"
3. Copy your primary API key
4. Set it in your environment:
   ```powershell
   $env:GATEWAYZ_API_KEY = "your-key"
   [System.Environment]::SetEnvironmentVariable('GATEWAYZ_API_KEY', 'your-key', 'User')
   ```

## 🤖 Available Models

The router is configured with the following top-ranked GatewayZ models:

| Model | Rank | Purpose | Cost |
|-------|------|---------|------|
| `x-ai/grok-code-fast-1` | #1 | Code-focused tasks | Medium |
| `anthropic/claude-sonnet-4` | #2 | Default - General tasks | Medium |
| `x-ai/grok-4-fast` | #3 | Fast reasoning | Medium |
| `google/gemini-2.5-flash` | #4 | Web search & fast tasks | Very Low |
| `deepseek/deepseek-v3.1` | #5 | Background tasks | Low |
| `anthropic/claude-sonnet-4.5` | #6 | Complex reasoning | Medium |
| `google/gemini-2.5-pro` | #8 | Long context (100k+ tokens) | Low |
| `openai/gpt-5` | #11 | Latest GPT model | High |
| `openai/gpt-4.1-mini` | #10 | Fast GPT alternative | Medium |
| `anthropic/claude-3.7-sonnet` | #14 | Previous generation | Medium |

## 🎯 Routing Strategy

The router automatically selects the best model for each task:

```json
{
  "default": "anthropic/claude-sonnet-4",
  "background": "deepseek/deepseek-v3.1",
  "think": "anthropic/claude-sonnet-4.5",
  "longContext": "google/gemini-2.5-pro",
  "webSearch": "google/gemini-2.5-flash"
}
```

- **Default tasks** → Claude Sonnet 4 (#2 ranked - best balance)
- **Background operations** → DeepSeek V3.1 (#5 ranked - cost-effective)
- **Complex reasoning** → Claude Sonnet 4.5 (#6 ranked - advanced thinking)
- **Long documents (>100k tokens)** → Gemini 2.5 Pro (#8 ranked)
- **Web search tasks** → Gemini 2.5 Flash (#4 ranked - fast)

## 💡 Usage

### Start Claude Code Router
```bash
ccr code
```

### Switch Models Dynamically
While in Claude Code, use the `/model` command:
```
/model gatewayz,x-ai/grok-code-fast-1
/model gatewayz,openai/gpt-5
/model gatewayz,deepseek/deepseek-v3.1
```

### Open Web UI
```bash
ccr ui
```

## 🔧 Advanced Configuration

### Edit Configuration
```bash
notepad ~/.claude-code-router/config.json
```

### Add Custom Models
Edit the `models` array in `config.json`:
```json
{
  "Providers": [{
    "name": "gatewayz",
    "models": [
      "anthropic/claude-sonnet-4",
      "x-ai/grok-code-fast-1",
      "your-new-model"
    ]
  }]
}
```

### Customize Routing Rules
Modify the `Router` section:
```json
{
  "Router": {
    "default": "gatewayz,your-preferred-model",
    "background": "gatewayz,cost-effective-model",
    "think": "gatewayz,powerful-model"
  }
}
```

## ✅ Benefits

- **Unified API**: Access multiple AI providers through GatewayZ
- **Cost Optimization**: Automatically route to cost-effective models
- **Failover Protection**: Seamless fallback if a model is unavailable
- **Usage Tracking**: Monitor API usage in the GatewayZ dashboard
- **Flexible Routing**: Choose the best model for each task
- **Dynamic Switching**: Change models on-the-fly with `/model` command

## 🐛 Troubleshooting

### API Key Not Found
```powershell
# Check if set
$env:GATEWAYZ_API_KEY

# Set it
[System.Environment]::SetEnvironmentVariable('GATEWAYZ_API_KEY', 'your-key', 'User')
```

### Connection Issues
1. Verify your API key at https://gatewayz.ai/settings/keys
2. Check if the key is active
3. Ensure you have credits/requests remaining

### Model Not Available
Update the `config.json` with available models from your GatewayZ dashboard

### Router Not Starting
```bash
# Reinstall
npm install -g @musistudio/claude-code-router

# Check logs
ccr code --verbose
```

## 📚 Resources

- **GatewayZ Dashboard**: https://gatewayz.ai
- **API Keys**: https://gatewayz.ai/settings/keys
- **Usage Stats**: https://gatewayz.ai/settings/activity
- **Claude Code Router**: https://github.com/musistudio/claude-code-router

## 🎉 What's Next?

1. Run the quickstart script: `powershell ~/.claude-code-router/quickstart.ps1`
2. Start coding: `ccr code`
3. Try different models with `/model`
4. Monitor usage in GatewayZ dashboard

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

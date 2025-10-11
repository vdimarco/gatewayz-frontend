#!/usr/bin/env pwsh
# Claude Code Router + GatewayZ Setup for Windows
# Usage: powershell -ExecutionPolicy Bypass -File setup-windows.ps1

param(
    [string]$ApiKey = ""
)

$ErrorActionPreference = "Stop"

function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  Claude Code Router + GatewayZ Setup      ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

Write-Header

# Step 1: Check Node.js
Write-Step "Checking Node.js installation..."
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Success "Node.js $nodeVersion and npm $npmVersion installed"
} catch {
    Write-Error "Node.js is not installed"
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Step 2: Install Claude Code
Write-Host ""
Write-Step "Installing Claude Code..."
try {
    # Check if claude command already exists
    $claudePath = Get-Command claude -ErrorAction SilentlyContinue
    if ($claudePath) {
        Write-Success "Claude Code already installed"
    } else {
        npm install -g @anthropic-ai/claude-code 2>&1 | Out-Null
        $claudePath = Get-Command claude -ErrorAction SilentlyContinue
        if ($claudePath) {
            Write-Success "Claude Code installed"
        } else {
            Write-Host "⚠ Claude Code package installed but 'claude' command not found" -ForegroundColor Yellow
            Write-Host "You may need to restart your terminal" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Error "Failed to install Claude Code"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Install Claude Code Router
Write-Host ""
Write-Step "Installing Claude Code Router..."
try {
    npm install -g @musistudio/claude-code-router 2>&1 | Out-Null

    # Verify installation
    $ccrPath = Get-Command ccr -ErrorAction SilentlyContinue
    if ($ccrPath) {
        Write-Success "Claude Code Router installed"
    } else {
        Write-Host "⚠ Package installed but 'ccr' command not found. Trying to fix..." -ForegroundColor Yellow
        npm uninstall -g @musistudio/claude-code-router 2>&1 | Out-Null
        npm install -g @musistudio/claude-code-router 2>&1 | Out-Null

        $ccrPath = Get-Command ccr -ErrorAction SilentlyContinue
        if ($ccrPath) {
            Write-Success "Claude Code Router installed (fixed)"
        } else {
            Write-Error "Installation completed but 'ccr' command not available"
            Write-Host "You may need to restart your terminal" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Error "Failed to install Claude Code Router"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Get API Key
Write-Host ""
Write-Step "Setting up GatewayZ API key..."

if (-not $ApiKey) {
    $ApiKey = $env:GATEWAYZ_API_KEY
}

if (-not $ApiKey) {
    Write-Host ""
    Write-Host "Get your API key at: " -NoNewline -ForegroundColor Cyan
    Write-Host "https://gatewayz.ai/settings/keys" -ForegroundColor White
    Write-Host ""

    # Check if running interactively
    if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
        $ApiKey = Read-Host "Enter your GatewayZ API key"
    }

    if (-not $ApiKey) {
        Write-Host ""
        Write-Host "No API key found. Please set it manually:" -ForegroundColor Yellow
        Write-Host "  1. Get your API key from https://gatewayz.ai/settings/keys" -ForegroundColor White
        Write-Host "  2. Run in PowerShell:" -ForegroundColor White
        Write-Host "     [System.Environment]::SetEnvironmentVariable('GATEWAYZ_API_KEY', 'your-key-here', 'User')" -ForegroundColor Cyan
        Write-Host "  3. Restart PowerShell and run: ccr code" -ForegroundColor White
        Write-Host ""
        Write-Host "Setup will continue with placeholder configuration..." -ForegroundColor Yellow
        $ApiKey = "YOUR_GATEWAYZ_API_KEY_HERE"
    }
}

# Set environment variable (only if not placeholder)
if ($ApiKey -ne "YOUR_GATEWAYZ_API_KEY_HERE") {
    [System.Environment]::SetEnvironmentVariable('GATEWAYZ_API_KEY', $ApiKey, 'User')
    $env:GATEWAYZ_API_KEY = $ApiKey
    Write-Success "API key configured"
} else {
    Write-Host "⚠ Skipping API key environment variable setup" -ForegroundColor Yellow
}

# Step 5: Create configuration
Write-Host ""
Write-Step "Creating router configuration..."

$configDir = "$env:USERPROFILE\.claude-code-router"
$configFile = "$configDir\config.json"

if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$config = @{
    LOG = $true
    LOG_LEVEL = "info"
    Providers = @(
        @{
            name = "gatewayz"
            api_base_url = "https://api.gatewayz.ai/v1/chat/completions"
            api_key = "`$GATEWAYZ_API_KEY"
            models = @(
                "anthropic/claude-3.7-sonnet",
                "anthropic/claude-3.5-sonnet",
                "anthropic/claude-3-opus",
                "anthropic/claude-3-haiku",
                "openai/gpt-4",
                "openai/gpt-4-turbo",
                "openai/gpt-3.5-turbo",
                "deepseek/deepseek-chat",
                "google/gemini-2.0-flash-exp",
                "google/gemini-1.5-pro"
            )
        }
    )
    Router = @{
        default = "gatewayz,anthropic/claude-3.7-sonnet"
        background = "gatewayz,deepseek/deepseek-chat"
        think = "gatewayz,anthropic/claude-3.5-sonnet"
        longContext = "gatewayz,google/gemini-1.5-pro"
        longContextThreshold = 100000
        webSearch = "gatewayz,google/gemini-2.0-flash-exp"
    }
}

$config | ConvertTo-Json -Depth 10 | Set-Content -Path $configFile -Encoding UTF8
Write-Success "Configuration created at: $configFile"

# Step 6: Test connection
Write-Host ""
Write-Step "Testing GatewayZ connection..."
try {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
    }
    Invoke-RestMethod -Uri "https://api.gatewayz.ai/" -Method Get -Headers $headers -TimeoutSec 5 -ErrorAction SilentlyContinue | Out-Null
    Write-Success "Connection successful"
} catch {
    Write-Host "⚠ Could not verify connection (this may be normal)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            Setup Complete! 🎉              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  ccr code              " -NoNewline -ForegroundColor White
Write-Host "- Start Claude Code with router" -ForegroundColor Gray
Write-Host "  ccr ui                " -NoNewline -ForegroundColor White
Write-Host "- Open web configuration UI" -ForegroundColor Gray
Write-Host "  /model <name>         " -NoNewline -ForegroundColor White
Write-Host "- Switch models (in Claude Code)" -ForegroundColor Gray
Write-Host ""
Write-Host "Available Models:" -ForegroundColor Cyan
Write-Host "  • claude-3.7-sonnet (default)" -ForegroundColor White
Write-Host "  • deepseek-chat (cost-effective)" -ForegroundColor White
Write-Host "  • gpt-4, gemini-1.5-pro, and more..." -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Close and reopen your terminal" -ForegroundColor White
Write-Host "  2. Run: " -NoNewline -ForegroundColor White
Write-Host "ccr code" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

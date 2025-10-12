#!/bin/bash
# Claude Code Router + GatewayZ Setup for macOS
# Usage: bash setup-macos.sh [API_KEY]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Claude Code Router + GatewayZ Setup      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header

# Step 1: Check Node.js
print_step "Checking Node.js installation..."
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js $NODE_VERSION and npm $NPM_VERSION installed"
else
    print_error "Node.js is not installed"
    echo -e "${YELLOW}Install with: brew install node${NC}"
    echo -e "${YELLOW}Or download from: https://nodejs.org/${NC}"
    exit 1
fi

# Step 2: Install Claude Code
echo ""
print_step "Installing Claude Code..."
if command -v claude &> /dev/null; then
    print_success "Claude Code already installed"
else
    if npm install -g @anthropic-ai/claude-code > /dev/null 2>&1; then
        print_success "Claude Code installed"
    else
        print_error "Failed to install Claude Code"
        exit 1
    fi
fi

# Step 3: Install Claude Code Router
echo ""
print_step "Installing Claude Code Router..."
if npm install -g @musistudio/claude-code-router > /dev/null 2>&1; then
    print_success "Claude Code Router installed"
else
    print_error "Failed to install Claude Code Router"
    exit 1
fi

# Step 4: Get API Key
echo ""
print_step "Setting up GatewayZ API key..."

API_KEY="${1:-$GATEWAYZ_API_KEY}"

if [ -z "$API_KEY" ]; then
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  API KEY REQUIRED${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}Opening browser to get your API key...${NC}"

    # Open browser to API keys page
    open "https://beta.gatewayz.ai/settings/keys" 2>/dev/null || true

    echo ""
    echo -e "${WHITE}Please follow these steps:${NC}"
    echo -e "${WHITE}  1. Sign in to GatewayZ (browser window opened)${NC}"
    echo -e "${WHITE}  2. Click 'Generate API Key' if you don't have one${NC}"
    echo -e "${WHITE}  3. Copy your API key${NC}"
    echo ""
    read -p "Paste your GatewayZ API key here: " API_KEY

    if [ -z "$API_KEY" ]; then
        echo ""
        echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
        echo -e "${YELLOW}  MANUAL SETUP REQUIRED${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
        echo ""
        echo -e "${WHITE}No API key provided. To complete setup manually:${NC}"
        echo ""
        echo -e "${WHITE}  1. Visit: ${CYAN}https://beta.gatewayz.ai/settings/keys${NC}"
        echo -e "${WHITE}  2. Sign in and generate an API key${NC}"
        echo -e "${WHITE}  3. Copy your key and add it to your shell config:${NC}"
        echo ""
        echo -e "${GREEN}     export GATEWAYZ_API_KEY='your-key-here'${NC}"
        echo ""
        echo -e "${WHITE}  4. Restart your terminal${NC}"
        echo -e "${WHITE}  5. Run: ${GREEN}ccr code${NC}"
        echo ""
        print_error "Setup incomplete - API key required"
        exit 1
    fi
fi

# Add to shell config
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [ -n "$SHELL_CONFIG" ]; then
    if ! grep -q "GATEWAYZ_API_KEY" "$SHELL_CONFIG"; then
        echo "" >> "$SHELL_CONFIG"
        echo "# GatewayZ API Key" >> "$SHELL_CONFIG"
        echo "export GATEWAYZ_API_KEY=\"$API_KEY\"" >> "$SHELL_CONFIG"
    fi
fi

export GATEWAYZ_API_KEY="$API_KEY"
print_success "API key configured"

# Step 5: Create configuration
echo ""
print_step "Creating router configuration..."

CONFIG_DIR="$HOME/.claude-code-router"
CONFIG_FILE="$CONFIG_DIR/config.json"

mkdir -p "$CONFIG_DIR"

cat > "$CONFIG_FILE" << 'EOF'
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "Providers": [
    {
      "name": "gatewayz",
      "api_base_url": "https://api.gatewayz.ai/v1/chat/completions",
      "api_key": "$GATEWAYZ_API_KEY",
      "models": [
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
      ]
    }
  ],
  "Router": {
    "default": "gatewayz,anthropic/claude-3.7-sonnet",
    "background": "gatewayz,deepseek/deepseek-chat",
    "think": "gatewayz,anthropic/claude-3.5-sonnet",
    "longContext": "gatewayz,google/gemini-1.5-pro",
    "longContextThreshold": 100000,
    "webSearch": "gatewayz,google/gemini-2.0-flash-exp"
  }
}
EOF

print_success "Configuration created at: $CONFIG_FILE"

# Step 6: Test connection
echo ""
print_step "Testing GatewayZ connection..."
if curl -s -f -H "Authorization: Bearer $API_KEY" https://api.gatewayz.ai/ > /dev/null 2>&1; then
    print_success "Connection successful"
else
    echo -e "${YELLOW}⚠ Could not verify connection (this may be normal)${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Setup Complete! 🎉              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Quick Start:${NC}"
echo -e "  ${WHITE}ccr code${NC}              ${GRAY}- Start Claude Code with router${NC}"
echo -e "  ${WHITE}ccr ui${NC}                ${GRAY}- Open web configuration UI${NC}"
echo -e "  ${WHITE}/model <name>${NC}         ${GRAY}- Switch models (in Claude Code)${NC}"
echo ""
echo -e "${CYAN}Available Models:${NC}"
echo -e "  ${WHITE}• claude-3.7-sonnet (default)${NC}"
echo -e "  ${WHITE}• deepseek-chat (cost-effective)${NC}"
echo -e "  ${WHITE}• gpt-4, gemini-1.5-pro, and more...${NC}"
echo ""
echo -e "${YELLOW}Note: Restart your terminal or run:${NC}"
echo -e "${WHITE}source $SHELL_CONFIG${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo -e "${WHITE}  1. Close and reopen your terminal (or run: source $SHELL_CONFIG)${NC}"
echo -e "${WHITE}  2. Run: ${NC}${GREEN}ccr code${NC}"
echo ""
echo -e "${GRAY}Setup complete! Review the output above for any warnings.${NC}"
echo ""

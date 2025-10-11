#!/bin/bash
# Claude Code Router + GatewayZ Setup for Linux
# Usage: bash setup-linux.sh [API_KEY]

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
    echo ""
    echo -e "${YELLOW}Install Node.js:${NC}"
    echo -e "${WHITE}Ubuntu/Debian:${NC} sudo apt-get update && sudo apt-get install nodejs npm"
    echo -e "${WHITE}Fedora:${NC}        sudo dnf install nodejs npm"
    echo -e "${WHITE}Arch Linux:${NC}    sudo pacman -S nodejs npm"
    echo -e "${WHITE}Or use nvm:${NC}    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Step 2: Install Claude Code Router
echo ""
print_step "Installing Claude Code Router..."
if sudo npm install -g @musistudio/claude-code-router > /dev/null 2>&1; then
    print_success "Claude Code Router installed"
else
    print_error "Failed to install Claude Code Router"
    echo -e "${YELLOW}Try: sudo npm install -g @musistudio/claude-code-router${NC}"
    exit 1
fi

# Step 3: Get API Key
echo ""
print_step "Setting up GatewayZ API key..."

API_KEY="${1:-$GATEWAYZ_API_KEY}"

if [ -z "$API_KEY" ]; then
    echo ""
    echo -e "${CYAN}Get your API key at: ${WHITE}https://gatewayz.ai/settings/keys${NC}"
    echo ""
    read -p "Enter your GatewayZ API key: " API_KEY

    if [ -z "$API_KEY" ]; then
        print_error "No API key provided"
        exit 1
    fi
fi

# Add to shell config
SHELL_CONFIG=""
if [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
elif [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
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

# Step 4: Create configuration
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

# Step 5: Test connection
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
read -p "Start now? (Y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo ""
    echo -e "${CYAN}Starting Claude Code Router...${NC}"
    echo ""
    ccr code
else
    echo ""
    echo -e "${CYAN}Run 'ccr code' when ready!${NC}"
fi

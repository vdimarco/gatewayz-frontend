# Development Guide

## Package Manager

This project uses **pnpm** as the package manager. Please always use pnpm commands:

### Installation
```bash
# Install pnpm globally
npm install -g pnpm

# Or use Corepack (recommended)
corepack enable
corepack prepare pnpm@latest --activate
```

### Commands
```bash
# Install dependencies
pnpm install

# Add a new package
pnpm add <package-name>

# Remove a package
pnpm remove <package-name>

# Run dev server
pnpm dev
```

### ⚠️ Important
- **Never use `npm install`** - this will create conflicts with pnpm-lock.yaml
- Always commit both `package.json` and `pnpm-lock.yaml` together
- If you see lockfile errors, run `pnpm install` to regenerate

## Environment Variables

This project requires environment variables to be configured:

### Setup
1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your actual values:
   - `NEXT_PUBLIC_PRIVY_APP_ID` - Your Privy application ID
   - `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: https://api.gatewayz.ai)

### Important
- `.env.local` is git-ignored and contains your local/development values
- For production deployment, set environment variables in Vercel Dashboard:
  - Go to Project Settings → Environment Variables
  - Add `NEXT_PUBLIC_API_BASE_URL=https://api.gatewayz.ai`
  - Add `NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>`

### Local Development
For local development against the local backend:
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

For production testing:
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.gatewayz.ai
```

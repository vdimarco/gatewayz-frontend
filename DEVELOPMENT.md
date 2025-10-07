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

## Deployment to Vercel

### Environment Variables Setup
After removing the old environment variable from Vercel, you need to add it back with the correct value:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.gatewayz.ai` | Production, Preview, Development |
| `NEXT_PUBLIC_PRIVY_APP_ID` | `<your-privy-app-id>` | Production, Preview, Development |

5. Click **Save**
6. Trigger a new deployment or push a commit to deploy

### Verifying Deployment
After deployment, check that the auth endpoint is working:
```bash
# Should call https://api.gatewayz.ai/auth
curl -X POST https://beta.gatewayz.ai/api-endpoint-test
```

The frontend should now correctly call `https://api.gatewayz.ai/auth` instead of the malformed URL.

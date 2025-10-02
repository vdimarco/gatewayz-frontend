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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal Base Mini App MVP built with Next.js 15, OnchainKit, and the Farcaster SDK. It provides the essential scaffolding to build and publish a Mini App to the Base app and Farcaster ecosystem.

## Development Commands

### Local Development
```bash
pnpm install          # Install dependencies (using pnpm workspace)
pnpm dev              # Start development server on http://localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Deployment
```bash
vercel --prod                                    # Deploy to production
vercel env add NEXT_PUBLIC_PROJECT_NAME production
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
vercel env add NEXT_PUBLIC_URL production
```

## Architecture

### Minimal Application Structure

This MVP includes only the essential files needed for a Base Mini App:

- **app/page.tsx**: Home page with MiniKit initialization (displays "Home")
- **app/success/page.tsx**: Success page (displays "Success")
- **app/rootProvider.tsx**: Wraps app with `OnchainKitProvider` configured for Base chain with MiniKit enabled
- **app/layout.tsx**: Root layout that generates metadata from `minikit.config.ts` and wraps content in `SafeArea`
- **app/.well-known/farcaster.json/route.ts**: Serves the Farcaster manifest from `minikit.config.ts`

### Key Configuration Files

- **minikit.config.ts**: Central configuration for the Farcaster Mini App manifest including metadata, icons, URLs, and account association
- **next.config.ts**: Webpack externals configured to exclude `pino-pretty`, `lokijs`, and `encoding` from bundle

### MiniKit Initialization

Every page that uses MiniKit features must call `setFrameReady()` on mount:

```typescript
const { isFrameReady, setFrameReady } = useMiniKit();

useEffect(() => {
  if (!isFrameReady) {
    setFrameReady();
  }
}, [setFrameReady, isFrameReady]);
```

### OnchainKit Integration

- Provider configuration in `app/rootProvider.tsx`:
  - Chain: Base mainnet (`wagmi/chains`)
  - API key: `NEXT_PUBLIC_ONCHAINKIT_API_KEY` from Coinbase Developer Platform
  - MiniKit: enabled with `autoConnect: true`
  - Wallet display: modal mode with all wallet options
  - Appearance: auto light/dark mode

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_PROJECT_NAME`: App name for display
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: CDP API key for OnchainKit
- `NEXT_PUBLIC_URL`: Production URL (auto-resolved from `VERCEL_PROJECT_PRODUCTION_URL` or defaults to localhost)

### TypeScript Configuration

- Target: ES2017
- Module: ESNext with bundler resolution
- Path alias: `@/*` maps to project root
- Strict mode enabled
- JSX: preserve (Next.js handles transformation)

## Publishing Workflow

1. Configure `minikit.config.ts` with app metadata (name, icons, descriptions)
2. Add your app images to `/public` folder (icon.png, hero.png, screenshot-portrait.png)
3. Deploy to Vercel and set `NEXT_PUBLIC_URL`
4. Sign manifest at https://farcaster.xyz/~/developers/mini-apps/manifest using your domain
5. Add `accountAssociation` object to `minikit.config.ts`
6. Redeploy to production
7. Validate at https://base.dev/preview (check embeds, account association, metadata)
8. Publish by posting app URL in Base app

## Important Notes

- Uses pnpm as package manager (v10.14.0+)
- Next.js 15 with React 19
- The manifest at `/.well-known/farcaster.json` must be publicly accessible for Farcaster verification
- When testing locally, use localhost:3000
- All pages are minimal scaffolds displaying their name - build your features on top of this foundation

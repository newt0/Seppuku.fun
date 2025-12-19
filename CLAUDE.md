# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Farcaster Mini App built with Next.js 15, OnchainKit, and the Farcaster SDK. It's a waitlist sign-up application designed to run within the Base app and Farcaster ecosystem. The app demonstrates user authentication via Farcaster Quick Auth and integrates with OnchainKit for blockchain interactions on Base.

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

### Application Structure

- **app/page.tsx**: Main waitlist form with email validation and Farcaster authentication
- **app/success/page.tsx**: Success page with social sharing functionality via `composeCast`
- **app/rootProvider.tsx**: Wraps app with `OnchainKitProvider` configured for Base chain with MiniKit enabled
- **app/layout.tsx**: Root layout that generates metadata from `minikit.config.ts` and wraps content in `SafeArea`
- **app/api/auth/route.ts**: JWT verification endpoint using Farcaster Quick Auth
- **app/.well-known/farcaster.json/route.ts**: Serves the Farcaster manifest from `minikit.config.ts`

### Key Configuration Files

- **minikit.config.ts**: Central configuration for the Farcaster Mini App manifest including metadata, icons, URLs, and account association
- **next.config.ts**: Webpack externals configured to exclude `pino-pretty`, `lokijs`, and `encoding` from bundle

### Authentication Flow

1. App initializes MiniKit via `useMiniKit()` hook and calls `setFrameReady()` on mount
2. User data is available via `context.user` (includes FID, display name, etc.)
3. For verified authentication: `useQuickAuth("/api/auth")` calls the API route which:
   - Extracts JWT from `Authorization: Bearer <token>` header
   - Verifies JWT using `@farcaster/quick-auth` client with domain validation
   - Returns user FID and token metadata (issuedAt, expiresAt)
4. Domain resolution in auth route: Origin header → Host header → VERCEL_ENV-based fallback

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
2. Deploy to Vercel and set `NEXT_PUBLIC_URL`
3. Sign manifest at https://farcaster.xyz/~/developers/mini-apps/manifest using your domain
4. Add `accountAssociation` object to `minikit.config.ts`
5. Redeploy to production
6. Validate at https://base.dev/preview (check embeds, account association, metadata)
7. Publish by posting app URL in Base app

## Important Notes

- Uses pnpm as package manager (v10.14.0+)
- Next.js 15 with React 19
- All API routes automatically receive MiniKit JWT tokens when called via `sdk.quickAuth.fetch`
- The manifest at `/.well-known/farcaster.json` must be publicly accessible for Farcaster verification
- When testing locally, JWT verification will use `localhost:3000` as domain
- Social sharing uses OnchainKit's `useComposeCast()` hook to create Farcaster casts with embeds

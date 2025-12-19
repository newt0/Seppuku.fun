# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router (pages, API routes). Components live in `app/components/*.tsx` and API handlers in `app/api/*/route.ts`.
- `public/`: Static assets (icons, screenshots, images).
- `contracts/`: Foundry workspace for Solidity (`src/`, `script/`, `test/`, `foundry.toml`).
- `docs/`: Internal documentation and plans.
- Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`.

## Build, Test, and Development Commands
- Install deps: `pnpm install` (preferred; repo pins pnpm in `package.json`).
- Frontend dev: `pnpm dev` — run Next.js locally.
- Frontend build: `pnpm build` — compile production build; `pnpm start` to serve.
- Lint: `pnpm lint` — run ESLint with Next.js rules.
- Contracts build: `forge build` (in `contracts/`).
- Contracts tests: `forge test -vv` (in `contracts/`).
- Example deploy: `forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast`.

## Coding Style & Naming Conventions
- TypeScript/React: 2‑space indent, semicolons, named exports where possible.
- Components: PascalCase filenames (`MarketCard.tsx`), hooks/utilities camelCase.
- Routes: App Router in `app/*`; API route files named `route.ts`.
- Linting/formatting: ESLint (`pnpm lint`); Prettier config present — enable format‑on‑save in your editor.
- Solidity: Contracts PascalCase in `contracts/src`, tests end with `*.t.sol` using Foundry.

## Testing Guidelines
- Primary tests are Solidity with Foundry in `contracts/test`.
- Name tests after the contract (`SeppukuMarket.t.sol`) and group by behavior.
- Run locally with `forge test`; add revert/edge‑case coverage for state transitions and payouts.
- Frontend has no test runner configured yet; keep components small and deterministic.

## Commit & Pull Request Guidelines
- Commits: present tense, concise scope first line (≤72 chars). Example: `feat: add market status component`.
- PRs: clear description, linked issues, steps to reproduce/test, and screenshots/GIFs for UI changes.
- Include contract ABI/behavior notes if PR affects `contracts/`; update docs when flows change.

## Security & Configuration Tips
- Frontend env: copy `.example.env` to `.env` (do not commit secrets).
- Contracts env: copy `contracts/.env.example` to `contracts/.env` and set `RPC_URL`/`PRIVATE_KEY` for deploy scripts.
- Validate inputs and handle on‑chain errors in UI; never expose private keys in the app.


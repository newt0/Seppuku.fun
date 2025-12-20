const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Seppuku.fun",
    subtitle: "Hyper Casual Finance",
    description: "A prediction market app for goal commitment with friend-based trust. Stake tokens on your goals, let friends bet on your success, and achieve self-transformation through on-chain accountability.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/hero.png`,
    splashBackgroundColor: "#1a1a1a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["prediction-market", "goal-commitment", "base", "social-finance"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Achieve self-transformation through on-chain seppuku",
    ogTitle: "Seppuku.fun - On-chain Goal Commitment",
    ogDescription: "Stake tokens on your goals. Let friends bet on your success. Achieve self-transformation through prediction markets.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;


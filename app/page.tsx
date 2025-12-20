"use client";
import { useEffect } from "react";
import { useMiniKit } from "./hooks/minikitMock";
import Link from "next/link";
import { useMarkets } from "./contexts/MarketsContext";
import { MarketCard } from "./components/MarketCard";

export default function Home() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const { markets, getMarketStatus } = useMarkets();

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Seppuku.fun</h1>
          <p className="text-sm text-gray-600 mb-4">
            自己宣言をMarket化する Hyper Casual Finance
          </p>
          <p className="text-xs text-gray-500 mb-4">
            他者の視線が行動変容を生む。人間関係が解決レイヤー。
          </p>
        </header>

        <Link href="/create">
          <button className="w-full bg-black text-white py-3 font-bold mb-6 hover:bg-gray-800 transition-colors">
            + Create Market
          </button>
        </Link>

        <div>
          <h2 className="text-xl font-bold mb-4">Markets</h2>
          {markets.length === 0 ? (
            <div className="border border-gray-300 p-8 text-center text-gray-500">
              <p>No markets yet.</p>
              <p className="text-sm mt-2">Create your first market to get started!</p>
            </div>
          ) : (
            <div>
              {markets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  status={getMarketStatus(market)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

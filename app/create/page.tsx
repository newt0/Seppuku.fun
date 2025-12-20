"use client";

import { useEffect } from "react";
import { useMiniKit } from "../hooks/minikitMock";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMarkets } from "../contexts/MarketsContext";
import { CreateMarketForm } from "../components/CreateMarketForm";

export default function CreateMarket() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const { createMarket } = useMarkets();
  const router = useRouter();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleSubmit = (data: {
    goal: string;
    host: string;
    hostWallet: string;
    kaishyaku: string;
    kaishyakuWallet: string;
    deadlineHours: number;
    hostStake: number;
  }) => {
    const market = createMarket(
      data.goal,
      data.host,
      data.hostWallet,
      data.kaishyaku,
      data.kaishyakuWallet,
      data.deadlineHours,
      data.hostStake
    );

    // Navigate to the newly created market detail page
    router.push(`/market/${market.id}`);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-black">
            ← Back to Markets
          </Link>
        </div>

        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Market</h1>
          <p className="text-sm text-gray-600 mb-2">
            自己宣言をMarket化し、他者の視線で行動変容を促す
          </p>
          <p className="text-xs text-gray-500">
            あなたの目標を公開し、達成へのコミットメントを可視化します
          </p>
        </header>

        <div className="border border-black p-6">
          <CreateMarketForm onSubmit={handleSubmit} />
        </div>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-300">
          <h3 className="font-bold text-sm mb-2">仕組み</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>Host（あなた）が目標と Stake を設定</li>
            <li>Kaishyaku（介錯人）が Market Close を実行</li>
            <li>他のユーザーが YES/NO で Bet</li>
            <li>期限後、Host が達成/未達を自己申告</li>
            <li>Kaishyaku が結果を確定し、分配を実行</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

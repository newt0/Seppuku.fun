"use client";

import { useEffect } from "react";
import { useMiniKit } from "../../hooks/minikitMock";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMarkets } from "../../contexts/MarketsContext";
import { MarketStatusBadge } from "../../components/MarketStatus";
import { BetForm } from "../../components/BetForm";

export default function MarketDetail() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const params = useParams();
  const marketId = params.id as string;

  const {
    getMarket,
    getMarketStatus,
    bet,
    declareResult,
    closeMarket,
    calculatePayout,
  } = useMarkets();

  const market = getMarket(marketId);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  if (!market) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-500 mt-8">Market not found</p>
          <Link
            href="/"
            className="block text-center mt-4 text-sm text-gray-600 hover:text-black"
          >
            ← Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const status = getMarketStatus(market);
  const isOpen = status === "OPEN";
  const isPendingClose = status === "PENDING_CLOSE";
  const isClosed = status === "CLOSED_SUCCESS" || status === "CLOSED_FAIL";

  const handleBet = (amount: number, side: "YES" | "NO") => {
    bet(marketId, amount, side);
  };

  const handleDeclareSuccess = () => {
    declareResult(marketId, true);
  };

  const handleDeclareFail = () => {
    declareResult(marketId, false);
  };

  const handleCloseMarket = () => {
    closeMarket(marketId);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs < 0) {
      return 'Expired';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const parts = [];
    if (diffDays > 0) {
      parts.push(`${diffDays} ${diffDays === 1 ? 'day' : 'days'}`);
    }
    if (diffHrs > 0) {
      parts.push(`${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'}`);
    }
    if (diffMins > 0) {
      parts.push(`${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'}`);
    }

    return parts.length > 0 ? `${parts.join(' ')} remaining` : 'Less than a minute remaining';
  };

  const payout = isClosed ? calculatePayout(market) : null;

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-black">
            ← Back to Markets
          </Link>
        </div>

        <div className="border border-black p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold flex-1">{market.goal}</h1>
            <MarketStatusBadge status={status} />
          </div>

          <div className="space-y-2 text-sm mb-6">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Host:</span>
                <p className="font-bold">{market.host}</p>
                <p className="font-mono text-xs text-gray-600">{market.hostWallet}</p>
              </div>
              <div>
                <span className="text-gray-500">Kaishyaku:</span>
                <p className="font-bold">{market.kaishyaku}</p>
                <p className="font-mono text-xs text-gray-600">{market.kaishyakuWallet}</p>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Deadline:</span>
              <p>{formatDeadline(market.deadline)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="border border-gray-300 p-3">
              <p className="text-xs text-gray-500 mb-1">Host Stake</p>
              <p className="font-bold text-lg">{market.hostStake.toFixed(3)}</p>
              <p className="text-xs text-gray-500">ETH</p>
            </div>
            <div className="border border-gray-300 p-3">
              <p className="text-xs text-gray-500 mb-1">YES Pool</p>
              <p className="font-bold text-lg">{market.yesPool.toFixed(3)}</p>
              <p className="text-xs text-gray-500">ETH</p>
            </div>
            <div className="border border-gray-300 p-3">
              <p className="text-xs text-gray-500 mb-1">NO Pool</p>
              <p className="font-bold text-lg">{market.noPool.toFixed(3)}</p>
              <p className="text-xs text-gray-500">ETH</p>
            </div>
          </div>

          {market.declaredResult !== undefined && (
            <div className="bg-gray-100 p-3 mb-4">
              <p className="text-sm font-bold">
                Host declared:{" "}
                {market.declaredResult ? "✓ ACHIEVED" : "✗ FAILED"}
              </p>
            </div>
          )}
        </div>

        {/* Bet Form - Show when market is OPEN */}
        {isOpen && <BetForm onBet={handleBet} />}

        {/* Bet History Table */}
        {market.bets.length > 0 && (
          <div className="border border-black p-4 mb-4">
            <h3 className="font-bold mb-3">Bet History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-2">Wallet</th>
                    <th className="text-left py-2 px-2">Time</th>
                    <th className="text-right py-2 px-2">Amount</th>
                    <th className="text-center py-2 px-2">Side</th>
                  </tr>
                </thead>
                <tbody>
                  {market.bets
                    .slice()
                    .reverse()
                    .map((bet, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-2 px-2 font-mono text-xs">
                          {bet.walletAddress}
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-600">
                          {new Date(bet.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right font-bold">
                          {bet.amount.toFixed(3)} ETH
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-bold ${bet.side === "YES"
                                ? "bg-gray-800 text-white"
                                : "bg-white text-black border border-black"
                              }`}
                          >
                            {bet.side}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Host Declaration - Show when past deadline and not declared */}
        {isPendingClose && market.declaredResult === undefined && (
          <div className="border border-black p-4 mb-4">
            <h3 className="font-bold mb-3">Declare Result</h3>
            <p className="text-sm text-gray-600 mb-4">
              本来はHostのみが実行可能（モック実装）
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeclareSuccess}
                className="bg-white text-black border-2 border-black py-3 font-bold hover:bg-gray-100"
              >
                ✓ Achieved
              </button>
              <button
                onClick={handleDeclareFail}
                className="bg-black text-white border-2 border-black py-3 font-bold hover:bg-gray-800"
              >
                ✗ Failed
              </button>
            </div>
          </div>
        )}

        {/* Kaishyaku Close Market - Show when declared but not closed */}
        {isPendingClose &&
          market.declaredResult !== undefined &&
          !market.closed && (
            <div className="border border-black p-4 mb-4 bg-gray-50">
              <h3 className="font-bold mb-3">Market Close (Kaishyaku)</h3>
              <p className="text-sm text-gray-600 mb-4">
                本来はKaishyakuのみが実行可能（モック実装）
              </p>
              <button
                onClick={handleCloseMarket}
                className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800"
              >
                Close Market & Finalize Result
              </button>
            </div>
          )}

        {/* Payout Results - Show when closed */}
        {isClosed && payout && (
          <div className="border border-black p-4 mb-4">
            <h3 className="font-bold mb-3">Distribution Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Final Result:</span>
                <span className="font-bold">
                  {market.finalResult ? "✓ SUCCESS" : "✗ FAIL"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Host Return:</span>
                <span className="font-bold">
                  {payout.hostReturn.toFixed(3)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span>Winner Pool Total:</span>
                <span className="font-bold">
                  {payout.winnerPoolTotal.toFixed(3)} ETH
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              本来は各参加者がclaimを実行して配分を受け取ります（モック実装）
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-300">
          <h3 className="font-bold text-sm mb-2">Seppuku.fun の仕組み</h3>
          <p className="text-xs text-gray-600 mb-2">
            自己宣言をMarket化し、他者の視線で行動変容を促します。
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>Oracleではなく、人間関係が解決レイヤー</li>
            <li>Kaishyaku（介錯人）が結果を確定</li>
            <li>inspired by Hypercasual Finance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

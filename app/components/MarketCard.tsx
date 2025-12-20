import Link from 'next/link';
import type { Market, MarketStatus } from '../types/market';
import { MarketStatusBadge } from './MarketStatus';

interface MarketCardProps {
  market: Market;
  status: MarketStatus;
}

export function MarketCard({ market, status }: MarketCardProps) {
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

  return (
    <Link href={`/market/${market.id}`}>
      <div className="border border-black p-4 mb-3 hover:bg-gray-100 transition-colors cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg flex-1">{market.goal}</h3>
          <MarketStatusBadge status={status} />
        </div>

        <div className="text-sm text-gray-600 mb-3">
          <p>Host: {market.host} ({market.hostWallet})</p>
          <p>Kaishyaku: {market.kaishyaku} ({market.kaishyakuWallet})</p>
          <p className="mt-1">{formatDeadline(market.deadline)}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="border border-gray-300 p-2">
            <p className="text-xs text-gray-500">Host Stake</p>
            <p className="font-bold">{market.hostStake.toFixed(3)} ETH</p>
          </div>
          <div className="border border-gray-300 p-2">
            <p className="text-xs text-gray-500">YES Pool</p>
            <p className="font-bold">{market.yesPool.toFixed(3)} ETH</p>
          </div>
          <div className="border border-gray-300 p-2">
            <p className="text-xs text-gray-500">NO Pool</p>
            <p className="font-bold">{market.noPool.toFixed(3)} ETH</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

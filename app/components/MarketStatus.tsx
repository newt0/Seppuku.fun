import type { MarketStatus } from '../types/market';

interface MarketStatusProps {
  status: MarketStatus;
}

export function MarketStatusBadge({ status }: MarketStatusProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'OPEN':
        return 'bg-light-green text-black';
      case 'PENDING_CLOSE':
        return 'bg-light-green text-black';
      case 'CLOSED_SUCCESS':
        return 'bg-light-purple text-black';
      case 'CLOSED_FAIL':
        return 'bg-light-gray text-black';
      default:
        return 'bg-gray-300 text-black';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'OPEN':
        return 'OPEN';
      case 'PENDING_CLOSE':
        return 'PENDING CLOSE';
      case 'CLOSED_SUCCESS':
        return 'CLOSED: SUCCESS';
      case 'CLOSED_FAIL':
        return 'CLOSED: FAIL';
      default:
        return status;
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-bold uppercase ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
}

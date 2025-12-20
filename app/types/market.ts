// Market data model for Seppuku.fun
// TODO: Replace with onchain data types when connecting to smart contract

export interface Market {
  id: string;
  goal: string;
  host: string;
  hostWallet: string;
  kaishyaku: string;
  kaishyakuWallet: string;
  deadline: string; // ISO string
  hostStake: number;
  yesPool: number;
  noPool: number;
  declaredResult?: boolean; // true = achieved, false = failed
  closed: boolean;
  finalResult?: boolean; // true = success, false = fail
}

export type MarketStatus = 'OPEN' | 'PENDING_CLOSE' | 'CLOSED_SUCCESS' | 'CLOSED_FAIL';

export interface Bet {
  marketId: string;
  amount: number;
  side: 'YES' | 'NO';
}

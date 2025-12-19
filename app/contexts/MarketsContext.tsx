'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Market, MarketStatus } from '../types/market';

interface MarketsContextType {
  markets: Market[];
  createMarket: (
    goal: string,
    host: string,
    kaishyaku: string,
    deadlineHours: number,
    hostStake: number
  ) => Market;
  bet: (marketId: string, amount: number, side: 'YES' | 'NO') => void;
  declareResult: (marketId: string, achieved: boolean) => void;
  closeMarket: (marketId: string) => void;
  getMarket: (marketId: string) => Market | undefined;
  getMarketStatus: (market: Market) => MarketStatus;
  calculatePayout: (market: Market) => {
    hostReturn: number;
    winnerPoolTotal: number;
    loserPoolTotal: number;
  };
}

const MarketsContext = createContext<MarketsContextType | undefined>(undefined);

export function MarketsProvider({ children }: { children: ReactNode }) {
  const [markets, setMarkets] = useState<Market[]>([]);

  const getMarketStatus = useCallback((market: Market): MarketStatus => {
    const now = new Date();
    const deadline = new Date(market.deadline);

    if (market.closed) {
      return market.finalResult ? 'CLOSED_SUCCESS' : 'CLOSED_FAIL';
    }

    if (now < deadline && market.declaredResult === undefined) {
      return 'OPEN';
    }

    if (now >= deadline || market.declaredResult !== undefined) {
      return 'PENDING_CLOSE';
    }

    return 'OPEN';
  }, []);

  const createMarket = useCallback((
    goal: string,
    host: string,
    kaishyaku: string,
    deadlineHours: number,
    hostStake: number
  ): Market => {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + deadlineHours);

    const newMarket: Market = {
      id: `market-${Date.now()}`,
      goal,
      host,
      kaishyaku,
      deadline: deadline.toISOString(),
      hostStake,
      yesPool: 0,
      noPool: 0,
      closed: false,
    };

    setMarkets(prev => [newMarket, ...prev]);
    return newMarket;
  }, []);

  const bet = useCallback((marketId: string, amount: number, side: 'YES' | 'NO') => {
    setMarkets(prev => prev.map(market => {
      if (market.id === marketId) {
        if (side === 'YES') {
          return { ...market, yesPool: market.yesPool + amount };
        } else {
          return { ...market, noPool: market.noPool + amount };
        }
      }
      return market;
    }));
  }, []);

  const declareResult = useCallback((marketId: string, achieved: boolean) => {
    setMarkets(prev => prev.map(market => {
      if (market.id === marketId) {
        return { ...market, declaredResult: achieved };
      }
      return market;
    }));
  }, []);

  const closeMarket = useCallback((marketId: string) => {
    setMarkets(prev => prev.map(market => {
      if (market.id === marketId) {
        return {
          ...market,
          closed: true,
          finalResult: market.declaredResult ?? false,
        };
      }
      return market;
    }));
  }, []);

  const getMarket = useCallback((marketId: string): Market | undefined => {
    return markets.find(m => m.id === marketId);
  }, [markets]);

  const calculatePayout = useCallback((market: Market) => {
    if (market.finalResult === true) {
      return {
        hostReturn: market.hostStake,
        winnerPoolTotal: market.yesPool + market.noPool,
        loserPoolTotal: 0,
      };
    } else {
      return {
        hostReturn: 0,
        winnerPoolTotal: market.noPool + market.hostStake,
        loserPoolTotal: 0,
      };
    }
  }, []);

  return (
    <MarketsContext.Provider
      value={{
        markets,
        createMarket,
        bet,
        declareResult,
        closeMarket,
        getMarket,
        getMarketStatus,
        calculatePayout,
      }}
    >
      {children}
    </MarketsContext.Provider>
  );
}

export function useMarkets() {
  const context = useContext(MarketsContext);
  if (context === undefined) {
    throw new Error('useMarkets must be used within a MarketsProvider');
  }
  return context;
}

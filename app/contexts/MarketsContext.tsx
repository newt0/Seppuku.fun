"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { Market, MarketStatus } from "../types/market";

interface MarketsContextType {
  markets: Market[];
  createMarket: (
    goal: string,
    host: string,
    hostWallet: string,
    kaishyaku: string,
    kaishyakuWallet: string,
    deadlineHours: number,
    hostStake: number
  ) => Market;
  bet: (marketId: string, amount: number, side: "YES" | "NO") => void;
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
  // Initialize with dummy data
  const getDummyMarkets = (): Market[] => {
    const now = new Date();

    // Market 1: TOEIC 800 - 7 days from now
    const deadline1 = new Date(now);
    deadline1.setDate(deadline1.getDate() + 7);

    // Market 2: 5kg減量 - 30 days from now
    const deadline2 = new Date(now);
    deadline2.setDate(deadline2.getDate() + 30);

    // Market 3: クリスマスまでに彼女を作る - Until Christmas 2025
    const deadline3 = new Date("2025-12-25T00:00:00");

    return [
      {
        id: "market-toeic-800",
        goal: "TOEIC800点を取得する",
        host: "さとし",
        hostWallet: "0x1234...5678",
        kaishyaku: "英語の先生",
        kaishyakuWallet: "0xabcd...efgh",
        deadline: deadline1.toISOString(),
        hostStake: 0.05,
        yesPool: 0.12,
        noPool: 0.08,
        closed: false,
      },
      {
        id: "market-weight-loss",
        goal: "5kg減量する",
        host: "健太",
        hostWallet: "0x2345...6789",
        kaishyaku: "トレーナー美咲",
        kaishyakuWallet: "0xbcde...fghi",
        deadline: deadline2.toISOString(),
        hostStake: 0.03,
        yesPool: 0.06,
        noPool: 0.15,
        closed: false,
      },
      {
        id: "market-christmas-girlfriend",
        goal: "クリスマスまでに彼氏を作る",
        host: "ゆい",
        hostWallet: "0x3456...7890",
        kaishyaku: "親友まり",
        kaishyakuWallet: "0xcdef...ghij",
        deadline: deadline3.toISOString(),
        hostStake: 0.1,
        yesPool: 0.02,
        noPool: 0.25,
        closed: false,
      },
    ];
  };

  const [markets, setMarkets] = useState<Market[]>(getDummyMarkets());

  const getMarketStatus = useCallback((market: Market): MarketStatus => {
    const now = new Date();
    const deadline = new Date(market.deadline);

    if (market.closed) {
      return market.finalResult ? "CLOSED_SUCCESS" : "CLOSED_FAIL";
    }

    if (now < deadline && market.declaredResult === undefined) {
      return "OPEN";
    }

    if (now >= deadline || market.declaredResult !== undefined) {
      return "PENDING_CLOSE";
    }

    return "OPEN";
  }, []);

  const createMarket = useCallback(
    (
      goal: string,
      host: string,
      hostWallet: string,
      kaishyaku: string,
      kaishyakuWallet: string,
      deadlineHours: number,
      hostStake: number
    ): Market => {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + deadlineHours);

      const newMarket: Market = {
        id: `market-${Date.now()}`,
        goal,
        host,
        hostWallet,
        kaishyaku,
        kaishyakuWallet,
        deadline: deadline.toISOString(),
        hostStake,
        yesPool: 0,
        noPool: 0,
        closed: false,
      };

      setMarkets((prev) => [newMarket, ...prev]);
      return newMarket;
    },
    []
  );

  const bet = useCallback(
    (marketId: string, amount: number, side: "YES" | "NO") => {
      setMarkets((prev) =>
        prev.map((market) => {
          if (market.id === marketId) {
            if (side === "YES") {
              return { ...market, yesPool: market.yesPool + amount };
            } else {
              return { ...market, noPool: market.noPool + amount };
            }
          }
          return market;
        })
      );
    },
    []
  );

  const declareResult = useCallback((marketId: string, achieved: boolean) => {
    setMarkets((prev) =>
      prev.map((market) => {
        if (market.id === marketId) {
          return { ...market, declaredResult: achieved };
        }
        return market;
      })
    );
  }, []);

  const closeMarket = useCallback((marketId: string) => {
    setMarkets((prev) =>
      prev.map((market) => {
        if (market.id === marketId) {
          return {
            ...market,
            closed: true,
            finalResult: market.declaredResult ?? false,
          };
        }
        return market;
      })
    );
  }, []);

  const getMarket = useCallback(
    (marketId: string): Market | undefined => {
      return markets.find((m) => m.id === marketId);
    },
    [markets]
  );

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
    throw new Error("useMarkets must be used within a MarketsProvider");
  }
  return context;
}

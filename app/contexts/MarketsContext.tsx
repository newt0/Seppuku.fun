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

    // Market 1: 半年間禁酒継続 - 180 days from now (Open)
    const deadline1 = new Date(now);
    deadline1.setDate(deadline1.getDate() + 180);

    // Market 2: Y Combinator X2026 batchに採択される - 90 days from now (Open)
    const deadline2 = new Date(now);
    deadline2.setDate(deadline2.getDate() + 90);

    // Market 3: 5kg痩せる - 60 days from now (Open)
    const deadline3 = new Date(now);
    deadline3.setDate(deadline3.getDate() + 60);

    // Market 4: Solana Global Hackathonで勝つ - 7 days ago (Success)
    const deadline4 = new Date(now);
    deadline4.setDate(deadline4.getDate() - 7);

    // Market 5: クリスマスまでに彼女を作る - Already passed (Failed)
    const deadline5 = new Date("2025-12-25T00:00:00");

    return [
      {
        id: "market-no-alcohol",
        goal: "半年間禁酒",
        host: "mameta",
        hostWallet: "0x1a2b...3c4d",
        kaishyaku: "yometa",
        kaishyakuWallet: "0x5e6f...7g8h",
        deadline: deadline1.toISOString(),
        hostStake: 0.08,
        yesPool: 0.15,
        noPool: 0.05,
        closed: false,
      },
      {
        id: "market-ycombinator",
        goal: "Y Combinator X2026 batchに採択",
        host: "etaroid",
        hostWallet: "0x9i0j...1k2l",
        kaishyaku: "yu8muraka3",
        kaishyakuWallet: "0x3m4n...5o6p",
        deadline: deadline2.toISOString(),
        hostStake: 0.1,
        yesPool: 0.25,
        noPool: 0.3,
        closed: false,
      },
      {
        id: "market-weight-loss",
        goal: "5kg減量",
        host: "kobatake",
        hostWallet: "0x7q8r...9s0t",
        kaishyaku: "0xsamuraijp",
        kaishyakuWallet: "0xuv1w...2x3y",
        deadline: deadline3.toISOString(),
        hostStake: 0.05,
        yesPool: 0.08,
        noPool: 0.12,
        closed: false,
      },
      {
        id: "market-solana-hackathon",
        goal: "Solana Global Hackathonで勝つ",
        host: "zkyuki",
        hostWallet: "0x4z5a...6b7c",
        kaishyaku: "256hax",
        kaishyakuWallet: "0x8d9e...0f1g",
        deadline: deadline4.toISOString(),
        hostStake: 0.15,
        yesPool: 0.4,
        noPool: 0.1,
        declaredResult: true,
        closed: true,
        finalResult: true,
      },
      {
        id: "market-christmas-girlfriend",
        goal: "クリスマスまでに彼女を作る",
        host: "kyohei_nft",
        hostWallet: "0x2h3i...4j5k",
        kaishyaku: "medy.nim",
        kaishyakuWallet: "0x6l7m...8n9o",
        deadline: deadline5.toISOString(),
        hostStake: 0.1,
        yesPool: 0.02,
        noPool: 0.35,
        declaredResult: false,
        closed: true,
        finalResult: false,
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

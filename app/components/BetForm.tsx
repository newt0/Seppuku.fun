'use client';

import { useState } from 'react';

interface BetFormProps {
  onBet: (amount: number, side: 'YES' | 'NO') => void;
}

export function BetForm({ onBet }: BetFormProps) {
  const [amount, setAmount] = useState(0.01);

  return (
    <div className="border border-black p-4 mt-4">
      <h3 className="font-bold mb-3">Place Your Bet</h3>

      <div className="mb-4">
        <label htmlFor="betAmount" className="block text-sm font-bold mb-1">
          Bet Amount (ETH)
        </label>
        <input
          id="betAmount"
          type="number"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="0.001"
          className="w-full border border-black p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onBet(amount, 'YES')}
          className="bg-white text-black border-2 border-black py-3 font-bold hover:bg-gray-100 transition-colors"
        >
          Bet YES
        </button>
        <button
          onClick={() => onBet(amount, 'NO')}
          className="bg-black text-white border-2 border-black py-3 font-bold hover:bg-gray-800 transition-colors"
        >
          Bet NO
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        本来は全てのユーザーがBet可能（モック実装）
      </p>
    </div>
  );
}

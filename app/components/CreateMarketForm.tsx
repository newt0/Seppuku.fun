'use client';

import { useState } from 'react';

interface CreateMarketFormProps {
  onSubmit: (data: {
    goal: string;
    host: string;
    kaishyaku: string;
    deadlineHours: number;
    hostStake: number;
  }) => void;
}

export function CreateMarketForm({ onSubmit }: CreateMarketFormProps) {
  const [goal, setGoal] = useState('');
  const [host, setHost] = useState('');
  const [kaishyaku, setKaishyaku] = useState('');
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [hostStake, setHostStake] = useState(0.01);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      goal,
      host,
      kaishyaku,
      deadlineHours,
      hostStake,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="goal" className="block text-sm font-bold mb-1">
          Goal (必須)
        </label>
        <input
          id="goal"
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Run 5km every day for a week"
          className="w-full border border-black p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="host" className="block text-sm font-bold mb-1">
          Host (Your Name / Address)
        </label>
        <input
          id="host"
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="e.g., alice.eth or 0x123..."
          className="w-full border border-black p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="kaishyaku" className="block text-sm font-bold mb-1">
          Kaishyaku (介錯人 - Name / Address)
        </label>
        <input
          id="kaishyaku"
          type="text"
          value={kaishyaku}
          onChange={(e) => setKaishyaku(e.target.value)}
          placeholder="e.g., bob.eth or 0x456..."
          className="w-full border border-black p-2"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          The person who will execute Market Close
        </p>
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-bold mb-1">
          Deadline (Hours from now)
        </label>
        <input
          id="deadline"
          type="number"
          value={deadlineHours}
          onChange={(e) => setDeadlineHours(Number(e.target.value))}
          min="1"
          className="w-full border border-black p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="hostStake" className="block text-sm font-bold mb-1">
          Host Stake (ETH)
        </label>
        <input
          id="hostStake"
          type="number"
          step="0.001"
          value={hostStake}
          onChange={(e) => setHostStake(Number(e.target.value))}
          min="0.001"
          className="w-full border border-black p-2"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Your commitment stake - you lose this if you fail
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800 transition-colors"
      >
        Publish Market
      </button>

      <p className="text-xs text-gray-500 text-center">
        本来はウォレット署名が必要です（モック実装）
      </p>
    </form>
  );
}

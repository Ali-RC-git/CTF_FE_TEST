'use client';

import { useState } from 'react';
import ScoreboardRow from './ScoreboardRow';

interface LiveScoreboardProps {
  isVisible: boolean;
  isPublic: boolean;
  lastUpdated: string;
  onTogglePublic: () => void;
}

export default function LiveScoreboard({ isVisible, isPublic, lastUpdated, onTogglePublic }: LiveScoreboardProps) {
  const [teams] = useState([
    { id: 1, name: 'QuantumPoptarts', score: 6242, trend: 'up' as const, rank: 1 },
    { id: 2, name: 'WEH', score: 5995, trend: 'down' as const, rank: 2 },
    { id: 3, name: 'TeamName-of-MyChoice', score: 5258, trend: 'stable' as const, rank: 3 },
    { id: 4, name: 'The Undecideds', score: 3489, trend: 'up' as const, rank: 4 },
    { id: 5, name: 'Geren', score: 3125, trend: 'down' as const, rank: 5 },
    { id: 6, name: 'Goreme', score: 2845, trend: 'up' as const, rank: 6 },
    { id: 7, name: 'Binary Ninjas', score: 2120, trend: 'stable' as const, rank: 7 },
    { id: 8, name: 'Code Breakers', score: 1845, trend: 'up' as const, rank: 8 }
  ]);

  if (!isVisible) {
    return (
      <div className="bg-secondary-bg rounded-lg p-8 text-center border border-border-color">
        <div className="text-text-secondary text-lg">Scoreboard is currently hidden</div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-bg rounded-lg overflow-hidden border border-border-color mb-6">
      <div className="flex justify-between items-center p-5 bg-accent-color/10 border-b border-border-color">
        <h2 className="text-xl text-accent-light font-semibold">Live Scoreboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-text-secondary">
            Last updated: <span className="text-text-primary">{lastUpdated}</span>
          </span>
          <button
            onClick={onTogglePublic}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              isPublic
                ? 'bg-accent-color text-white hover:bg-accent-dark'
                : 'bg-secondary-bg text-text-primary border border-border-color hover:bg-accent-color/10'
            }`}
          >
            Public View: {isPublic ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {teams.map((team) => (
          <ScoreboardRow
            key={team.id}
            team={team}
          />
        ))}
      </div>
    </div>
  );
}

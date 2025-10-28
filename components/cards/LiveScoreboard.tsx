'use client';

import { useState } from 'react';
import { ScoreboardEntry } from '@/lib/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LiveScoreboardProps {
  entries: ScoreboardEntry[];
  className?: string;
}

export default function LiveScoreboard({ entries, className = '' }: LiveScoreboardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
      default:
        return '→';
    }
  };

  const getHighlightColor = (highlight?: string) => {
    switch (highlight) {
      case 'gold':
        return 'border-l-4 border-warning-500';
      case 'silver':
        return 'border-l-4 border-gray-400';
      case 'bronze':
        return 'border-l-4 border-warning-600';
      default:
        return '';
    }
  };

  if (!isVisible) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-primary text-2xl font-semibold">{t.dashboard.liveScoreboard}</h2>
          <button
            onClick={() => setIsVisible(true)}
            className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200"
          >
            {t.dashboard.showScoreboard}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-text-primary text-2xl font-semibold">{t.dashboard.liveScoreboard}</h2>
        <button
          onClick={() => setIsVisible(false)}
          className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200"
        >
          {t.dashboard.hideScoreboard}
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`bg-secondary-bg rounded-lg p-4 flex items-center justify-between ${getHighlightColor(entry.highlight)}`}
          >
            <div className="flex items-center">
              <span className="text-text-primary font-medium mr-4">
                {entry.rank}{getRankSuffix(entry.rank)}
              </span>
              <span className="text-text-primary font-medium">
                {entry.teamName}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-text-primary font-medium mr-2">
                {entry.points.toLocaleString()}pts
              </span>
              <span className="text-text-primary text-lg">
                {getTrendIcon(entry.trend)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

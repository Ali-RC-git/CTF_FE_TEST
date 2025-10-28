"use client";
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ScoreboardContent() {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mockScoreboard = [
    {
      id: '1',
      rank: 1,
      team: 'Cyber Warriors',
      points: 2450,
      trend: 'up',
      change: '+120',
      members: 3,
      lastSolve: '2 hours ago'
    },
    {
      id: '2',
      rank: 2,
      team: 'Security Squad',
      points: 1980,
      trend: 'up',
      change: '+80',
      members: 2,
      lastSolve: '4 hours ago'
    },
    {
      id: '3',
      rank: 3,
      team: 'Code Breakers',
      points: 1750,
      trend: 'down',
      change: '-50',
      members: 4,
      lastSolve: '1 day ago'
    },
    {
      id: '4',
      rank: 4,
      team: 'Hack Masters',
      points: 1620,
      trend: 'stable',
      change: '0',
      members: 2,
      lastSolve: '2 days ago'
    },
    {
      id: '5',
      rank: 5,
      team: 'Digital Defenders',
      points: 1480,
      trend: 'up',
      change: '+200',
      members: 3,
      lastSolve: '30 minutes ago'
    }
  ];

  const handleExportScoreboard = () => {
    alert('Scoreboard data exported successfully!');
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    alert('Scoreboard data refreshed!');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success-color';
      case 'down':
        return 'text-danger-color';
      case 'stable':
        return 'text-text-secondary';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <section>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          {t.admin.scoreboard.title}
        </h1>
        <div className="flex gap-4 md:flex-row flex-col">
          <button 
            onClick={handleExportScoreboard}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <span>📥</span>
            {t.admin.scoreboard.exportScoreboard}
          </button>
          <button 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>
              {isRefreshing ? '⟳' : '🔄'}
            </span>
            {t.admin.scoreboard.refreshData}
          </button>
        </div>
      </header>

      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.scoreboard.rank}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.scoreboard.team}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.scoreboard.points}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  {t.admin.scoreboard.trend}
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  Members
                </th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">
                  Last Solve
                </th>
              </tr>
            </thead>
            <tbody>
              {mockScoreboard.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-text-primary">
                        #{entry.rank}
                      </span>
                      {entry.rank <= 3 && (
                        <span className="text-xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <div className="font-medium text-text-primary">{entry.team}</div>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="font-bold text-accent-color text-lg">
                      {entry.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getTrendColor(entry.trend)}`}>
                        {getTrendIcon(entry.trend)}
                      </span>
                      <span className={`text-sm font-medium ${getTrendColor(entry.trend)}`}>
                        {entry.change}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5 text-text-secondary">
                    {entry.members} members
                  </td>
                  <td className="py-3 px-4 border-b border-white/5 text-text-secondary">
                    {entry.lastSolve}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Scoreboard Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-secondary-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent-color mb-1">
              {mockScoreboard.length}
            </div>
            <div className="text-sm text-text-secondary">Active Teams</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success-color mb-1">
              {mockScoreboard.reduce((sum, team) => sum + team.members, 0)}
            </div>
            <div className="text-sm text-text-secondary">Total Participants</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning-color mb-1">
              {Math.max(...mockScoreboard.map(t => t.points))}
            </div>
            <div className="text-sm text-text-secondary">Highest Score</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent-color mb-1">
              {Math.round(mockScoreboard.reduce((sum, team) => sum + team.points, 0) / mockScoreboard.length)}
            </div>
            <div className="text-sm text-text-secondary">Average Score</div>
          </div>
        </div>
      </div>
    </section>
  );
}
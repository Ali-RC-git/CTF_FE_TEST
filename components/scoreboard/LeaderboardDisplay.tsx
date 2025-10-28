'use client';

import { EventScoreboardResponse, LeaderboardTeam } from '@/lib/api/events';

interface LeaderboardDisplayProps {
  scoreboardData: EventScoreboardResponse | null;
  loading?: boolean;
  error?: string | null;
  userTeamId?: string | null;
  className?: string;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

function getRankIcon(rank: number): string {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `#${rank}`;
  }
}

function getRankBadge(rank: number): string {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600'; // Gold
    case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500'; // Silver
    case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600'; // Bronze
    default: return 'bg-gray-600';
  }
}

function getRowHighlight(rank: number, isUserTeam: boolean): string {
  if (isUserTeam) {
    return 'bg-accent-color/10 border-l-4 border-accent-color';
  }
  switch (rank) {
    case 1: return 'bg-yellow-500/5 border-l-4 border-yellow-500';
    case 2: return 'bg-gray-400/5 border-l-4 border-gray-400';
    case 3: return 'bg-orange-500/5 border-l-4 border-orange-500';
    default: return '';
  }
}

export default function LeaderboardDisplay({
  scoreboardData,
  loading = false,
  error = null,
  userTeamId = null,
  className = ""
}: LeaderboardDisplayProps) {
  if (loading) {
    return (
      <div className={`bg-card-bg rounded-lg p-6 border border-border-color ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
          <span className="ml-3 text-text-secondary">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card-bg rounded-lg p-6 border border-red-500 ${className}`}>
        <div className="text-red-400 text-center">
          <div className="text-lg font-semibold mb-2">Error Loading Leaderboard</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!scoreboardData) {
    return (
      <div className={`bg-card-bg rounded-lg p-6 border border-border-color ${className}`}>
        <div className="text-center text-text-secondary py-8">
          <div className="text-lg mb-2">No Event Selected</div>
          <div className="text-sm">Select an event to view the leaderboard</div>
        </div>
      </div>
    );
  }

  if (!scoreboardData.leaderboard.teams.length) {
    return (
      <div className={`bg-card-bg rounded-lg p-6 border border-border-color ${className}`}>
        <div className="text-center text-text-secondary py-8">
          <div className="text-lg mb-2">No Teams Yet</div>
          <div className="text-sm">Teams will appear here once they are registered for this event</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card-bg rounded-lg border border-border-color ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border-color bg-secondary-bg rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-accent-light">
            {scoreboardData.event_info.name} Leaderboard
          </h3>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>{scoreboardData.leaderboard.total_teams} teams</span>
            <span>•</span>
            <span>{scoreboardData.event_info.total_challenges} challenges</span>
            {scoreboardData.leaderboard.is_frozen && (
              <>
                <span>•</span>
                <span className="text-warning-color font-medium">FROZEN</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-bg">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Solved
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Last Solve
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Attempts
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {scoreboardData.leaderboard.teams.map((team: LeaderboardTeam) => {
                const isZeroScore = team.total_score === 0;
                const isUserTeam = Boolean(userTeamId && team.team_id === userTeamId);
                const rowHighlight = getRowHighlight(team.rank, isUserTeam);
                
                return (
                  <tr 
                    key={team.team_id} 
                    className={`hover:bg-secondary-bg/50 transition-colors ${isZeroScore ? 'opacity-60' : ''} ${rowHighlight}`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white ${getRankBadge(team.rank)}`}>
                          {getRankIcon(team.rank)}
                        </div>
                        {isUserTeam && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-accent-color text-white">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-medium ${isUserTeam ? 'text-accent-light font-bold' : 'text-text-primary'}`}>
                        {team.team_name}
                        {isUserTeam && ' 👥'}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {team.team_size} members • Leader: {team.team_leader}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-bold ${isZeroScore ? 'text-text-secondary' : isUserTeam ? 'text-accent-light' : 'text-accent-light'}`}>
                        {team.total_score.toLocaleString()}
                        {isZeroScore && <span className="text-xs ml-1">(Not started)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-text-secondary">
                        {team.challenges_completed}/{scoreboardData.event_info.total_challenges}
                      </div>
                      {team.challenges_in_progress > 0 && (
                        <div className="text-xs text-warning-color">
                          +{team.challenges_in_progress} in progress
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-text-secondary">
                        {isZeroScore ? '-' : formatTime(team.total_time_seconds)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="text-xs text-text-secondary">
                        {isZeroScore ? 'No activity' : formatDateTime(team.last_solve_time)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-text-secondary">
                        {team.total_attempts || 0}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useScoreboard } from '@/lib/hooks/useScoreboard';
import EventSelector from '@/components/scoreboard/EventSelector';
import LeaderboardDisplay from '@/components/scoreboard/LeaderboardDisplay';

interface LiveScoreboardTabProps {
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}

export default function LiveScoreboardTab({ onShowSuccess, onShowError }: LiveScoreboardTabProps) {
  const {
    scoreboardData,
    loading,
    error,
    selectedEventId,
    selectEvent,
    refreshData,
  } = useScoreboard(undefined, true); // true = admin view (all events)

  return (
    <div className="space-y-6">
      {/* Event Selection with Refresh */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-accent-light font-semibold flex items-center gap-2.5">
            <span className="text-xl">🏆</span>
            Live Scoreboard Management
          </h2>

          {selectedEventId && (
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-3 py-2 bg-accent-color hover:bg-accent-dark disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  🔄 Refresh
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <EventSelector
              selectedEventId={selectedEventId}
              onEventSelect={selectEvent}
              placeholder="Choose an event to view scoreboard..."
              isAdminView={true}
            />
          </div>

          {selectedEventId && (
            <div className="text-sm text-text-secondary">
              Auto-refreshing every 5 seconds
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Display */}
      <LeaderboardDisplay
        scoreboardData={scoreboardData}
        loading={loading}
        error={error}
        userTeamId={null}
      />
    </div>
  );
}

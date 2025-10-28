'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LiveScoreboard } from '@/components/cards';
import { StudentRouteGuard } from '@/components/auth/RoleBasedRouteGuard';
import { hasOngoingEvents, hasAnyEvents, hasUpcomingEvents } from '@/lib/utils/event-utils';
import { useAuth } from '@/lib/context/AuthContext';
import { authAPI } from '@/lib/api';

const mockScoreboardEntries: ScoreboardEntry[] = [
  {
    id: '1',
    rank: 1,
    teamName: 'QuantumPoptarts',
    points: 6242,
    trend: 'stable',
    highlight: 'gold'
  },
  {
    id: '2',
    rank: 2,
    teamName: 'WEH',
    points: 5995,
    trend: 'stable',
    highlight: 'silver'
  },
  {
    id: '3',
    rank: 3,
    teamName: 'TeamName-of-MyChoice',
    points: 5800,
    trend: 'stable',
    highlight: 'bronze'
  },
  {
    id: '4',
    rank: 4,
    teamName: 'The Undecideds',
    points: 5500,
    trend: 'stable'
  },
  {
    id: '5',
    rank: 5,
    teamName: 'Geren',
    points: 5200,
    trend: 'down'
  },
  {
    id: '6',
    rank: 6,
    teamName: 'Goreme',
    points: 5000,
    trend: 'down'
  }
];
import { useScoreboard } from '@/lib/hooks/useScoreboard';
import EventSelector from '@/components/scoreboard/EventSelector';
import LeaderboardDisplay from '@/components/scoreboard/LeaderboardDisplay';
import { ScoreboardEntry } from '@/lib/types';

export default function ScoreboardPage() {
  const { authState, isLoading } = useAuth();
  const router = useRouter();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading scoreboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Please log in</h1>
          <p className="text-text-secondary mb-6">You need to be logged in to access the scoreboard.</p>
          <a 
            href="/login" 
            className="bg-accent-color text-white px-6 py-2 rounded-lg hover:bg-accent-dark transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check event status
  const hasAny = hasAnyEvents(authState.user as any);
  const hasOngoing = hasOngoingEvents(authState.user as any);
  const hasUpcoming = hasUpcomingEvents(authState.user as any);
  
  // Redirect to events page if no events at all
  if (!hasAny) {
    router.push('/events');
    return null;
  }
  
  // Show placeholder if event is upcoming
  if (hasUpcoming && !hasOngoing) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Event Starts Soon</h1>
          <p className="text-text-secondary mb-6">The scoreboard will be available once the event begins.</p>
          <a 
            href="/events" 
            className="bg-accent-color text-white px-6 py-2 rounded-lg hover:bg-accent-dark transition-colors"
          >
            View Events
          </a>
        </div>
      </div>
    );
  }

  // Get user's current active event
  const userCurrentEvent = useMemo(() => {
    if (!authState.user?.events) return null;
    
    const now = new Date();
    return authState.user.events.find(event => {
      const startTime = new Date(event.starts_at);
      const endTime = new Date(event.ends_at);
      return now >= startTime && now <= endTime;
    });
  }, [authState.user?.events]);

  // Get user's team information from API
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTeamId = async () => {
      try {
        const profile = await authAPI.getProfile();
        // Try to get team ID from profile
        if (profile && (profile as any).current_team?.team_id) {
          setUserTeamId((profile as any).current_team.team_id);
        } else if (profile && (profile as any).teams && (profile as any).teams.length > 0) {
          // Fallback: use first team if current_team is not set
          setUserTeamId((profile as any).teams[0].team_id);
        }
      } catch (err) {
        console.error('Error fetching user team ID:', err);
        // Don't block scoreboard loading if profile fetch fails
      }
    };

    if (authState.isAuthenticated) {
      fetchUserTeamId();
    }
  }, [authState.isAuthenticated]);

  const {
    scoreboardData,
    loading,
    error,
    selectedEventId,
    selectEvent,
    refreshData,
    isAutoRefreshing,
  } = useScoreboard(userCurrentEvent?.id, false); // Auto-select user's current event

  // Transform API data to match component expectations
  const transformedEntries: ScoreboardEntry[] = useMemo(() => {
    if (!scoreboardData?.leaderboard.teams) return [];

    return scoreboardData.leaderboard.teams.map((team) => ({
      id: team.team_id,
      rank: team.rank,
      teamName: team.team_name,
      points: team.total_score,
      trend: 'stable' as const, // TODO: Calculate trend based on previous data
      highlight: team.rank <= 3 ? (team.rank === 1 ? 'gold' : team.rank === 2 ? 'silver' : 'bronze') : undefined
    }));
  }, [scoreboardData]);

  return (
    <StudentRouteGuard>
      <div className="min-h-screen bg-primary-bg flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-text-primary">
                  🏆 Event Scoreboard
                </h1>

                {selectedEventId && (
                  <button
                    onClick={refreshData}
                    disabled={loading}
                    className="px-4 py-2 bg-accent-color hover:bg-accent-dark disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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

              {/* Event Selection */}
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <EventSelector
                    selectedEventId={selectedEventId}
                    onEventSelect={selectEvent}
                    placeholder="Select an event to view rankings..."
                    isAdminView={false}
                  />
                </div>

                {selectedEventId && (
                  <div className="text-sm text-text-secondary">
                    Auto-refreshing every 5 seconds
                  </div>
                )}
              </div>
            </div>

            {/* Show loading state */}
            {loading && !scoreboardData && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
                <span className="ml-3 text-text-secondary">Loading scoreboard...</span>
              </div>
            )}

            {/* Show error state */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
                <div className="text-red-400 text-center">
                  <div className="text-lg font-semibold mb-2">Error Loading Scoreboard</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Show event not selected message */}
            {!selectedEventId && (
              <div className="text-center py-12 text-text-secondary">
                <div className="text-sm">No active event to show the scoreboard</div>
              </div>
            )}

            {/* Show leaderboard or legacy component */}
            {selectedEventId && (
              <>
                {/* New detailed leaderboard display with user team highlighting */}
                <LeaderboardDisplay
                  scoreboardData={scoreboardData}
                  loading={loading}
                  error={error}
                  userTeamId={userTeamId}
                  className="mb-8"
                />

                {/* Legacy LiveScoreboard component for compatibility */}
                {transformedEntries.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      Compact View
                    </h2>
                    <LiveScoreboard entries={transformedEntries} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </StudentRouteGuard>
  );
}

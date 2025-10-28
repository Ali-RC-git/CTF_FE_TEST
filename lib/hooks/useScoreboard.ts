/**
 * Scoreboard Hook
 * Manages scoreboard data fetching with automatic intervals
 * Used for both admin and user scoreboard views
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { eventsAPI, EventScoreboardResponse, SimpleScoreboardResponse, ScoreboardSettingsData, TeamScore, BackendEventData, ActiveEventsResponse, LeaderboardTeam } from '@/lib/api/events';
import { APIError } from '@/lib/api';

// Transformer function to convert SimpleScoreboardResponse to EventScoreboardResponse
function transformSimpleToComplexResponse(simple: SimpleScoreboardResponse): EventScoreboardResponse {
  return {
    event_info: {
      id: simple.event_id,
      event_code: simple.event_code,
      name: simple.event_name,
      description: '',
      starts_at: '',
      ends_at: '',
      is_active: simple.is_active,
      total_teams: simple.total_teams,
      total_challenges: simple.total_challenges,
      created_by: '',
    },
    scoreboard_settings: {
      id: simple.event_id,
      event: simple.event_id,
      event_name: simple.event_name,
      event_code: simple.event_code,
      is_public: simple.settings?.is_public || true,
      show_team_names: simple.settings?.show_team_names || true,
      show_scores: simple.settings?.show_scores || true,
      show_solve_times: true,
      freeze_strategy: 'none',
      freeze_at: null,
      is_frozen: simple.is_frozen,
      should_freeze: simple.is_frozen,
      auto_refresh_enabled: true,
      refresh_interval_seconds: 5,
      tie_break_by_time: true,
      tie_break_by_attempts: true,
      max_teams_display: null,
      show_challenge_breakdown: false,
      cache_enabled: false,
      cache_ttl_seconds: 300,
      last_cached_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_teams: simple.total_teams,
      total_challenges: simple.total_challenges,
    },
    leaderboard: {
      total_teams: simple.total_teams,
      last_updated: new Date().toISOString(),
      is_frozen: simple.is_frozen,
      teams: simple.leaderboard.map(team => ({
        rank: team.rank,
        team_id: team.team_id,
        team_name: team.team_name,
        total_score: team.total_score,
        challenges_completed: team.challenges_completed,
        challenges_in_progress: team.challenges_in_progress || 0,
        last_solve_time: team.last_solve_time || new Date().toISOString(),
        total_time_seconds: team.total_time_seconds || 0,
        total_attempts: team.total_attempts || 0,
        score_breakdown: {},
        calculated_at: new Date().toISOString(),
        team_size: team.team_size || 1,
        team_leader: team.team_leader || 'Unknown',
      })),
    },
    recent_activity: {
      total_scores: simple.leaderboard.length,
      pending_verification: 0,
      verified_scores: simple.leaderboard.length,
      recent_scores: [],
    },
    statistics: {
      average_score_per_team: simple.leaderboard.reduce((sum, t) => sum + t.total_score, 0) / simple.leaderboard.length || 0,
      highest_score: Math.max(...simple.leaderboard.map(t => t.total_score), 0),
      lowest_score: Math.min(...simple.leaderboard.map(t => t.total_score), 0),
      total_challenges_completed: simple.leaderboard.reduce((sum, t) => sum + t.challenges_completed, 0),
      average_completion_rate: (simple.leaderboard.reduce((sum, t) => sum + t.challenges_completed, 0) / (simple.total_challenges * simple.total_teams)) * 100 || 0,
    },
  };
}

export interface ScoreboardState {
  scoreboardData: EventScoreboardResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedEventId: string | null;
  isAdmin: boolean;
}

export interface UseScoreboardReturn extends ScoreboardState {
  selectEvent: (eventId: string) => void;
  refreshData: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  isAutoRefreshing: boolean;
}

export function useScoreboard(initialEventId?: string, isAdminView = false): UseScoreboardReturn {
  const [state, setState] = useState<ScoreboardState>({
    scoreboardData: null,
    loading: false,
    error: null,
    lastUpdated: null,
    selectedEventId: initialEventId || null,
    isAdmin: isAdminView,
  });

  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Fetch scoreboard data
  const fetchScoreboardData = useCallback(async (eventId: string) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch complete scoreboard data - backend handles permissions
      let scoreboardData: EventScoreboardResponse;
      
      if (isAdminView) {
        // Admin can see all events - try complex endpoint first, fallback to simple
        try {
          scoreboardData = await eventsAPI.getEventLeaderboard(eventId);
        } catch (error) {
          // Fallback to simple endpoint and transform
          const simpleData = await eventsAPI.getUserEventLeaderboard(eventId);
          scoreboardData = transformSimpleToComplexResponse(simpleData);
        }
      } else {
        // Users can only see registered events - use simplified endpoint
        try {
          const simpleData = await eventsAPI.getUserEventLeaderboard(eventId);
          scoreboardData = transformSimpleToComplexResponse(simpleData);
        } catch (error) {
          // Fallback to alternative endpoint
          try {
            const simpleData = await eventsAPI.getUserEventLeaderboardAlt(eventId);
            scoreboardData = transformSimpleToComplexResponse(simpleData);
          } catch (fallbackError) {
            throw error; // Throw original error
          }
        }
      }

      // Sort teams: teams with 0 points alphabetically at the end
      if (scoreboardData?.leaderboard?.teams) {
        scoreboardData.leaderboard.teams.sort((a, b) => {
          // If both teams have 0 points, sort alphabetically
          if (a.total_score === 0 && b.total_score === 0) {
            return a.team_name.localeCompare(b.team_name);
          }
          // If only team A has 0 points, it goes after team B
          if (a.total_score === 0) return 1;
          // If only team B has 0 points, it goes after team A
          if (b.total_score === 0) return -1;
          // Otherwise, sort by rank (which is based on score)
          return a.rank - b.rank;
        });

        // Recalculate ranks after sorting
        scoreboardData.leaderboard.teams.forEach((team, index) => {
          team.rank = index + 1;
        });
      }

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          scoreboardData,
          loading: false,
          lastUpdated: new Date().toLocaleTimeString(),
          error: null,
        }));
      }
    } catch (error) {
      if (mountedRef.current) {
        const errorMessage = error instanceof APIError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to fetch scoreboard data';

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          scoreboardData: null,
        }));
      }
    }
  }, [isAdminView]);

  // Select event and fetch its data
  const selectEvent = useCallback((eventId: string) => {
    setState(prev => ({ ...prev, selectedEventId: eventId }));
    fetchScoreboardData(eventId);
  }, [fetchScoreboardData]);

  // Manual refresh
  const refreshData = useCallback(async () => {
    if (state.selectedEventId) {
      await fetchScoreboardData(state.selectedEventId);
    }
  }, [state.selectedEventId, fetchScoreboardData]);

  // Start auto refresh - FIXED: Always use 5 seconds regardless of backend settings
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Always use 5 seconds for auto-refresh
    const intervalSeconds = 5;

    intervalRef.current = setInterval(() => {
      if (state.selectedEventId && mountedRef.current) {
        fetchScoreboardData(state.selectedEventId);
      }
    }, intervalSeconds * 1000);

    setIsAutoRefreshing(true);
  }, [state.selectedEventId, fetchScoreboardData]);

  // Stop auto refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoRefreshing(false);
  }, []);

  // Initial load and when selected event changes
  useEffect(() => {
    if (state.selectedEventId) {
      fetchScoreboardData(state.selectedEventId);

      // Always start auto refresh when event is selected (5 second intervals)
      startAutoRefresh();
    } else {
      // Stop auto refresh if no event selected
      stopAutoRefresh();
    }

    // Cleanup interval on dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.selectedEventId, fetchScoreboardData]);

  // Remove the useEffect that depends on backend settings for refresh interval
  // This ensures we always use 5 seconds regardless of backend settings

  return {
    ...state,
    selectEvent,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshing,
  };
}

// Hook for fetching only active events (for dropdown)
export function useActiveEvents(isAdminView = false) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(isAdminView);

  const fetchActiveEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response: ActiveEventsResponse;
      
      if (isAdminView) {
        // Fetch all active events for admin
        response = await eventsAPI.getActiveEvents();
      } else {
        // Fetch only user's registered events
        response = await eventsAPI.getUserRegisteredEvents();
      }

      // Transform BackendEventData to frontend format from active_events array
      const eventsArray = response.active_events || [];
      const transformedEvents = eventsArray.map(event => ({
        id: event.id,
        eventName: event.name,
        eventCode: event.event_code,
        startDate: event.starts_at,
        endDate: event.ends_at,
        description: event.description,
        isActive: event.is_active,
        totalChallenges: event.total_challenges,
        totalTeams: event.total_teams,
        createdAt: event.created_at,
        hasScoreboard: event.has_scoreboard,
        isScoreboardFrozen: event.is_scoreboard_frozen,
        maxParticipants: 500, // Default value
        registrationStatus: event.is_active ? 'Open' : 'Closed',
        updatedAt: event.created_at, // Backend doesn't provide updated_at
      }));
      setEvents(transformedEvents);
    } catch (err) {
      const errorMessage = err instanceof APIError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to fetch events';

      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [isAdminView]);

  useEffect(() => {
    fetchActiveEvents();
  }, [fetchActiveEvents]);

  return {
    events,
    loading,
    error,
    isAdmin,
    refetch: fetchActiveEvents,
  };
}
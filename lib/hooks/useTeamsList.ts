import { useState, useEffect, useCallback } from 'react';
import { teamsAPI, Team } from '@/lib/api';

// Global cache for teams data to prevent duplicate API calls
let globalTeamsCache: {
  data: Team[] | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number;
} = {
  data: null,
  isLoading: false,
  error: null,
  lastFetch: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface UseTeamsListReturn {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  clearError: () => void;
}

export function useTeamsList(): UseTeamsListReturn {
  const [teams, setTeams] = useState<Team[]>(globalTeamsCache.data || []);
  const [isLoading, setIsLoading] = useState(globalTeamsCache.isLoading);
  const [error, setError] = useState<string | null>(globalTeamsCache.error);

  const fetchTeams = useCallback(async () => {
    const now = Date.now();
    
    // If we have cached data and it's still fresh, use it
    if (globalTeamsCache.data && (now - globalTeamsCache.lastFetch) < CACHE_DURATION) {
      setTeams(globalTeamsCache.data);
      return;
    }

    // If already loading, don't start another request
    if (globalTeamsCache.isLoading) {
      setIsLoading(true);
      return;
    }

    globalTeamsCache.isLoading = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the available teams API that filters for active and non-full teams
      const teamsList = await teamsAPI.listAvailableTeams();
      globalTeamsCache.data = teamsList;
      globalTeamsCache.lastFetch = now;
      globalTeamsCache.error = null;
      setTeams(teamsList);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      const errorMessage = 'Failed to load teams';
      globalTeamsCache.error = errorMessage;
      setError(errorMessage);
    } finally {
      globalTeamsCache.isLoading = false;
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    globalTeamsCache.error = null;
    setError(null);
  }, []);

  // Fetch teams on mount only if not already cached or if cache is stale
  useEffect(() => {
    const now = Date.now();
    if (!globalTeamsCache.data || (now - globalTeamsCache.lastFetch) >= CACHE_DURATION) {
      fetchTeams();
    }
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    error,
    fetchTeams,
    clearError
  };
}

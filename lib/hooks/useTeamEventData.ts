/**
 * Hook for fetching team event data including challenges and progress
 * Integrates with Redis for challenge progress and DB for challenge details
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { challengesAPI, eventsAPI, authAPI, APIError } from '@/lib/api';
import { Challenge, ChallengeUserProgress } from '@/lib/types';

export interface TeamEventProgress {
  totalChallenges: number;
  completedChallenges: number;
  inProgressChallenges: number;
  unsolvedChallenges: number;
  totalScore: number;
  rank: number | null;
  lastActivity: string | null;
}

export interface TeamChallengeData extends Omit<Challenge, 'timeSpent'> {
  progress: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  timeSpent?: number;
  questionsAnswered?: number;
  totalQuestions?: number;
  startedAt?: string;
  lastUpdated?: string;
}

export interface TeamEventDataState {
  eventData: any | null;
  challenges: TeamChallengeData[];
  progress: TeamEventProgress;
  recentActivity: any[];
  loading: boolean;
  error: string | null;
}

interface UseTeamEventDataReturn extends TeamEventDataState {
  refetchData: () => Promise<void>;
  startChallenge: (challengeId: string) => Promise<void>;
}

export function useTeamEventData(eventId?: string): UseTeamEventDataReturn {
  const [state, setState] = useState<TeamEventDataState>({
    eventData: null,
    challenges: [],
    progress: {
      totalChallenges: 0,
      completedChallenges: 0,
      inProgressChallenges: 0,
      unsolvedChallenges: 0,
      totalScore: 0,
      rank: null,
      lastActivity: null,
    },
    recentActivity: [],
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);
  const teamIdRef = useRef<string | null>(null);

  // Fetch team ID from user profile
  const fetchTeamId = useCallback(async (): Promise<string | null> => {
    try {
      const profile = await authAPI.getProfile();
      const teamId = (profile as any).current_team?.team_id || (profile as any).teams?.[0]?.team_id;
      teamIdRef.current = teamId;
      return teamId;
    } catch (err) {
      console.error('Error fetching team ID:', err);
      return null;
    }
  }, []);

  // Fetch all team event data
  const fetchTeamEventData = useCallback(async () => {
    if (!eventId || !mountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Get team ID
      const teamId = teamIdRef.current || (await fetchTeamId());
      if (!teamId) {
        throw new Error('No team found. Please join a team first.');
      }

      // Fetch data in parallel
      const [challengesResponse, userProgressArray, teamScoreData] = await Promise.all([
        challengesAPI.listChallenges({ event_id: eventId }),
        challengesAPI.getUserProgress().catch(() => []),
        eventsAPI.getTeamScore(eventId, teamId).catch(() => null),
      ]);

      // Get challenges array
      const challengesList = Array.isArray(challengesResponse)
        ? challengesResponse
        : challengesResponse.results || [];

      // Create progress map from user progress
      const progressMap = new Map<string, ChallengeUserProgress>();
      userProgressArray.forEach((prog) => {
        progressMap.set(prog.challengeId, prog);
      });

      // Fetch Redis progress for each challenge
      const challengeProgressPromises = challengesList.map(async (challenge) => {
        try {
          const progressResponse = await challengesAPI.getChallengeProgressRedis(
            challenge.id,
            eventId,
            teamId
          );
          
          if (progressResponse.success && progressResponse.data) {
            const redisProgress = progressResponse.data;
            return {
              challengeId: challenge.id,
              redisData: redisProgress,
            };
          }
        } catch (err) {
          // No progress for this challenge
          return null;
        }
        return null;
      });

      const progressResults = await Promise.all(challengeProgressPromises);
      const redisProgressMap = new Map();
      progressResults.forEach((result) => {
        if (result) {
          redisProgressMap.set(result.challengeId, result.redisData);
        }
      });

      // Transform challenges with progress
      const challengesWithProgress: TeamChallengeData[] = challengesList.map((challenge) => {
        const prog = progressMap.get(challenge.id);
        const redisProgress = redisProgressMap.get(challenge.id);
        
        let progress: 'not_started' | 'in_progress' | 'completed' = 'not_started';
        let timeSpent = 0;
        let questionsAnswered = 0;
        let score = 0;
        let startedAt: string | undefined;
        let lastUpdated: string | undefined;

        if (redisProgress) {
          // Use Redis data (most accurate)
          timeSpent = redisProgress.total_time_spent_seconds || 0;
          questionsAnswered = redisProgress.total_questions_answered || 0;
          score = redisProgress.total_points_earned || 0;
          startedAt = redisProgress.started_at;
          lastUpdated = redisProgress.last_updated;
          
          // Determine progress based on Redis data
          const totalQuestions = challenge.questions?.length || Object.keys(redisProgress.questions || {}).length;
          if (questionsAnswered === totalQuestions && questionsAnswered > 0) {
            progress = 'completed';
          } else if (questionsAnswered > 0 || timeSpent > 0) {
            progress = 'in_progress';
          }
        } else if (prog) {
          // Fallback to user progress API
          if (prog.status === 'completed') {
            progress = 'completed';
          } else if (prog.status === 'in_progress' || prog.startedAt) {
            progress = 'in_progress';
          }
          score = prog.pointsEarned || 0;
          timeSpent = prog.timeSpent || 0;
          questionsAnswered = prog.questionsAnswered || 0;
        }

        return {
          ...challenge,
          progress,
          score,
          timeSpent,
          questionsAnswered,
          totalQuestions: challenge.questions?.length || prog?.totalQuestions || 0,
          startedAt,
          lastUpdated,
        };
      });

      // Calculate progress stats
      const completedCount = challengesWithProgress.filter((c) => c.progress === 'completed').length;
      const inProgressCount = challengesWithProgress.filter((c) => c.progress === 'in_progress').length;
      const totalCount = challengesWithProgress.length;

      // Try to fetch leaderboard to get rank
      let rank: number | null = null;
      try {
        const leaderboardData = await eventsAPI.getEventLeaderboard(eventId);
        const teamInLeaderboard = leaderboardData.leaderboard.teams.find(
          (t) => t.team_id === teamId
        );
        rank = teamInLeaderboard?.rank || null;
      } catch (err) {
        console.log('Could not fetch leaderboard rank:', err);
      }

      // Update state
      if (mountedRef.current) {
        setState({
          eventData: teamScoreData || { event_id: eventId },
          challenges: challengesWithProgress,
          progress: {
            totalChallenges: totalCount,
            completedChallenges: completedCount,
            inProgressChallenges: inProgressCount,
            unsolvedChallenges: totalCount - completedCount - inProgressCount,
            totalScore: teamScoreData?.total_score || 0,
            rank,
            lastActivity: teamScoreData?.last_activity || null,
          },
          recentActivity: [], // Will be populated from Redis/backend
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error fetching team event data:', error);
      if (mountedRef.current) {
        const errorMessage =
          error instanceof APIError
            ? error.message
            : error instanceof Error
            ? error.message
            : 'Failed to fetch team event data';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    }
  }, [eventId, fetchTeamId]);

  // Start a challenge
  const startChallenge = useCallback(async (challengeId: string) => {
    try {
      await challengesAPI.startChallenge(challengeId);
      // Refetch data after starting
      await fetchTeamEventData();
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  }, [fetchTeamEventData]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (eventId) {
      fetchTeamEventData();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [eventId, fetchTeamEventData]);

  return {
    ...state,
    refetchData: fetchTeamEventData,
    startChallenge,
  };
}


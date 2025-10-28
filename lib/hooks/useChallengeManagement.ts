/**
 * Custom hook for challenge management
 * Provides challenge-related operations and state management for admin functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { challengesAPI, APIError } from '@/lib/api';
import { 
  Challenge,
  ChallengeDetail,
  CreateChallengeRequest, 
  UpdateChallengeRequest, 
  BulkUpdateRequest as ChallengeBulkUpdateRequest,
  ChallengeSubmissionsResponse,
  ChallengeAnalytics
} from '@/lib/api/challenges';

interface UseChallengeManagementState {
  challenges: Challenge[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseChallengeManagementReturn extends UseChallengeManagementState {
  // Challenge operations
  createChallenge: (data: CreateChallengeRequest) => Promise<Challenge>;
  updateChallenge: (challengeId: string, data: UpdateChallengeRequest) => Promise<Challenge>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  duplicateChallenge: (challengeId: string, newTitle?: string) => Promise<Challenge>;
  bulkUpdateChallenges: (data: ChallengeBulkUpdateRequest) => Promise<{ message: string; updated_count: number }>;
  
  // Data fetching
  fetchChallenges: (params?: {
    search?: string;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    status?: 'draft' | 'published' | 'archived';
    is_featured?: boolean;
    is_visible?: boolean;
    tags?: string[];
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => Promise<void>;
  fetchChallenge: (challengeId: string) => Promise<ChallengeDetail>;
  fetchChallengeSubmissions: (challengeId: string, params?: {
    page?: number;
    page_size?: number;
    is_correct?: boolean;
    ordering?: string;
  }) => Promise<ChallengeSubmissionsResponse>;
  fetchChallengeAnalytics: (challengeId: string) => Promise<ChallengeAnalytics>;
  
  // Import/Export
  exportChallenges: (params?: {
    format?: 'json' | 'csv' | 'xlsx';
    category?: string;
    difficulty?: string;
    status?: string;
  }) => Promise<Blob>;
  importChallenges: (file: File) => Promise<{ message: string; imported_count: number; errors: string[] }>;
  
  // Utility functions
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export function useChallengeManagement(): UseChallengeManagementReturn {
  const [state, setState] = useState<UseChallengeManagementState>({
    challenges: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetch challenges list with optional filters
   */
  const fetchChallenges = useCallback(async (params?: {
    search?: string;
    category?: string;
    difficulty?: string;
    status?: string;
    is_featured?: boolean;
    is_visible?: boolean;
    tags?: string[];
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await challengesAPI.listChallenges(params);
      
      // Handle paginated response
      setState(prev => ({
        ...prev,
        challenges: response.results || [],
        totalCount: response.count || 0,
        currentPage: params?.page || 1,
        hasNextPage: !!response.next,
        hasPreviousPage: !!response.previous,
        isLoading: false
      }));
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to fetch challenges')
        : 'An unexpected error occurred';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Fetch a single challenge by ID
   */
  const fetchChallenge = useCallback(async (challengeId: string): Promise<ChallengeDetail> => {
    setLoading(true);
    setError(null);

    try {
      const challenge = await challengesAPI.getChallenge(challengeId);
      setLoading(false);
      return challenge;
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to fetch challenge')
        : 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch specific challenge
   */
  const getChallengeDetail = useCallback(async (challengeId: string): Promise<ChallengeDetail> => {
    return fetchChallenge(challengeId);
  }, [fetchChallenge]);

  /**
   * Create a new challenge
   */
  const createChallenge = useCallback(async (data: CreateChallengeRequest): Promise<Challenge> => {
    setLoading(true);
    setError(null);

    try {
      const newChallenge = await challengesAPI.createChallenge(data);
      await fetchChallenges(); // Refresh the list
      return newChallenge;
    } catch (err) {
      console.error('Failed to create challenge:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to create challenge')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchChallenges]);

  /**
   * Update an existing challenge
   */
  const updateChallenge = useCallback(async (
    challengeId: string, 
    data: UpdateChallengeRequest
  ): Promise<Challenge> => {
    setLoading(true);
    setError(null);

    try {
      const updatedChallenge = await challengesAPI.updateChallenge(challengeId, data);
      await fetchChallenges(); // Refresh the list
      return updatedChallenge;
    } catch (err) {
      console.error('Failed to update challenge:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to update challenge')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchChallenges]);

  /**
   * Delete a challenge
   */
  const deleteChallenge = useCallback(async (challengeId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await challengesAPI.deleteChallenge(challengeId);
      await fetchChallenges(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to delete challenge')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchChallenges]);

  /**
   * Duplicate a challenge
   */
  const duplicateChallenge = useCallback(async (
    challengeId: string, 
    newTitle?: string
  ): Promise<Challenge> => {
    setLoading(true);
    setError(null);

    try {
      const duplicated = await challengesAPI.duplicateChallenge(challengeId, newTitle);
      await fetchChallenges(); // Refresh the list
      return duplicated;
    } catch (err) {
      console.error('Failed to duplicate challenge:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to duplicate challenge')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchChallenges]);

  /**
   * Bulk update challenges
   */
  const bulkUpdateChallenges = useCallback(async (
    data: ChallengeBulkUpdateRequest
  ): Promise<{ message: string; updated_count: number }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await challengesAPI.bulkUpdateChallenges(data);
      await fetchChallenges(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Failed to bulk update challenges:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to bulk update challenges')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchChallenges]);

  /**
   * Fetch challenge submissions
   */
  const fetchChallengeSubmissions = useCallback(async (
    challengeId: string,
    params?: {
      page?: number;
      page_size?: number;
      is_correct?: boolean;
      ordering?: string;
    }
  ): Promise<ChallengeSubmissionsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const submissions = await challengesAPI.getChallengeSubmissions(challengeId, params);
      setLoading(false);
      return submissions;
    } catch (err) {
      console.error('Failed to fetch challenge submissions:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to fetch submissions')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch challenge analytics
   */
  const fetchChallengeAnalytics = useCallback(async (
    challengeId: string
  ): Promise<ChallengeAnalytics> => {
    setLoading(true);
    setError(null);

    try {
      const analytics = await challengesAPI.getChallengeAnalytics(challengeId);
      setLoading(false);
      return analytics;
    } catch (err) {
      console.error('Failed to fetch challenge analytics:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to fetch analytics')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export challenges
   */
  const exportChallenges = useCallback(async (params?: {
    format?: 'json' | 'csv' | 'xlsx';
    category?: string;
    difficulty?: string;
    status?: string;
  }): Promise<Blob> => {
    setLoading(true);
    setError(null);

    try {
      const blob = await challengesAPI.exportChallenges(params);
      setLoading(false);
      return blob;
    } catch (err) {
      console.error('Failed to export challenges:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to export challenges')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Import challenges from file
   */
  const importChallenges = useCallback(async (
    file: File
  ): Promise<{ message: string; imported_count: number; errors: string[] }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await challengesAPI.importChallenges(file);
      await fetchChallenges(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Failed to import challenges:', err);
      const errorMessage = err instanceof APIError 
        ? (err.getGeneralError() || 'Failed to import challenges')
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchChallenges]);

  /**
   * Refresh current data
   */
  const refreshData = useCallback(async () => {
    await fetchChallenges({ page: state.currentPage });
  }, [fetchChallenges, state.currentPage]);

  return {
    ...state,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    duplicateChallenge,
    bulkUpdateChallenges,
    fetchChallenges,
    fetchChallenge,
    fetchChallengeSubmissions,
    fetchChallengeAnalytics,
    exportChallenges,
    importChallenges,
    clearError,
    refreshData
  };
}

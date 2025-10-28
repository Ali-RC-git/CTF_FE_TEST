import { useState, useCallback } from 'react';
import { teamsAPI } from '@/lib/api';
import { APIError } from '@/lib/api';

interface UseTeamManagementReturn {
  isLoading: boolean;
  error: string | null;
  addUserToTeam: (teamId: string, userId: string, role: 'leader' | 'member') => Promise<void>;
  removeUserFromTeam: (teamId: string, userId: string) => Promise<void>;
  updateUserRoleInTeam: (teamId: string, userId: string, role: 'leader' | 'member') => Promise<void>;
  getUserTeams: (userId: string) => Promise<any>;
  joinTeam: (teamId: string, inviteCode?: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  clearError: () => void;
}

export function useTeamManagement(): UseTeamManagementReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUserToTeam = useCallback(async (teamId: string, userId: string, role: 'leader' | 'member') => {
    setIsLoading(true);
    setError(null);
    
    try {
      await teamsAPI.addUserToTeam(teamId, userId, role);
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to add user to team';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeUserFromTeam = useCallback(async (teamId: string, userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await teamsAPI.removeUserFromTeam(teamId, userId);
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to remove user from team';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserRoleInTeam = useCallback(async (teamId: string, userId: string, role: 'leader' | 'member') => {
    setIsLoading(true);
    setError(null);
    
    try {
      await teamsAPI.updateUserRoleInTeam(teamId, userId, role);
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to update user role in team';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserTeams = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await teamsAPI.getUserTeams(userId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to get user teams';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinTeam = useCallback(async (teamId: string, inviteCode?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await teamsAPI.joinTeam({ invite_code: inviteCode || '' });
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to join team';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveTeam = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await teamsAPI.leaveTeam(teamId);
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to leave team';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    addUserToTeam,
    removeUserFromTeam,
    updateUserRoleInTeam,
    getUserTeams,
    joinTeam,
    leaveTeam,
    clearError
  };
}

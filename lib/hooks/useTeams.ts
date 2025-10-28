/**
 * Custom hook for team management
 * Provides team-related operations and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { teamsAPI, APIError } from '@/lib/api';
import { CreateTeamRequest, JoinTeamRequest, TeamInvitation } from '@/lib/api';
import { Team, JoinRequest } from '@/lib/types';
import { mapBackendTeamToTeam } from '@/lib/utils/api-mappers';

interface UseTeamsState {
  teams: Team[];
  myTeams: Team[];
  invitations: TeamInvitation[];
  isLoading: boolean;
  error: string | null;
}

interface UseTeamsReturn extends UseTeamsState {
  // Team operations
  createTeam: (data: CreateTeamRequest) => Promise<Team>;
  joinTeam: (data: JoinTeamRequest) => Promise<Team>;
  leaveTeam: (teamId: string) => Promise<void>;
  updateTeam: (teamId: string, data: Partial<CreateTeamRequest>) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  getTeam: (teamId: string) => Promise<any>;
  
  // Data fetching
  fetchTeams: () => Promise<void>;
  fetchMyTeams: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  
  // Invitation operations
  sendInvitation: (teamId: string, email: string, message?: string) => Promise<TeamInvitation>;
  acceptInvitation: (invitationId: string) => Promise<TeamInvitation>;
  declineInvitation: (invitationId: string) => Promise<TeamInvitation>;
  
  // Join request operations (admin only)
  getJoinRequests: (params?: { page?: number; limit?: number; status?: string; team_id?: string }) => Promise<JoinRequest[]>;
  approveJoinRequest: (requestId: string) => Promise<JoinRequest>;
  rejectJoinRequest: (requestId: string) => Promise<JoinRequest>;
  
  // Utility functions
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export function useTeams(): UseTeamsReturn {
  const [state, setState] = useState<UseTeamsState>({
    teams: [],
    myTeams: [],
    invitations: [],
    isLoading: false,
    error: null
  });

  // Use ref to track if initial data has been loaded
  const hasLoadedInitialData = useRef(false);

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch all teams
  const fetchTeams = useCallback(async () => {
    try {
      const response = await teamsAPI.listTeams();
      const teams = response.results.map(mapBackendTeamToTeam);
      setState(prev => ({ ...prev, teams }));
    } catch (error) {
      // Handle 404 or other errors gracefully
      if (error instanceof APIError && error.status === 404) {
        console.log('Teams endpoint not found - using empty teams list');
        setState(prev => ({ ...prev, teams: [] }));
      } else {
        console.warn('Failed to fetch teams:', error);
        setState(prev => ({ ...prev, teams: [] }));
      }
    }
  }, []);

  // Fetch user's teams
  const fetchMyTeams = useCallback(async () => {
    try {
      const response = await teamsAPI.getMyTeams();
      const myTeams = response.results.map(mapBackendTeamToTeam);
      setState(prev => ({ ...prev, myTeams }));
    } catch (error) {
      // Silently handle 404 errors for my teams - user might not be in any teams yet
      if (error instanceof APIError && error.status === 404) {
        console.log('No teams found for user - this is normal for new users');
        setState(prev => ({ ...prev, myTeams: [] }));
      } else {
        console.warn('Failed to fetch user teams:', error);
        setState(prev => ({ ...prev, myTeams: [] }));
      }
    }
  }, []);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    try {
      const response = await teamsAPI.getUserPendingInvitations();
      setState(prev => ({ ...prev, invitations: response.results }));
    } catch (error) {
      // Silently handle 404 errors for invitations - user might not have any invitations
      if (error instanceof APIError && error.status === 404) {
        console.log('No invitations found for user - this is normal');
        setState(prev => ({ ...prev, invitations: [] }));
      } else {
        console.warn('Failed to fetch invitations:', error);
        setState(prev => ({ ...prev, invitations: [] }));
      }
    }
  }, []);

  // Create team
  const createTeam = useCallback(async (data: CreateTeamRequest): Promise<Team> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating team with data:', data);
      const backendTeam = await teamsAPI.createTeam(data);
      console.log('Backend team response:', backendTeam);
      const team = mapBackendTeamToTeam(backendTeam);
      
      // The current user is automatically added as the team leader by the backend
      // when they create a team, so we don't need to manually add them
      
      // Add to my teams
      setState(prev => ({ 
        ...prev, 
        myTeams: [...prev.myTeams, team] 
      }));
      
      return team;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to create team';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join team
  const joinTeam = useCallback(async (data: JoinTeamRequest): Promise<Team> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.joinTeam(data);
      const team = mapBackendTeamToTeam(response.team);
      
      // Add to my teams
      setState(prev => ({ 
        ...prev, 
        myTeams: [...prev.myTeams, team] 
      }));
      
      return team;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to join team';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave team
  const leaveTeam = useCallback(async (teamId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.leaveTeam(teamId);
      
      // Remove from my teams
      setState(prev => ({ 
        ...prev, 
        myTeams: prev.myTeams.filter(team => team.id !== teamId) 
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to leave team';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update team
  const updateTeam = useCallback(async (teamId: string, data: Partial<CreateTeamRequest>): Promise<Team> => {
    setLoading(true);
    setError(null);
    
    try {
      const backendTeam = await teamsAPI.updateTeam(teamId, data);
      const team = mapBackendTeamToTeam(backendTeam);
      
      // Update in my teams
      setState(prev => ({ 
        ...prev, 
        myTeams: prev.myTeams.map(t => t.id === teamId ? team : t) 
      }));
      
      return team;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to update team';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete team
  const deleteTeam = useCallback(async (teamId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.deleteTeam(teamId);
      
      // Remove from my teams
      setState(prev => ({ 
        ...prev, 
        myTeams: prev.myTeams.filter(team => team.id !== teamId) 
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to delete team';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get team details
  const getTeam = useCallback(async (teamId: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const backendTeam = await teamsAPI.getTeam(teamId);
      // Return raw backend response without mapping
      return backendTeam;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to get team details';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send invitation
  const sendInvitation = useCallback(async (teamId: string, email: string, message?: string): Promise<TeamInvitation> => {
    setLoading(true);
    setError(null);
    
    try {
      const invitation = await teamsAPI.sendInvitation(teamId, {
        invited_user_email: email,
        message: message || 'Join our team!',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });
      
      return invitation;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to send invitation';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept invitation
  const acceptInvitation = useCallback(async (invitationId: string): Promise<TeamInvitation> => {
    setLoading(true);
    setError(null);
    
    try {
      const invitation = await teamsAPI.respondToInvitation(invitationId, { status: 'accepted' });
      
      // Remove from invitations
      setState(prev => ({ 
        ...prev, 
        invitations: prev.invitations.filter(inv => inv.id !== invitationId) 
      }));
      
      // Refresh my teams
      await fetchMyTeams();
      
      return invitation;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to accept invitation';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMyTeams]);

  // Decline invitation
  const declineInvitation = useCallback(async (invitationId: string): Promise<TeamInvitation> => {
    setLoading(true);
    setError(null);
    
    try {
      const invitation = await teamsAPI.respondToInvitation(invitationId, { status: 'declined' });
      
      // Remove from invitations
      setState(prev => ({ 
        ...prev, 
        invitations: prev.invitations.filter(inv => inv.id !== invitationId) 
      }));
      
      return invitation;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to decline invitation';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get join requests (admin only)
  const getJoinRequests = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    team_id?: string;
  }): Promise<JoinRequest[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getJoinRequests(params);
      return (response.results || []).map(apiRequest => ({
        ...apiRequest,
        team: {
          id: apiRequest.team,
          name: apiRequest.team_name,
          current_size: 0,
          max_size: 4,
          is_full: false
        },
        user: {
          id: apiRequest.requested_by,
          email: apiRequest.requested_by_email,
          username: apiRequest.requested_by_email.split('@')[0],
          first_name: apiRequest.requested_by_email.split('@')[0],
          last_name: '',
          full_name: apiRequest.requested_by_email.split('@')[0],
          role: 'member',
          status: 'active',
          created_at: apiRequest.created_at,
          last_login_at: null,
          profile: {}
        },
        updated_at: apiRequest.created_at
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to get join requests';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve join request
  const approveJoinRequest = useCallback(async (requestId: string): Promise<JoinRequest> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await teamsAPI.approveJoinRequest(requestId);      
      return {
        ...result,
        team: {
          id: result.team,
          name: result.team_name,
          current_size: 0,
          max_size: 4,
          is_full: false
        },
        user: {
          id: result.requested_by,
          email: result.requested_by_email,
          username: result.requested_by_email.split('@')[0],
          first_name: result.requested_by_email.split('@')[0],
          last_name: '',
          full_name: result.requested_by_email.split('@')[0],
          role: 'member',
          status: 'active',
          profile: {}
        },
        updated_at: result.created_at
      };
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to approve join request';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject join request
  const rejectJoinRequest = useCallback(async (requestId: string): Promise<JoinRequest> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await teamsAPI.rejectJoinRequest(requestId);       
      return {
        ...result,
        team: {
          id: result.team,
          name: result.team_name,
          current_size: 0,
          max_size: 4,
          is_full: false
        },
        user: {
          id: result.requested_by,
          email: result.requested_by_email,
          username: result.requested_by_email.split('@')[0],
          first_name: result.requested_by_email.split('@')[0],
          last_name: '',
          full_name: result.requested_by_email.split('@')[0],
          role: 'member',
          status: 'active',
          profile: {}
        },
        updated_at: result.created_at
      };
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to reject join request';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all data - optimized to prevent circular dependencies
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch teams first (this is the main data we need)
      const teamsResponse = await teamsAPI.listTeams();
      const teams = teamsResponse.results.map(mapBackendTeamToTeam);
      setState(prev => ({ ...prev, teams }));
      
      // Fetch user-specific data in parallel (these might fail with 404 for new users)
      await Promise.allSettled([
        // Fetch my teams
        teamsAPI.getMyTeams().then(response => {
          const myTeams = response.results.map(mapBackendTeamToTeam);
          setState(prev => ({ ...prev, myTeams }));
        }).catch(error => {
          if (error instanceof APIError && error.status === 404) {
            console.log('My teams endpoint not found - using empty teams list');
            setState(prev => ({ ...prev, myTeams: [] }));
          } else {
            console.warn('Failed to fetch my teams:', error);
          }
        }),
        
        // Fetch invitations
        teamsAPI.getUserPendingInvitations().then(response => {
          setState(prev => ({ ...prev, invitations: response.results }));
        }).catch(error => {
          if (error instanceof APIError && error.status === 404) {
            console.log('Invitations endpoint not found - using empty invitations list');
            setState(prev => ({ ...prev, invitations: [] }));
          } else {
            console.warn('Failed to fetch invitations:', error);
          }
        })
      ]);
    } catch (error) {
      // Only show error if the main teams fetch fails
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch teams';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent circular calls

  // Load initial data - run only once on mount
  useEffect(() => {
    if (!hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      refreshData();
    }
  }, []); // Empty dependency array to prevent infinite calls

  return {
    ...state,
    createTeam,
    joinTeam,
    leaveTeam,
    updateTeam,
    deleteTeam,
    getTeam,
    fetchTeams,
    fetchMyTeams,
    fetchInvitations,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    clearError,
    refreshData
  };
}

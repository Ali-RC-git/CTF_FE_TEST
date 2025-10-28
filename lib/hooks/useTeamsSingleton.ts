/**
 * Singleton hook for team management
 * Ensures API calls are made only once across the entire application
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { teamsAPI, APIError } from '@/lib/api';
import { CreateTeamRequest, JoinTeamRequest, TeamInvitation, AvailableTeam, RequestStats, AdminDashboardStats, TeamRequest, SendInvitationRequest, RespondToInvitationRequest, Team as APITeam } from '@/lib/api';
import { Team, JoinRequest } from '@/lib/types';
import { mapBackendTeamToTeam } from '@/lib/utils/api-mappers';

interface UseTeamsState {
  teams: Team[];
  myTeams: Team[];
  invitations: TeamInvitation[];
  requests: TeamRequest[];
  availableTeams: AvailableTeam[];
  requestStats: RequestStats | null;
  leaderRequests: TeamRequest[];
  leaderRequestStats: { [teamId: string]: any } | null;
  teamRequests: { [teamId: string]: TeamRequest[] } | null;
  teamDetails: { [teamId: string]: APITeam } | null;
  allRequests: TeamRequest[];
  adminRequestStats: any | null;
  adminDashboardStats: AdminDashboardStats | null;
  teamsPagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  isLoading: boolean;
  error: string | null;
  // Additional properties referenced in the code
  userInvitations: TeamInvitation[];
  invitationsPagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  teamInvitations: { [teamId: string]: TeamInvitation[] };
  availableUsers: { [teamId: string]: any[] };
  availableUsersPagination: { [teamId: string]: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }};
}

interface UseTeamsReturn {
  // Data
  teams: Team[];
  myTeams: Team[];
  invitations: TeamInvitation[];
  requests: TeamRequest[];
  availableTeams: AvailableTeam[];
  requestStats: RequestStats | null;
  leaderRequests: TeamRequest[];
  leaderRequestStats: { [teamId: string]: any } | null;
  teamRequests: { [teamId: string]: TeamRequest[] } | null;
  teamDetails: { [teamId: string]: APITeam } | null;
  allRequests: TeamRequest[];
  adminRequestStats: any | null;
  adminDashboardStats: AdminDashboardStats | null;
  // Pagination data
  teamsPagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createTeam: (data: CreateTeamRequest) => Promise<Team>;
  updateTeam: (teamId: string, data: any) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  joinTeam: (data: JoinTeamRequest) => Promise<Team>;
  leaveTeam: (teamId: string) => Promise<void>;
  // Invitation Actions
  fetchUserInvitations: (userId: string, params?: { page?: number; status?: string }) => Promise<void>;
  sendInvitation: (teamId: string, data: SendInvitationRequest) => Promise<TeamInvitation>;
  respondToInvitation: (invitationId: string, data: RespondToInvitationRequest) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  fetchTeamInvitations: (teamId: string, params?: { page?: number; status?: string }) => Promise<void>;
  getInvitationDetails: (invitationId: string) => Promise<TeamInvitation>;
  fetchAvailableUsers: (teamId: string, params?: { page?: number; search?: string }) => Promise<void>;
  fetchPendingTeamInvitations: (teamId: string) => Promise<void>;
  fetchPendingUserInvitations: () => Promise<void>;
  fetchUserPendingInvitations: (params?: { page?: number }) => Promise<void>;
  // Team Management
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
  
  // Team Request Actions
  sendTeamRequest: (teamId: string, data: { message: string }) => Promise<TeamRequest>;
  cancelTeamRequest: (requestId: string) => Promise<void>;
  approveTeamRequest: (requestId: string) => Promise<void>;
  rejectTeamRequest: (requestId: string) => Promise<void>;
  
  // Team Request System Actions
  fetchAvailableTeams: (params?: { search?: string }) => Promise<void>;
  fetchRequestStats: (teamId: string) => Promise<void>;
  bulkActionRequests: (action: 'approve' | 'reject', requestIds: string[]) => Promise<void>;
  
  // Team Leader Actions
  fetchLeaderRequests: (params?: { status?: string }) => Promise<void>;
  respondToRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  bulkRespondToRequests: (action: 'approve' | 'reject', requestIds: string[]) => Promise<void>;
  fetchTeamRequestStats: (teamId: string) => Promise<void>;
  fetchTeamRequests: (teamId: string, params?: { status?: string }) => Promise<void>;
  fetchTeamDetails: (teamId: string) => Promise<void>;
  
  // Admin Actions
  fetchAllRequests: (params?: { page?: number; status?: string; team?: string; search?: string }) => Promise<void>;
  fetchAdminRequestStats: () => Promise<void>;
  fetchAdminDashboardStats: () => Promise<void>;
  
  // Data fetching
  fetchTeams: (params?: { page?: number; limit?: number; search?: string; status?: string; is_invite_only?: boolean }) => Promise<void>;
  fetchMyTeams: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  
  // Pagination actions
  setTeamsPage: (page: number) => void;
  setTeamsPageSize: (pageSize: number) => void;
  
  // Utility functions
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Global state - shared across all instances
let globalState: UseTeamsState = {
  teams: [],
  myTeams: [],
  invitations: [],
  requests: [],
  availableTeams: [],
  requestStats: null,
  leaderRequests: [],
  leaderRequestStats: null,
  teamRequests: null,
  allRequests: [],
  adminRequestStats: null,
  adminDashboardStats: null,
  teamDetails: null,
  teamsPagination: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  },
  isLoading: false,
  error: null,
  userInvitations: [],
  invitationsPagination: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  },
  teamInvitations: {},
  availableUsers: {},
  availableUsersPagination: {}
};

// Global refs to track loading state
let isLoadingRef = false;
let hasLoadedInitialData = false;
let subscribers = new Set<() => void>();

// Notify all subscribers of state changes
const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

// Update global state and notify subscribers
const updateGlobalState = (updater: (prev: UseTeamsState) => UseTeamsState) => {
  globalState = updater(globalState);
  notifySubscribers();
};

export function useTeamsSingleton(): UseTeamsReturn {
  const [, forceUpdate] = useState({});
  
  // Force re-render when global state changes
  const rerender = useCallback(() => {
    forceUpdate({});
  }, []);

  // Subscribe to global state changes
  useEffect(() => {
    subscribers.add(rerender);
    return () => {
      subscribers.delete(rerender);
    };
  }, [rerender]);

  const setLoading = (isLoading: boolean) => {
    isLoadingRef = isLoading;
    updateGlobalState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    updateGlobalState(prev => ({ ...prev, error }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch all teams
  const fetchTeams = useCallback(async () => {
    try {
      const response = await teamsAPI.listTeams();
      const teams = response.results.map(mapBackendTeamToTeam);
      updateGlobalState(prev => ({ ...prev, teams }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Teams endpoint not found - using empty teams list');
        updateGlobalState(prev => ({ ...prev, teams: [] }));
      } else {
        console.warn('Failed to fetch teams:', error);
        throw error;
      }
    }
  }, []);

  // Fetch my teams
  const fetchMyTeams = useCallback(async () => {
    try {
      const response = await teamsAPI.getMyTeams();
      const myTeams = response.results.map(mapBackendTeamToTeam);
      updateGlobalState(prev => ({ ...prev, myTeams }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('My teams endpoint not found - using empty teams list');
        updateGlobalState(prev => ({ ...prev, myTeams: [] }));
      } else {
        console.warn('Failed to fetch my teams:', error);
      }
    }
  }, []);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    try {
      const response = await teamsAPI.getUserPendingInvitations();
      updateGlobalState(prev => ({ ...prev, invitations: response.results }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Invitations endpoint not found - using empty invitations list');
        updateGlobalState(prev => ({ ...prev, invitations: [] }));
      } else {
        console.warn('Failed to fetch invitations:', error);
      }
    }
  }, []);

  // Fetch team requests
  const fetchRequests = useCallback(async (): Promise<void> => {
    try {
      const response = await teamsAPI.getMyTeamRequests({ status: 'pending' });
      updateGlobalState(prev => ({ ...prev, requests: response.results || [] }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Team requests endpoint not found - using empty requests list');
        updateGlobalState(prev => ({ ...prev, requests: [] }));
      } else {
        console.warn('Failed to fetch requests:', error);
      }
    }
  }, []);

  // Refresh all data - optimized to prevent circular dependencies
  const refreshData = useCallback(async () => {
    if (isLoadingRef) {
      console.log('Already loading, skipping refresh');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch teams first (this is the main data we need)
      const teamsResponse = await teamsAPI.listTeams();
      const teams = teamsResponse.results.map(mapBackendTeamToTeam);
      updateGlobalState(prev => ({ ...prev, teams }));
      
      // Fetch user-specific data in parallel (these might fail with 404 for new users)
      await Promise.allSettled([
        // Fetch my teams (teams where user is a leader)
        teamsAPI.getMyTeams().then(response => {
          const leaderTeams = response.results.map(mapBackendTeamToTeam);
          updateGlobalState(prev => ({ ...prev, myTeams: leaderTeams }));
        }).catch(error => {
          if (error instanceof APIError && error.status === 404) {
            console.log('My teams endpoint not found - using empty teams list');
            updateGlobalState(prev => ({ ...prev, myTeams: [] }));
          } else {
            console.warn('Failed to fetch my teams:', error);
          }
        }),
        
        // Fetch invitations
        teamsAPI.getUserPendingInvitations().then(response => {
          updateGlobalState(prev => ({ ...prev, invitations: response.results }));
        }).catch(error => {
          if (error instanceof APIError && error.status === 404) {
            console.log('Invitations endpoint not found - using empty invitations list');
            updateGlobalState(prev => ({ ...prev, invitations: [] }));
          } else {
            console.warn('Failed to fetch invitations:', error);
          }
        }),
        
        // Fetch team requests
        teamsAPI.getMyTeamRequests().then(response => {
          updateGlobalState(prev => ({ ...prev, requests: response.results }));
        }).catch(error => {
          if (error instanceof APIError && error.status === 404) {
            console.log('Team requests endpoint not found - using empty requests list');
            updateGlobalState(prev => ({ ...prev, requests: [] }));
          } else {
            console.warn('Failed to fetch team requests:', error);
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
  }, []);

  // Load initial data - run only once across entire application
  useEffect(() => {
    if (!hasLoadedInitialData) {
      hasLoadedInitialData = true;
      console.log('Loading initial teams data (singleton)');
      refreshData();
    }
  }, [refreshData]);

  // Create team
  const createTeam = useCallback(async (data: CreateTeamRequest): Promise<Team> => {
    setLoading(true);
    setError(null);
    
    try {
      const newTeam = await teamsAPI.createTeam(data);
      const mappedTeam = mapBackendTeamToTeam(newTeam);
      
      // Add to my teams
      updateGlobalState(prev => ({
        ...prev,
        myTeams: [mappedTeam, ...prev.myTeams]
      }));
      
      return mappedTeam;
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

  // Update team
  const updateTeam = useCallback(async (teamId: string, data: any): Promise<Team> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTeam = await teamsAPI.updateTeam(teamId, data);
      const mappedTeam = mapBackendTeamToTeam(updatedTeam);
      
      // Update in teams list and team details
      updateGlobalState(prev => ({
        ...prev,
        teams: prev.teams.map(team => team.id === teamId ? mappedTeam : team),
        myTeams: prev.myTeams.map(team => team.id === teamId ? mappedTeam : team),
        teamDetails: prev.teamDetails ? {
          ...prev.teamDetails,
          [teamId]: updatedTeam
        } : null
      }));
      
      return mappedTeam;
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
      
      // Remove from teams list
      updateGlobalState(prev => ({
        ...prev,
        teams: prev.teams.filter(team => team.id !== teamId),
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

  // Join team
  const joinTeam = useCallback(async (data: JoinTeamRequest): Promise<Team> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.joinTeam(data);
      const joinedTeam = mapBackendTeamToTeam(response.team);
      
      // Refresh data to get updated team information
      await refreshData();
      
      return joinedTeam;
    } catch (error) {
      let errorMessage = 'Failed to join team';
      
      if (error instanceof APIError) {
        if (error.status === 400 && error.message.includes('You are already a member of an active team for this event')) {
          errorMessage = 'You are already a member of an active team for this event. Please leave your current team before joining a new one.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Leave team
  const leaveTeam = useCallback(async (teamId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.leaveTeam(teamId);
      
      // Remove from my teams
      updateGlobalState(prev => ({
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

  // Send invitation
  // Fetch user invitations
  const fetchUserInvitations = useCallback(async (userId: string, params?: { page?: number; status?: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getUserPendingInvitations(params);
      updateGlobalState(prev => ({
        ...prev,
        userInvitations: response.results,
        invitationsPagination: {
          currentPage: params?.page || 1,
          pageSize: 10,
          totalCount: response.count,
          totalPages: Math.ceil(response.count / 10),
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch invitations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove team member
  const removeTeamMember = useCallback(async (teamId: string, userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.removeTeamMember(teamId, userId);
      
      // Update team details to remove the member
      updateGlobalState(prev => {
        const newTeamDetails = { ...prev.teamDetails };
        if (newTeamDetails[teamId]) {
          newTeamDetails[teamId] = {
            ...newTeamDetails[teamId],
            members: newTeamDetails[teamId].members?.filter(member => member.user?.id !== userId) || [],
            current_size: Math.max(0, (newTeamDetails[teamId].current_size || 1) - 1)
          };
        }
        return {
          ...prev,
          teamDetails: newTeamDetails
        };
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
        error?.message || 
        'Failed to remove team member';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send invitation
  const sendInvitation = useCallback(async (teamId: string, data: SendInvitationRequest): Promise<TeamInvitation> => {
    setLoading(true);
    setError(null);
    
    try {
      const invitation = await teamsAPI.sendInvitation(teamId, data);
      
      // Update team invitations cache
      updateGlobalState(prev => ({
        ...prev,
        teamInvitations: {
          ...prev.teamInvitations,
          [teamId]: [...(prev.teamInvitations?.[teamId] || []), invitation]
        }
      }));
      
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

  // Respond to invitation (accept or decline)
  const respondToInvitation = useCallback(async (invitationId: string, data: RespondToInvitationRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.respondToInvitation(invitationId, data);
      
      // Remove invitation from invitations list (since it's no longer pending)
      updateGlobalState(prev => ({
        ...prev,
        invitations: prev.invitations.filter(inv => inv.id !== invitationId)
      }));
      
      // If accepted, refresh team data
      if (data.status === 'accepted') {
        await refreshData();
      }
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : `Failed to ${data.status} invitation`;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.cancelInvitation(invitationId);
      
      // Remove from both team invitations and invitations cache
      updateGlobalState(prev => {
        const newTeamInvitations = { ...prev.teamInvitations };
        Object.keys(newTeamInvitations).forEach(teamId => {
          newTeamInvitations[teamId] = newTeamInvitations[teamId].filter(inv => inv.id !== invitationId);
        });
        
        return {
          ...prev,
          teamInvitations: newTeamInvitations,
          invitations: prev.invitations.filter(inv => inv.id !== invitationId)
        };
      });
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to cancel invitation';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch team invitations
  const fetchTeamInvitations = useCallback(async (teamId: string, params?: { page?: number; status?: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getTeamInvitations(teamId, params);
      updateGlobalState(prev => ({
        ...prev,
        teamInvitations: {
          ...prev.teamInvitations,
          [teamId]: response.results
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch team invitations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get invitation details
  const getInvitationDetails = useCallback(async (invitationId: string): Promise<TeamInvitation> => {
    setLoading(true);
    setError(null);
    
    try {
      const invitation = await teamsAPI.getInvitationDetails(invitationId);
      return invitation;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch invitation details';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available users for a team
  const fetchAvailableUsers = useCallback(async (teamId: string, params?: { page?: number; search?: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getAvailableUsers(teamId, params);
      updateGlobalState(prev => ({
        ...prev,
        availableUsers: {
          ...prev.availableUsers,
          [teamId]: response.results
        },
        availableUsersPagination: {
          ...prev.availableUsersPagination,
          [teamId]: {
            currentPage: params?.page || 1,
            pageSize: 10,
            totalCount: response.count,
            totalPages: Math.ceil(response.count / 10),
            hasNext: !!response.next,
            hasPrevious: !!response.previous
          }
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch available users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending invitations for a team (team leaders)
  const fetchPendingTeamInvitations = useCallback(async (teamId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getTeamInvitations(teamId, { status: 'pending' });
      updateGlobalState(prev => ({
        ...prev,
        teamInvitations: {
          ...prev.teamInvitations,
          [teamId]: response.results
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch pending invitations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending invitations for current user
  const fetchPendingUserInvitations = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getUserPendingInvitations();
      updateGlobalState(prev => ({
        ...prev,
        userInvitations: response.results
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch pending invitations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending invitations using the dedicated endpoint
  const fetchUserPendingInvitations = useCallback(async (params?: { page?: number }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getUserPendingInvitations(params);
      updateGlobalState(prev => ({
        ...prev,
        invitations: response.results
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch pending invitations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to extract error message from ErrorDetail format
  const extractErrorMessage = (message: string): string => {
    // Handle [ErrorDetail(string='...', code='invalid')] format
    const errorDetailMatch = message.match(/\[ErrorDetail\(string='([^']+)', code='[^']+'\)\]/);
    if (errorDetailMatch) {
      return errorDetailMatch[1];
    }
    return message;
  };

  // Send team request
  const sendTeamRequest = useCallback(async (teamId: string, data: { message: string }): Promise<TeamRequest> => {
    setLoading(true);
    setError(null);
    
    try {
      const request = await teamsAPI.sendTeamRequest(teamId, data);
      
      // Add to requests list
      updateGlobalState(prev => ({
        ...prev,
        requests: [request, ...prev.requests]
      }));
      
      return request;
    } catch (error) {
      let errorMessage = 'Failed to send team request';
      
      if (error instanceof APIError) {
        const extractedMessage = extractErrorMessage(error.message);
        
        if (error.status === 400) {
          if (extractedMessage.includes('You are already a member of an active team for this event')) {
            errorMessage = 'You are already a member of an active team for this event. Please leave your current team before joining a new one.';
          } else if (extractedMessage.includes('You have already been approved for this team')) {
            errorMessage = 'You have already been approved for this team. You are already a member.';
          } else {
            errorMessage = extractedMessage;
          }
        } else {
          errorMessage = extractedMessage;
        }
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel team request
  const cancelTeamRequest = useCallback(async (requestId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.cancelTeamRequest(requestId);
      
      // Remove from requests list
      updateGlobalState(prev => ({
        ...prev,
        requests: prev.requests.filter(req => req.id !== requestId)
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to cancel team request';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve team request
  const approveTeamRequest = useCallback(async (requestId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.updateTeamRequest(requestId, { status: 'approved' });
      
      // Remove from requests list and refresh data
      updateGlobalState(prev => ({
        ...prev,
        requests: prev.requests.filter(req => req.id !== requestId)
      }));
      
      await refreshData();
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to approve team request';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Reject team request
  const rejectTeamRequest = useCallback(async (requestId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.updateTeamRequest(requestId, { status: 'rejected' });
      
      // Remove from requests list
      updateGlobalState(prev => ({
        ...prev,
        requests: prev.requests.filter(req => req.id !== requestId)
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to reject team request';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available teams
  const fetchAvailableTeams = useCallback(async (params?: { search?: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getAvailableTeams(params);
      // Process teams to ensure they have all required fields
      const processedTeams = response.results.map(team => ({
        ...team,
        // Ensure current_size is calculated if not provided
        current_size: team.current_size || 0,
        // Ensure max_size has a default value
        max_size: team.max_size || 4,
        // Ensure leader_name is provided
        leader_name: team.leader_name || 'Unknown Leader'
      }));
      updateGlobalState(prev => ({ ...prev, availableTeams: processedTeams }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Available teams endpoint not found - using empty teams list');
        updateGlobalState(prev => ({ ...prev, availableTeams: [] }));
      } else {
        console.warn('Failed to fetch available teams:', error);
        const errorMessage = error instanceof APIError 
          ? error.message 
          : 'Failed to fetch available teams';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch request statistics
  const fetchRequestStats = useCallback(async (teamId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await teamsAPI.getRequestStats(teamId);
      updateGlobalState(prev => ({ ...prev, requestStats: stats }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Request stats endpoint not found');
        updateGlobalState(prev => ({ ...prev, requestStats: null }));
      } else {
        console.warn('Failed to fetch request stats:', error);
        const errorMessage = error instanceof APIError 
          ? error.message 
          : 'Failed to fetch request statistics';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk action on requests
  const bulkActionRequests = useCallback(async (action: 'approve' | 'reject', requestIds: string[]): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.bulkActionRequests(action, requestIds);
      
      // Update request statuses in the list
      updateGlobalState(prev => ({
        ...prev,
        requests: prev.requests.map(request => 
          requestIds.includes(request.id) 
            ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' as const }
            : request
        )
      }));
      
      // Refresh data to get updated information
      await refreshData();
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : `Failed to ${action} requests`;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Team Leader Functions
  const fetchLeaderRequests = useCallback(async (params?: { status?: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getLeaderTeamRequests(params);
      updateGlobalState(prev => ({ ...prev, leaderRequests: response.results }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Leader requests endpoint not found - using empty requests list');
        updateGlobalState(prev => ({ ...prev, leaderRequests: [] }));
      } else {
        console.warn('Failed to fetch leader requests:', error);
        const errorMessage = error instanceof APIError 
          ? error.message 
          : 'Failed to fetch leader requests';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const respondToRequest = useCallback(async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await teamsAPI.respondToRequest(requestId, status);
      
      // Update the request status in the leader requests list
      updateGlobalState(prev => ({
        ...prev,
        leaderRequests: prev.leaderRequests.map(request =>
          request.id === requestId ? { ...request, status, responded_at: new Date().toISOString() } : request
        )
      }));
      
      // Refresh data to get updated information
      await refreshData();
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : `Failed to ${status} request`;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const bulkRespondToRequests = useCallback(async (action: 'approve' | 'reject', requestIds: string[]): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.bulkActionRequests(action, requestIds);
      
      // Update request statuses in the leader requests list
      updateGlobalState(prev => ({
        ...prev,
        leaderRequests: prev.leaderRequests.map(request =>
          requestIds.includes(request.id) 
            ? { ...request, status: action === 'approve' ? 'approved' : 'rejected', responded_at: new Date().toISOString() }
            : request
        )
      }));
      
      // Refresh data to get updated information
      await refreshData();
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : `Failed to ${action} requests`;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const fetchTeamRequestStats = useCallback(async (teamId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getTeamRequestStats(teamId);
      updateGlobalState(prev => ({
        ...prev,
        leaderRequestStats: {
          ...prev.leaderRequestStats,
          [teamId]: response
        }
      }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Team request stats endpoint not found');
        updateGlobalState(prev => ({
          ...prev,
          leaderRequestStats: {
            ...prev.leaderRequestStats,
            [teamId]: null
          }
        }));
      } else {
        console.warn('Failed to fetch team request stats:', error);
        const errorMessage = error instanceof APIError 
          ? error.message 
          : 'Failed to fetch team request stats';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch team requests for a specific team
  const fetchTeamRequests = useCallback(async (teamId: string, params?: { status?: string }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getTeamRequests(teamId, params);
      updateGlobalState(prev => ({
        ...prev,
        teamRequests: {
          ...prev.teamRequests,
          [teamId]: response.results
        }
      }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Team requests endpoint not found - using empty requests list');
        updateGlobalState(prev => ({
          ...prev,
          teamRequests: {
            ...prev.teamRequests,
            [teamId]: []
          }
        }));
      } else {
        console.warn('Failed to fetch team requests:', error);
        const errorMessage = error instanceof APIError 
          ? error.message 
          : 'Failed to fetch team requests';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch team details
  const fetchTeamDetails = useCallback(async (teamId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getTeamDetails(teamId);
      updateGlobalState(prev => ({
        ...prev,
        teamDetails: {
          ...prev.teamDetails,
          [teamId]: response
        }
      }));
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log('Team details endpoint not found');
        updateGlobalState(prev => ({
          ...prev,
        }));
      } else {
        console.warn('Failed to fetch team details:', error);
        const errorMessage = error instanceof APIError 
          ? error.message 
          : 'Failed to fetch team details';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== ADMIN FUNCTIONS ====================

  const fetchAllRequests = useCallback(async (params?: { 
    page?: number; 
    status?: string; 
    team?: string; 
    search?: string; 
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getAllRequests(params);
      updateGlobalState(prev => ({
        ...prev,
        allRequests: response.results
      }));
    } catch (error) {
      console.warn('Failed to fetch all requests:', error);
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch all requests';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminRequestStats = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getAdminRequestStats();
      updateGlobalState(prev => ({
        ...prev,
        adminRequestStats: response
      }));
    } catch (error) {
      console.warn('Failed to fetch admin request stats:', error);
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch admin request stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminDashboardStats = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamsAPI.getAdminDashboardStats();
      updateGlobalState(prev => ({
        ...prev,
        adminDashboardStats: response
      }));
    } catch (error) {
      console.warn('Failed to fetch admin dashboard stats:', error);
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch admin dashboard stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pagination actions
  const setTeamsPage = useCallback((page: number) => {
    updateGlobalState(prev => ({
      ...prev,
      teamsPagination: {
        ...prev.teamsPagination,
        currentPage: page
      }
    }));
    // Fetch teams with new page
    fetchTeams();
  }, [fetchTeams]);

  const setTeamsPageSize = useCallback((pageSize: number) => {
    updateGlobalState(prev => ({
      ...prev,
      teamsPagination: {
        ...prev.teamsPagination,
        pageSize,
        currentPage: 1 // Reset to first page when changing page size
      }
    }));
    // Fetch teams with new page size
    fetchTeams();
  }, [fetchTeams]);

  return {
    ...globalState,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    removeTeamMember,
    // Invitation methods
    fetchUserInvitations,
    sendInvitation,
    respondToInvitation,
    cancelInvitation,
    fetchTeamInvitations,
    getInvitationDetails,
    fetchAvailableUsers,
    fetchPendingTeamInvitations,
    fetchPendingUserInvitations,
    fetchUserPendingInvitations,
    sendTeamRequest,
    cancelTeamRequest,
    approveTeamRequest,
    rejectTeamRequest,
    fetchAvailableTeams,
    fetchRequestStats,
    bulkActionRequests,
    fetchLeaderRequests,
    respondToRequest,
    bulkRespondToRequests,
    fetchTeamRequestStats,
    fetchTeamRequests,
    fetchTeamDetails,
    fetchAllRequests,
    fetchAdminRequestStats,
    fetchAdminDashboardStats,
    fetchTeams,
    fetchMyTeams,
    fetchInvitations,
    fetchRequests,
    setTeamsPage,
    setTeamsPageSize,
    clearError,
    refreshData,
  };
}

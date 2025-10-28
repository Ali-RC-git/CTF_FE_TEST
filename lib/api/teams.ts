/**
 * Teams API service
 * Handles all team-related API calls
 */

import { apiClient } from './client';

// Types for teams
export interface TeamMember {
  id: string;
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    status: string;
    is_mfa_enabled: boolean;
    created_at: string;
    last_login_at: string | null;
    profile: any;
  };
  user_id: string;
  role: 'leader' | 'member';
  status: 'active' | 'inactive';
  is_leader: boolean;
  joined_at: string;
  left_at: string | null;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  max_size: number;
  min_size: number;
  invite_code: string;
  is_invite_only: boolean;
  status: 'active' | 'inactive' | 'suspended';
  current_size: number;
  is_full: boolean;
  can_join: boolean;
  leader: string;
  leader_name: string;
  members?: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface TeamsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Team[];
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  max_size: number;
  min_size: number;
  is_invite_only: boolean;
  event_code: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  max_size?: number;
  min_size?: number;
  is_invite_only?: boolean;
  status?: 'active' | 'inactive' | 'disbanded' | 'pending';
  leader?: string; // leader user ID
  event?: string; // event ID
}

export interface JoinTeamRequest {
  invite_code: string;
}

export interface JoinTeamResponse {
  message: string;
  team: Team;
}

// Team Request interfaces
export interface TeamRequest {
  id: string;
  team: string;
  team_name: string;
  requested_by: string;
  requested_by_email: string;
  requested_by_name: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  responded_at: string | null;
  responded_by: string | null;
  responded_by_email: string | null;
}

export interface TeamRequestsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TeamRequest[];
}

export interface SendTeamRequestRequest {
  message: string;
}

export interface UpdateTeamRequestRequest {
  status: 'approved' | 'rejected';
}

// Join Request interface (legacy)
export interface JoinRequest {
  id: string;
  team: string;
  team_name: string;
  requested_by: string;
  requested_by_email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  responded_at: string | null;
  responded_by: string | null;
}

// Team Request System interfaces
export interface AvailableTeam {
  id: string;
  name: string;
  description: string;
  max_size: number;
  current_size: number;
  is_full: boolean;
  can_join: boolean;
  leader_name: string;
  status: string;
}

export interface RequestStats {
  team_id: string;
  team_name: string;
  statistics: {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
    recent_requests: number;
  };
}

export interface TeamStats {
  team_name: string;
  current_size: number;
  max_size: number;
  members: Array<{
    user_id: string;
    email: string;
    full_name: string;
    role: string;
    joined_at: string;
  }>;
  created_at: string;
  status: string;
}

export interface TeamInvitation {
  id: string;
  team: string;
  team_name: string;
  invited_user: string;
  invited_user_email: string;
  invited_by: string;
  invited_by_email: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  responded_at: string | null;
  is_expired: boolean;
}

export interface TeamInvitationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TeamInvitation[];
}

export interface SendInvitationRequest {
  invited_user_email: string;
  message: string;
  expires_at?: string;
}

export interface RespondToInvitationRequest {
  status: 'accepted' | 'declined';
}

export interface AvailableUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  profile: {
    id: string;
    phone: string | null;
    bio: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface AvailableUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AvailableUser[];
}


export interface UpdateInvitationRequest {
  status: 'accepted' | 'declined';
}

// Admin Dashboard Stats Interface
export interface AdminDashboardStats {
  dashboard_stats: {
    total_teams: number;
    total_users: number;
    pending_requests: number;
    active_participation: number;
  };
  detailed_stats: {
    teams: {
      total: number;
      active: number;
      inactive: number;
      recent_created: number;
    };
    users: {
      total: number;
      active: number;
      admins: number;
      instructors: number;
      students: number;
      recent_registered: number;
    };
    requests: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      recent_created: number;
    };
  };
  recent_activity: {
    teams_created_7_days: number;
    users_registered_7_days: number;
    requests_created_7_days: number;
  };
}

class TeamsAPI {
  async getInvitationDetails(invitationId: string): Promise<TeamInvitation> {
    try {
      return await apiClient.get<TeamInvitation>(`/teams/invitations/${invitationId}/`);
    } catch (error) {
      if (error) {
        // Fallback: get from list and filter
        const response = await this.getAllTeamInvitations();
        const invitation = response.results.find(inv => inv.id === invitationId);
        if (invitation) {
          return invitation;
        }
      }
      throw error;
    }
  }
  /**
   * List all teams for dropdown (admin only)
   */
  async listTeamsForDropdown(): Promise<Team[]> {
    const response = await apiClient.get<TeamsListResponse>('/teams/');
    return response.results || [];
  }

  /**
   * List available teams (active and not full)
   */
  async listAvailableTeams(): Promise<Team[]> {
    const response = await apiClient.get<TeamsListResponse>('/teams/?status=active&is_full=false');
    return response.results || [];
  }

  /**
   * Add user to specific team (Admin/Team Leader)
   */
  async addUserToTeam(teamId: string, userId: string, role: 'leader' | 'member'): Promise<any> {
    return apiClient.post(`/teams/${teamId}/members/`, {
      user_id: userId,
      role: role
    });
  }

  /**
   * Remove user from specific team (Admin/Team Leader)
   */
  async removeUserFromTeam(teamId: string, userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/teams/${teamId}/members/${userId}/`);
  }

  /**
   * Update user role in specific team (Admin/Team Leader)
   */
  async updateUserRoleInTeam(teamId: string, userId: string, role: 'leader' | 'member'): Promise<any> {
    return apiClient.patch(`/teams/${teamId}/members/${userId}/`, {
      role: role
    });
  }

  /**
   * Get user's current teams
   */
  async getUserTeams(userId: string): Promise<any> {
    return apiClient.get(`/users/${userId}/teams/`);
  }


  /**
   * Leave team (for current user)
   */
  async leaveTeam(teamId: string): Promise<{ message: string }> {
    return apiClient.post(`/teams/${teamId}/leave/`);
  }

  /**
   * List all teams
   */
  async listTeams(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    is_invite_only?: boolean;
  }): Promise<TeamsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_invite_only !== undefined) queryParams.append('is_invite_only', params.is_invite_only.toString());

    const endpoint = `/teams/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TeamsListResponse>(endpoint);
  }

  /**
   * Create a new team
   */
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    return apiClient.post<Team>('/teams/', data);
  }

  /**
   * Get team details
   */
  async getTeam(teamId: string): Promise<Team> {
    return apiClient.get<Team>(`/teams/${teamId}/`);
  }

  /**
   * Update team
   */
  async updateTeam(teamId: string, data: UpdateTeamRequest): Promise<Team> {
    return apiClient.put<Team>(`/teams/${teamId}/`, data);
  }

  /**
   * Partially update team
   */
  async patchTeam(teamId: string, data: UpdateTeamRequest): Promise<Team> {
    return apiClient.patch<Team>(`/teams/${teamId}/`, data);
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId: string): Promise<void> {
    return apiClient.delete<void>(`/teams/${teamId}/`);
  }

  /**
   * Join team using invite code
   */
  async joinTeam(data: JoinTeamRequest): Promise<JoinTeamResponse> {
    return apiClient.post<JoinTeamResponse>('/teams/join/', data);
  }


  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string): Promise<TeamStats> {
    return apiClient.get<TeamStats>(`/teams/${teamId}/stats/`);
  }

  /**
   * Get user's teams
   */
  async getMyTeams(): Promise<TeamsListResponse> {
    return apiClient.get<TeamsListResponse>('/teams/my-teams/');
  }

  /**
   * List team invitations
   */
  async listTeamInvitations(teamId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<TeamInvitationsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/teams/${teamId}/invitations/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TeamInvitationsResponse>(endpoint);
  }



  /**
   * Get all join requests (admin only)
   */
  async getJoinRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    team_id?: string;
  }): Promise<{ results: JoinRequest[] }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.team_id) queryParams.append('team_id', params.team_id);

    const endpoint = `/teams/join-requests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<{ results: JoinRequest[] }>(endpoint);
  }

  /**
   * Approve join request
   */
  async approveJoinRequest(requestId: string): Promise<JoinRequest> {
    return apiClient.patch<JoinRequest>(`/teams/join-requests/${requestId}/`, {
      status: 'approved'
    });
  }

  /**
   * Reject join request
   */
  async rejectJoinRequest(requestId: string): Promise<JoinRequest> {
    return apiClient.patch<JoinRequest>(`/teams/join-requests/${requestId}/`, {
      status: 'rejected'
    });
  }

  // ===== TEAM REQUESTS METHODS =====

  /**
   * Send team request
   */
  async sendTeamRequest(teamId: string, data: SendTeamRequestRequest): Promise<TeamRequest> {
    return apiClient.post<TeamRequest>(`/teams/${teamId}/requests/`, data);
  }

  /**
   * Get user's team requests
   */
  async getMyTeamRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<TeamRequestsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/teams/my-requests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TeamRequestsResponse>(endpoint);
  }


  /**
   * Get request details
   */
  async getTeamRequest(requestId: string): Promise<TeamRequest> {
    return apiClient.get<TeamRequest>(`/teams/requests/${requestId}/`);
  }

  /**
   * Update team request (approve/reject)
   */
  async updateTeamRequest(requestId: string, data: UpdateTeamRequestRequest): Promise<TeamRequest> {
    return apiClient.put<TeamRequest>(`/teams/requests/${requestId}/`, data);
  }

  /**
   * Cancel team request
   */
  async cancelTeamRequest(requestId: string): Promise<void> {
    return apiClient.delete(`/teams/requests/${requestId}/`);
  }

  /**
   * Get all team requests (admin only)
   */
  async getAllTeamRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    team_id?: string;
  }): Promise<TeamRequestsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.team_id) queryParams.append('team_id', params.team_id);

    const endpoint = `/teams/requests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TeamRequestsResponse>(endpoint);
  }

  /**
   * Get team requests for teams where current user is leader
   */
  async getLeaderTeamRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<TeamRequestsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/teams/my-teams/requests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TeamRequestsResponse>(endpoint);
  }

  /**
   * Respond to team request (approve/reject)
   */
  async respondToRequest(requestId: string, status: 'approved' | 'rejected'): Promise<TeamRequest> {
    return apiClient.put<TeamRequest>(`/teams/requests/${requestId}/`, { status });
  }

  /**
   * Bulk action on team requests (approve/reject multiple)
   */
  async bulkActionRequests(action: 'approve' | 'reject', requestIds: string[]): Promise<{
    message: string;
    successful: string[];
    failed: string[];
    success_count: number;
    failed_count: number;
  }> {
    return apiClient.post('/teams/requests/bulk-action/', {
      action,
      request_ids: requestIds
    });
  }

  /**
   * Get request statistics for a specific team
   */
  async getTeamRequestStats(teamId: string): Promise<{
    team_id: string;
    team_name: string;
    statistics: {
      total_requests: number;
      pending_requests: number;
      approved_requests: number;
      rejected_requests: number;
      recent_requests: number;
    };
  }> {
    return apiClient.get(`/teams/${teamId}/request-stats/`);
  }

  /**
   * Get all join requests for a specific team (team leader only)
   */
  async getTeamRequests(teamId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<TeamRequestsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/teams/${teamId}/requests/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TeamRequestsResponse>(endpoint);
  }

  /**
   * Get detailed team information
   */
  async getTeamDetails(teamId: string): Promise<Team> {
    return apiClient.get<Team>(`/teams/${teamId}/`);
  }

  /**
   * Get users registered for a specific event
   */
  async getEventRegisteredUsers(eventCode: string): Promise<any[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        participants: Array<{
          id: string;
          user_email: string;
          user_name: string;
          user_role: string;
          status: string;
          registered_at: string;
          withdrawn_at: string | null;
          participation_duration: number;
        }>;
      };
    }>(`/teams/event-registered-users/${eventCode}/`);

    // Transform the backend response to match the expected format
    return response.data.participants.map(participant => ({
      id: participant.id,
      email: participant.user_email,
      username: participant.user_name, // Extract username from email
      first_name: participant.user_name.split(' ')[0] || '',
      last_name: participant.user_name.split(' ').slice(1).join(' ') || '',
      full_name: participant.user_name,
      role: participant.user_role,
      status: participant.status,
      is_mfa_enabled: false,
      created_at: participant.registered_at,
      last_login_at: participant.registered_at,
      profile: {
        bio: null,
        avatar: null,
        phone: null,
        institution: null,
        department: null,
        student_id: null,
        email_notifications: true,
        push_notifications: true
      },
      teams: [],
      current_team: null
    }));
  }

  /**
   * Get users registered for a specific event who are not part of any team
   */
  async getEventAvailableUsers(eventCode: string): Promise<any[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        event: {
          id: string;
          event_code: string;
          name: string;
          description: string;
          starts_at: string;
          ends_at: string;
          created_by: string;
          is_active: boolean;
          is_upcoming: boolean;
          is_past: boolean;
          total_challenges: number;
          published_challenges: number;
        };
        participants: Array<{
          id: string;
          user_email: string;
          user_name: string;
          user_role: string;
          status: string;
          registered_at: string;
          withdrawn_at: string | null;
          participation_duration: number;
        }>;
        total_participants: number;
        total_registered: number;
        excluded_active_team_members: number;
        inactive_team_members_included: number;
        filtering_info: {
          excludes: string;
          includes: string;
        };
      };
    }>(`/teams/event-registered-users/${eventCode}/`);

    // Transform the backend response to match the expected format
    return response.data.participants.map(participant => ({
      id: participant.id,
      email: participant.user_email,
      username: participant.user_name,
      first_name: participant.user_name.split(' ')[0] || '',
      last_name: participant.user_name.split(' ').slice(1).join(' ') || '',
      full_name: participant.user_name,
      role: participant.user_role,
      status: participant.status,
      is_mfa_enabled: false,
      created_at: participant.registered_at,
      last_login_at: participant.registered_at,
      profile: {
        bio: null,
        avatar: null,
        phone: null,
        institution: null,
        department: null,
        student_id: null,
        email_notifications: true,
        push_notifications: true
      },
      teams: [],
      current_team: null
    }));
  }

  /**
   * Send team invitation
   */
  async sendInvitation(teamId: string, invitationData: {
    invited_user_email: string;
    message: string;
    expires_at?: string;
  }): Promise<TeamInvitation> {
    return apiClient.post<TeamInvitation>(`/teams/${teamId}/invitations/`, invitationData);
  }

  /**
   * List team invitations for a specific team
   */
  async getTeamInvitations(teamId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: TeamInvitation[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/teams/${teamId}/invitations/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: TeamInvitation[];
    }>(endpoint);
  }

  /**
   * Get user's pending invitations
   */
  async getUserPendingInvitations(params?: { page?: number }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: TeamInvitation[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());

    const endpoint = `/teams/my-pending-invitations/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: TeamInvitation[];
    }>(endpoint);
  }

  /**
   * Respond to invitation (accept/decline)
   */
  async respondToInvitation(invitationId: string, data: RespondToInvitationRequest): Promise<TeamInvitation> {
    return apiClient.put<TeamInvitation>(`/teams/invitations/${invitationId}/`, data);
  }

  /**
   * Delete invitation (cancel)
   */
  async deleteInvitation(invitationId: string): Promise<void> {
    return apiClient.delete(`/teams/invitations/${invitationId}/`);
  }

  /**
   * Cancel invitation (alias for deleteInvitation)
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    return this.deleteInvitation(invitationId);
  }

  /**
   * Remove team member
   */
  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    return apiClient.delete(`/teams/${teamId}/members/${userId}/`);
  }

  /**
   * Get all team invitations (admin only)
   */
  async getAllTeamInvitations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    team_id?: string;
  }): Promise<TeamInvitationsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.team_id) queryParams.append('team_id', params.team_id);

    const endpoint = `/teams/invitations/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TeamInvitationsResponse>(endpoint);
  }

  // ===== TEAM REQUEST SYSTEM APIs =====

  /**
   * Get available teams for joining
   */
  async getAvailableTeams(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ results: AvailableTeam[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const endpoint = `/teams/available-teams/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return apiClient.get<{ results: AvailableTeam[] }>(endpoint);
    } catch (error) {
      // Fallback: if available-teams endpoint doesn't exist, return empty results
      console.log('Available teams endpoint not found, returning empty results');
      return { results: [] };
    }
  }

  /**
   * Get team request statistics
   */
  async getRequestStats(teamId: string): Promise<RequestStats> {
    return apiClient.get<RequestStats>(`/teams/${teamId}/request-stats/`);
  }

  // ==================== ADMIN APIs ====================

  /**
   * Get all team requests across all teams (Admin only)
   */
  async getAllRequests(params?: { 
    page?: number; 
    status?: string; 
    team?: string; 
    search?: string; 
  }): Promise<{ count: number; next: string | null; previous: string | null; results: TeamRequest[] }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.team) queryParams.append('team', params.team);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/teams/admin/all-requests/${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  }

  /**
   * Get overall team request statistics (Admin only)
   */
  async getAdminRequestStats(): Promise<{
    overall_statistics: {
      total_requests: number;
      pending_requests: number;
      approved_requests: number;
      rejected_requests: number;
      recent_requests: number;
    };
    team_statistics: Array<{
      team_id: string;
      team_name: string;
      total_requests: number;
      pending_requests: number;
      approved_requests: number;
      rejected_requests: number;
    }>;
  }> {
    return apiClient.get('/teams/admin/request-stats/');
  }

  /**
   * Get comprehensive admin dashboard statistics (Admin only)
   */
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    return apiClient.get('/teams/admin/dashboard-stats/');
  }

  async getAvailableUsers(teamId: string, params?: { 
  page?: number; 
  search?: string; 
}): Promise<AvailableUsersResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);

  const endpoint = `/teams/${teamId}/available-users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<AvailableUsersResponse>(endpoint);
}

}

// Export singleton instance
export const teamsAPI = new TeamsAPI();

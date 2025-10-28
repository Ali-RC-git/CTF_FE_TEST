/**
 * Events API service
 * Handles all event-related API calls for admin functionality
 */

import { apiClient } from './client';

// Types for event management
export interface EventData {
  id: string;
  eventCode: string;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  registrationStatus: 'Open' | 'Closed' | 'Invite Only';
  createdAt: string;
  updatedAt: string;
  // Additional fields from backend
  isActive?: boolean;
  isUpcoming?: boolean;
  isPast?: boolean;
  totalChallenges?: number;
  totalTeams?: number;
  publishedChallenges?: number;
  createdBy?: string;
  createdByName?: string;
  selectedChallenges?: string[];
  hasScoreboard?: boolean;
  isScoreboardFrozen?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  organization: string;
  registrationDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  teamId?: string;
  teamName?: string;
}

export interface EventStats {
  totalParticipants: number;
  confirmedParticipants: number;
  pendingParticipants: number;
}


// Scoreboard related types
export interface ScoreBreakdown {
  score: number;
  max_score: number;
  completed_at: string;
  challenge_title: string;
  time_spent_seconds: number;
}

export interface LeaderboardTeam {
  rank: number;
  team_id: string;
  team_name: string;
  total_score: number;
  challenges_completed: number;
  challenges_in_progress: number;
  last_solve_time: string;
  total_time_seconds: number;
  total_attempts: number;
  score_breakdown: Record<string, ScoreBreakdown>;
  calculated_at: string;
  team_size: number;
  team_leader: string;
}

export interface LeaderboardData {
  total_teams: number;
  last_updated: string;
  is_frozen: boolean;
  teams: LeaderboardTeam[];
}

export interface EventInfo {
  id: string;
  event_code: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  total_teams: number;
  total_challenges: number;
  created_by: string;
}

export interface ScoreboardSettingsData {
  id: string;
  event: string;
  event_name: string;
  event_code: string;
  is_public: boolean;
  show_team_names: boolean;
  show_scores: boolean;
  show_solve_times: boolean;
  freeze_strategy: string;
  freeze_at: string | null;
  is_frozen: boolean;
  should_freeze: boolean;
  auto_refresh_enabled: boolean;
  refresh_interval_seconds: number;
  tie_break_by_time: boolean;
  tie_break_by_attempts: boolean;
  max_teams_display: number | null;
  show_challenge_breakdown: boolean;
  cache_enabled: boolean;
  cache_ttl_seconds: number;
  last_cached_at: string | null;
  created_at: string;
  updated_at: string;
  // Additional fields from actual API response
  total_teams?: number;
  total_challenges?: number;
}

export interface RecentActivity {
  total_scores: number;
  pending_verification: number;
  verified_scores: number;
  recent_scores: any[];
}

export interface Statistics {
  average_score_per_team: number;
  highest_score: number;
  lowest_score: number;
  total_challenges_completed: number;
  average_completion_rate: number;
}

// New simplified scoreboard response (matches actual API)
export interface SimpleScoreboardResponse {
  event_id: string;
  event_name: string;
  event_code: string;
  is_active: boolean;
  is_frozen: boolean;
  total_teams: number;
  total_challenges: number;
  leaderboard: SimpleLeaderboardTeam[];
  settings?: {
    is_public: boolean;
    is_frozen: boolean;
    show_team_names: boolean;
    show_scores: boolean;
  };
}

export interface SimpleLeaderboardTeam {
  rank: number;
  team_id: string;
  team_name: string;
  total_score: number;
  challenges_completed: number;
  last_solve_time?: string;
  total_time_seconds?: number;
  // Optional fields that may not be in API response
  team_size?: number;
  team_leader?: string;
  challenges_in_progress?: number;
  total_attempts?: number;
}

// Legacy complex response structure (keeping for backward compatibility)
export interface EventScoreboardResponse {
  event_info: EventInfo;
  scoreboard_settings: ScoreboardSettingsData;
  leaderboard: LeaderboardData;
  recent_activity: RecentActivity;
  statistics: Statistics;
}

export interface TeamScore {
  team_id: string;
  team_name: string;
  event_id: string;
  total_score: number;
  challenges_completed: number;
  total_time_seconds: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreboardSettings {
  event_id: string;
  event_name: string;
  event_code: string;
  is_active: boolean;
  is_frozen: boolean;
  total_teams: number;
  total_challenges: number;
  refresh_interval_seconds: number;
  auto_refresh_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamScoreRequest {
  team_id: string;
  challenge_id?: string;
  score: number;
  time_bonus?: number;
  hints_used?: number;
  solved_at?: string;
}

export interface TeamScoreResponse {
  id: string;
  team_id: string;
  event_id: string;
  challenge_id?: string;
  score: number;
  time_bonus: number;
  hints_used: number;
  solved_at: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveEventsResponse {
  count: number;
  active_events: BackendEventData[];
  current_time: string;
}

export interface EventResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendEventData[];
}

export interface BackendEventData {
  id: string;
  event_code: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  is_upcoming?: boolean;
  is_past?: boolean;
  total_teams: number;
  total_challenges: number;
  published_challenges?: number;
  has_scoreboard: boolean;
  is_scoreboard_frozen: boolean;
}

export interface UpdateEventRequest {
  id?: string;
  event_code?: string;
  name?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  max_participants?: number;
  registration_status?: 'open' | 'closed' | 'invite_only';
  challenge_ids?: string[];
}

class EventsAPI {
  /**
   * Get current event details and participants
   */
  async getEventData(): Promise<EventResponse> {
    return apiClient.get<EventResponse>('/events/');
  }

  /**
   * Update event details
   */
  async updateEvent(data: UpdateEventRequest): Promise<{ message: string; event: EventData }> {
    if (!data.id && !data.event_code) {
      throw new Error('Event ID or event code is required for update');
    }
    const eventId = data.id;
    return apiClient.put<{ message: string; event: EventData }>(`/events/${eventId}/`, data);
  }

  /**
   * Generate event code preview
   */
  async generateCodePreview(name: string): Promise<{ 
    event_name: string; 
    preview_code: string; 
    message: string; 
  }> {
    return apiClient.post<{ 
      event_name: string; 
      preview_code: string; 
      message: string; 
    }>('/events/generate_code_preview/', { name });
  }

  /**
   * Generate new event code (legacy method - keeping for backward compatibility)
   */
  async generateEventCode(eventData: {
    name: string;
    starts_at: string;
    ends_at: string;
    event_code?: string;
  }): Promise<{ message: string; eventCode: string; event: EventData }> {
    return apiClient.post<{ message: string; eventCode: string; event: EventData }>('/events/?action=generate-code', eventData);
  }

  /**
   * Export registrations as CSV
   */
  async exportRegistrations(): Promise<Blob> {
    const response = await fetch('/api/events/export', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ctf_access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export registrations');
    }

    return response.blob();
  }

  /**
   * Get event statistics
   */
  async getEventStats(): Promise<EventStats> {
    // TODO: Implement proper event stats endpoint
    return {
      totalParticipants: 0,
      confirmedParticipants: 0,
      pendingParticipants: 0
    };
  }

  /**
   * Get participants list
   */
  async getParticipants(): Promise<Participant[]> {
    // TODO: Implement proper participants endpoint
    return [];
  }

  /**
   * Get participants for a specific event
   */
  async getEventParticipants(eventId: string): Promise<{
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
    };
  }> {
    return apiClient.get<{
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
      };
    }>(`/events/${eventId}/`);
  }

  /**
   * Add participant to event
   */
  async addParticipant(participantData: Omit<Participant, 'id' | 'registrationDate'>): Promise<Participant> {
    return apiClient.post<Participant>('/events/participants/', participantData);
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(participantId: string, status: Participant['status']): Promise<Participant> {
    return apiClient.patch<Participant>(`/events/participants/${participantId}/`, { status });
  }

  /**
   * Remove participant from event
   */
  async removeParticipant(participantId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/events/participants/${participantId}/`);
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/events/${eventId}/`);
  }

  /**
   * Create new event (admin endpoint)
   */
  async createEvent(eventData: {
    name: string;
    event_code: string;
    description: string;
    starts_at: string;
    ends_at: string;
    challenge_ids?: string[];
  }): Promise<{ message: string; event: BackendEventData }> {
    return apiClient.post<{ message: string; event: BackendEventData }>('/admin/events/', eventData);
  }

  /**
   * Get all events (for admin list view)
   */
  async getAllEvents(): Promise<{ events: BackendEventData[] }> {
    return apiClient.get<{ events: BackendEventData[] }>('/admin/events/');
  }

  /**
   * Validate event code
   */
  async validateEventCode(eventCode: string): Promise<{
    success: boolean;
    message: string;
    valid: boolean;
    event_id?: string;
    event_code?: string;
    event_name?: string;
    event_description?: string;
    starts_at?: string;
    ends_at?: string;
    is_upcoming?: boolean;
  }> {
    return apiClient.get<{
      success: boolean;
      message: string;
      valid: boolean;
      event_id?: string;
      event_code?: string;
      event_name?: string;
      event_description?: string;
      starts_at?: string;
      ends_at?: string;
      is_upcoming?: boolean;
    }>(`/events/validate-code/${eventCode}/`, false);
  }


  /**
   * Get event scoreboard (admin endpoint)
   */
  async getEventLeaderboard(eventId: string): Promise<EventScoreboardResponse> {
    return apiClient.get<EventScoreboardResponse>(`/admin/events/${eventId}/scoreboard/`);
  }

  /**
   * Get team score for an event (admin endpoint)
   */
  async getTeamScore(eventId: string, teamId: string): Promise<TeamScore> {
    return apiClient.get<TeamScore>(`/admin/events/${eventId}/teams/${teamId}/score/`);
  }

  /**
   * Get scoreboard settings for an event (admin endpoint)
   */
  async getScoreboardSettings(eventId: string): Promise<ScoreboardSettingsData> {
    return apiClient.get<ScoreboardSettingsData>(`/admin/events/${eventId}/scoreboard/settings/`);
  }

  /**
   * Record team score for an event (admin endpoint)
   */
  async recordTeamScore(eventId: string, scoreData: TeamScoreRequest): Promise<TeamScoreResponse> {
    return apiClient.post<TeamScoreResponse>(`/admin/events/${eventId}/team-scores/`, scoreData);
  }

  /**
   * Get team score detail (admin endpoint)
   */
  async getTeamScoreDetail(eventId: string, scoreId: string): Promise<TeamScoreResponse> {
    return apiClient.get<TeamScoreResponse>(`/admin/events/${eventId}/team-scores/${scoreId}/`);
  }

  /**
   * Update team score (admin endpoint)
   */
  async updateTeamScore(
    eventId: string,
    scoreId: string,
    scoreData: Partial<TeamScoreRequest>
  ): Promise<TeamScoreResponse> {
    return apiClient.patch<TeamScoreResponse>(`/admin/events/${eventId}/team-scores/${scoreId}/`, scoreData);
  }

  /**
   * Get active events only (for scoreboard selection) - Admin endpoint
   */
  async getActiveEvents(): Promise<ActiveEventsResponse> {
    return apiClient.get<ActiveEventsResponse>('/admin/events/active/');
  }

  /**
   * Get user's registered events (for user scoreboard)
   */
  async getUserRegisteredEvents(): Promise<ActiveEventsResponse> {
    return apiClient.get<ActiveEventsResponse>('/events/');
  }

  /**
   * Get scoreboard for specific event (user endpoint - only shows registered events)
   * Uses the simplified v1 API endpoint
   */
  async getUserEventLeaderboard(eventId: string): Promise<SimpleScoreboardResponse> {
    return apiClient.get<SimpleScoreboardResponse>(`/v1/events/${eventId}/scoreboard/`);
  }

  /**
   * Alternative: Get leaderboard using existing endpoint
   */
  async getUserEventLeaderboardAlt(eventId: string): Promise<SimpleScoreboardResponse> {
    return apiClient.get<SimpleScoreboardResponse>(`/v1/events/${eventId}/leaderboard/`);
  }

  /**
   * Register for an event using event code
   */
  async registerForEvent(eventCode: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      user: string;
      event: string;
      status: string;
      registered_at: string;
    };
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      data?: {
        id: string;
        user: string;
        event: string;
        status: string;
        registered_at: string;
      };
    }>(`/events/register/${eventCode}/`, {});
  }

  /**
   * Unregister from an event using event ID
   */
  async unregisterFromEvent(eventId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/events/unregister/${eventId}/`);
  }

}

// Export singleton instance
export const eventsAPI = new EventsAPI();

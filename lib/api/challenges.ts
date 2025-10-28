/**
 * Challenges API service
 * Handles all challenge-related API calls using centralized client
 */

import { apiClient } from './client';
import { Challenge, ChallengeDetail, ChallengeUserProgress } from '@/lib/types';

// Re-export Challenge types for convenience
export type { Challenge, ChallengeDetail, ChallengeUserProgress } from '@/lib/types';

// Types for challenge management
export interface ChallengeListResponse {
  results: Challenge[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface StartChallengeResponse {
  success: boolean;
  message: string;
  challengeId: string;
  attemptId?: string;
  startedAt: string;
}

export interface SubmitAnswerRequest {
  answer: string | string[];
  questionType: 'flag' | 'mcq' | 'fib';
}

export interface SubmitAnswerResponse {
  correct: boolean;
  message: string;
  points?: number;
  explanation?: string;
}

export interface UserProgressResponse {
  [challengeId: string]: ChallengeUserProgress;
}

// Admin challenge management types
export interface CreateChallengeRequest {
  title: string;
  description: string;
  category: string;
  difficulty?: string; // "easy", "medium", "hard", "expert" (lowercase for backend)
  points?: number; // Optional - calculated automatically based on question count (100 pts per question)
  total_points?: number;
  timeEstimate?: number;
  time_estimate_minutes?: number;
  scenario?: string;
  contextNotes?: string;
  context_note?: string;
  status?: string; // "draft", "published", "archived" (lowercase for backend)
  tags?: string[];
  preview_enabled?: boolean;
  max_attempts?: number;
  flag_questions?: any[];
  mcq_questions?: any[];
  fib_questions?: any[];
  fillblank_questions?: any[];
  artifacts?: any[];
}

export interface UpdateChallengeRequest extends Partial<CreateChallengeRequest> {}

export interface BulkUpdateRequest {
  challenge_ids: string[];
  updates: {
    status?: string;
    category?: string;
    difficulty?: string;
    is_featured?: boolean;
    is_visible?: boolean;
  };
}

export interface ChallengeSubmissionsResponse {
  results: any[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ChallengeAnalytics {
  total_attempts: number;
  successful_attempts: number;
  average_time: number;
  average_score: number;
  completion_rate: number;
}

class ChallengesAPI {
  /**
   * List all challenges
   */
  async listChallenges(params?: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: string;
    status?: string;
    event_id?: string;
  }): Promise<ChallengeListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/challenges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ChallengeListResponse | Challenge[]>(endpoint);
    
    // Handle both array and paginated response
    if (Array.isArray(response)) {
      // If backend returns array directly, wrap it in paginated format
      return {
        results: response,
        count: response.length,
        next: null,
        previous: null
      };
    }
    
    // Return paginated response as-is
    return response;
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(challengeId: string): Promise<ChallengeDetail> {
    return apiClient.get<ChallengeDetail>(`/challenges/${challengeId}`);
  }

  /**
   * Start a challenge attempt
   */
  async startChallenge(challengeId: string): Promise<StartChallengeResponse> {
    return apiClient.post<StartChallengeResponse>(`/challenges/${challengeId}/start`, {});
  }

  /**
   * Get user's progress on a specific challenge
   */
  async getChallengeProgress(challengeId: string): Promise<ChallengeUserProgress> {
    return apiClient.get<ChallengeUserProgress>(`/challenges/${challengeId}/progress`);
  }

  /**
   * Update user's progress on a challenge
   */
  async updateChallengeProgress(
    challengeId: string,
    progress: {
      timeSpent?: number;
      lastActivityAt?: string;
      questionProgress?: any;
    }
  ): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/challenges/${challengeId}/progress`, progress);
  }

  /**
   * Get user's progress on all challenges
   */
  async getUserProgress(): Promise<ChallengeUserProgress[]> {
    const response = await apiClient.get<ChallengeUserProgress[] | UserProgressResponse>('/challenges/user-progress');
    
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    
    // Convert object to array
    return Object.values(response);
  }

  /**
   * Submit answer for a question
   */
  async submitAnswer(
    challengeId: string,
    questionId: string,
    data: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> {
    return apiClient.post<SubmitAnswerResponse>(
      `/challenges/${challengeId}/questions/${questionId}/submit`,
      data
    );
  }

  /**
   * Get hint for a question
   */
  async getHint(
    challengeId: string,
    questionId: string,
    hintId: string
  ): Promise<{ hint: string; cost: number }> {
    return apiClient.post<{ hint: string; cost: number }>(
      `/challenges/${challengeId}/questions/${questionId}/hints/${hintId}`,
      {}
    );
  }

  /**
   * Save challenge progress to Redis
   */
  async saveProgress(
    challengeId: string,
    data: {
      eventId: string;
      teamId: string;
      questionId: string;
      answer: string | string[];
      hintsUsed: number;
      isCorrect: boolean;
    }
  ): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post<{ success: boolean; message: string; data?: any }>(
      `/challenges/${challengeId}/save-progress`,
      data
    );
  }

  /**
   * Download challenge artifact
   */
  async downloadArtifact(challengeId: string, artifactId: string): Promise<Blob> {
    // For file downloads, we need to use fetch directly
    const token = apiClient.isAuthenticated() 
      ? localStorage.getItem('ctf_access_token')
      : null;
    
    const response = await fetch(`/api/challenges/${challengeId}/artifacts/${artifactId}`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to download artifact');
    }

    return response.blob();
  }

  /**
   * Download all challenge artifacts as ZIP
   */
  async downloadAllArtifacts(challengeId: string): Promise<Blob> {
    const token = apiClient.isAuthenticated() 
      ? localStorage.getItem('ctf_access_token')
      : null;
    
    const response = await fetch(`/api/challenges/${challengeId}/artifacts/download-all`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to download artifacts');
    }

    return response.blob();
  }

  // Admin challenge management methods

  /**
   * Create a new challenge (Admin) using bulk-create endpoint
   */
  async createChallenge(data: CreateChallengeRequest): Promise<Challenge> {
    return apiClient.post<Challenge>('/challenges/bulk-create/', data);
  }

  /**
   * Update a challenge (Admin)
   */
  async updateChallenge(challengeId: string, data: UpdateChallengeRequest): Promise<Challenge> {
    return apiClient.put<Challenge>(`/challenges/${challengeId}/`, data);
  }

  /**
   * Delete a challenge (Admin)
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    return apiClient.delete(`/challenges/${challengeId}/`);
  }

  /**
   * Duplicate a challenge (Admin)
   */
  async duplicateChallenge(challengeId: string, newTitle?: string): Promise<Challenge> {
    return apiClient.post<Challenge>(`/challenges/${challengeId}/duplicate/`, {
      new_title: newTitle
    });
  }

  /**
   * Bulk update challenges (Admin)
   */
  async bulkUpdateChallenges(data: BulkUpdateRequest): Promise<{ message: string; updated_count: number }> {
    return apiClient.post<{ message: string; updated_count: number }>('/challenges/bulk-update/', data);
  }

  /**
   * Get challenge submissions (Admin)
   */
  async getChallengeSubmissions(
    challengeId: string,
    params?: {
      page?: number;
      page_size?: number;
      is_correct?: boolean;
      ordering?: string;
    }
  ): Promise<ChallengeSubmissionsResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/challenges/${challengeId}/submissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<ChallengeSubmissionsResponse>(endpoint);
  }

  /**
   * Get challenge analytics (Admin)
   */
  async getChallengeAnalytics(challengeId: string): Promise<ChallengeAnalytics> {
    return apiClient.get<ChallengeAnalytics>(`/challenges/${challengeId}/analytics/`);
  }

  /**
   * Export challenges (Admin)
   */
  async exportChallenges(params?: {
    format?: 'json' | 'csv' | 'xlsx';
    category?: string;
    difficulty?: string;
    status?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const token = apiClient.isAuthenticated() 
      ? localStorage.getItem('ctf_access_token')
      : null;
    
    const response = await fetch(`/api/challenges/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to export challenges');
    }

    return response.blob();
  }

  /**
   * Import challenges (Admin)
   */
  async importChallenges(file: File): Promise<{ message: string; imported_count: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // FormData will automatically set the correct Content-Type with boundary
    return apiClient.post<{ message: string; imported_count: number; errors: string[] }>(
      '/challenges/import/',
      formData,
      true // requireAuth
    );
  }

  /**
   * Submit complete challenge with all questions
   * Saves to Redis and updates scoreboard
   */
  async submitCompleteChallenge(
    challengeId: string,
    data: {
      eventId: string;
      teamId: string;
      challengeStartTime: string;
      totalTimeSpent: number;
      questionsData: Array<{
        questionId: string;
        questionType: string;
        answer: string | string[];
        hintsUsed: number;
        isCorrect: boolean;
        points: number;
      }>;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      totalScore: number;
      completedQuestions: number;
      totalQuestions: number;
    };
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      data?: {
        totalScore: number;
        completedQuestions: number;
        totalQuestions: number;
      };
    }>(`/challenges/${challengeId}/submit-challenge`, data);
  }

  /**
   * Get challenge progress from Redis (detailed with Redis data structure)
   */
  async getChallengeProgressRedis(
    challengeId: string,
    eventId: string,
    teamId: string
  ): Promise<{
    success: boolean;
    data?: {
      event_id: string;
      team_id: string;
      challenge_id: string;
      started_at: string;
      current_session_start: string;
      total_time_spent_seconds: number;
      is_paused: boolean;
      pause_count: number;
      questions: Record<string, {
        question_id: string;
        question_type: string;
        answer_submitted: any;
        is_correct: boolean;
        hints_used_count: number;
        points_earned: number;
        attempts_count: number;
        answered_at: string;
        time_spent_seconds: number;
      }>;
      last_updated: string;
      total_questions_answered: number;
      total_points_earned: number;
    };
  }> {
    return apiClient.get<any>(
      `/challenges/${challengeId}/progress?eventId=${eventId}&teamId=${teamId}`
    );
  }

  /**
   * Start or resume challenge
   */
  async startOrResumeChallenge(
    challengeId: string,
    eventId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return apiClient.post<any>(
      `/challenges/${challengeId}/start-resume?eventId=${eventId}`,
      {}
    );
  }

  /**
   * Pause challenge
   */
  async pauseChallenge(
    challengeId: string,
    eventId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return apiClient.post<any>(
      `/challenges/${challengeId}/pause?eventId=${eventId}`,
      {}
    );
  }
}

// Export singleton instance
export const challengesAPI = new ChallengesAPI();

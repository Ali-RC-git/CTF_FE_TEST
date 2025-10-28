/**
 * Challenge Service
 * Handles all challenge-related API calls
 */

import { CreateChallengeData } from '../validation';

// Types for Questions and Artifacts
export interface Hint {
  text: string;
  cost: number;
}

export interface Question {
  id: string;
  title: string;
  text: string;
  flagFormat: string;
  correctAnswer: string;
  points: number;
  whyMatters: string;
  maxHints: number;
  pointsPerHint: number;
  maxAttempts: number;
  hints: Hint[];
}

export interface MCQOption {
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id: string;
  title: string;
  text: string;
  options: MCQOption[];
  points: number;
  explanation: string;
}

export interface FIBQuestion {
  id: string;
  title: string;
  text: string;
  blanks: string[];
  acceptableVariations: string[];
  points: number;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export interface CompleteChallengeData extends CreateChallengeData {
  flag_questions?: Question[];
  mcq_questions?: MCQQuestion[];
  fib_questions?: FIBQuestion[];
  artifacts?: Artifact[];
  startDate?: string;
  endDate?: string;
}

export interface ChallengeResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  total_points?: number;  // Backend field
  calculated_points?: number;  // Backend field
  status: string;
  scenario?: string;
  contextNotes?: string;
  context_note?: string;  // Backend field (snake_case)
  tags?: string[];
  start_date?: string;
  end_date?: string;
  time_estimate_minutes?: number;  // Backend field
  is_featured?: boolean;
  is_visible?: boolean;
  is_published?: boolean;  // Backend field
  is_draft?: boolean;  // Backend field
  preview_enabled?: boolean;  // Backend field
  max_attempts?: number;  // Backend field
  flag_questions?: Question[];
  mcq_questions?: MCQQuestion[];
  fib_questions?: FIBQuestion[];
  fillblank_questions?: any[];  // Backend field
  artifacts?: Artifact[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  created_by_name?: string;
}

export interface ChallengePreview {
  challenge: ChallengeResponse;
  totalQuestions: number;
  totalPoints: number;
  estimatedTime: number;
}

export interface ChallengeStats {
  total_attempts: number;
  successful_attempts: number;
  completion_rate: number;
  average_time_spent: number;
  hint_usage: number;
  average_score: number;
}

class ChallengeService {
  /**
   * Create a new challenge with all questions and artifacts
   * @param data - Complete challenge data including questions and artifacts
   * @returns Created challenge with ID
   */
  async createChallenge(data: CompleteChallengeData): Promise<ChallengeResponse> {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Basic fields
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          points: data.points,
          status: data.status,
          scenario: data.scenario || '',
          contextNotes: data.contextNotes || '',
          tags: data.tags || [],
          start_date: data.startDate,
          end_date: data.endDate,
          is_featured: false,
          is_visible: true,
          
          // Questions
          flag_questions: data.flag_questions || [],
          mcq_questions: data.mcq_questions || [],
          fib_questions: data.fib_questions || [],
          
          // Artifacts
          artifacts: data.artifacts || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create challenge');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get a single challenge by ID with all questions and artifacts
   * @param id - Challenge ID
   * @returns Complete challenge data
   */
  async getChallengeById(id: string): Promise<ChallengeResponse> {
    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch challenge');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  }

  /**
   * Update an existing challenge with all questions and artifacts
   * @param id - Challenge ID
   * @param data - Updated challenge data
   * @returns Updated challenge
   */
  async updateChallengeComplete(id: string, data: Partial<CompleteChallengeData>): Promise<ChallengeResponse> {
    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Basic fields
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          points: data.points,
          status: data.status,
          scenario: data.scenario,
          contextNotes: data.contextNotes,
          tags: data.tags,
          start_date: data.startDate,
          end_date: data.endDate,
          
          // Questions
          flag_questions: data.flag_questions,
          mcq_questions: data.mcq_questions,
          fib_questions: data.fib_questions,
          
          // Artifacts
          artifacts: data.artifacts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update challenge');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  /**
   * Update an existing challenge (legacy method for backward compatibility)
   * @param id - Challenge ID
   * @param data - Updated challenge data
   * @returns Updated challenge
   */
  async updateChallenge(id: string, data: Partial<CreateChallengeData>): Promise<ChallengeResponse> {
    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update challenge');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  /**
   * Delete a challenge
   * @param id - Challenge ID
   * @returns Success message
   */
  async deleteChallenge(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete challenge');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  /**
   * Get all challenges with optional filtering
   * @param filters - Optional query parameters
   * @returns List of challenges
   */
  async getChallenges(filters?: Record<string, any>): Promise<{ results: ChallengeResponse[]; count: number; next?: string | null; previous?: string | null }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `/api/challenges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch challenges');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  /**
   * Get a single challenge by ID (legacy method)
   * @param id - Challenge ID
   * @returns Challenge data
   */
  async getChallenge(id: string): Promise<ChallengeResponse> {
    return this.getChallengeById(id);
  }

  /**
   * Get challenge preview data for student view
   * @param id - Challenge ID
   * @returns Preview data with calculated totals
   */
  async getChallengePreview(id: string): Promise<ChallengePreview> {
    try {
      const response = await fetch(`/api/challenges/${id}/preview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch challenge preview');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching challenge preview:', error);
      throw error;
    }
  }

  /**
   * Get challenge analytics and statistics
   * @param id - Challenge ID
   * @returns Statistics including attempts, completion rate, etc.
   */
  async getChallengeStats(id: string): Promise<ChallengeStats> {
    try {
      const response = await fetch(`/api/challenges/${id}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch challenge stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching challenge stats:', error);
      throw error;
    }
  }

  /**
   * Upload an artifact file for a challenge
   * @param challengeId - Challenge ID
   * @param file - File to upload
   * @returns Uploaded artifact data with URL
   */
  async uploadArtifact(challengeId: string, file: File): Promise<Artifact> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);

      const response = await fetch(`/api/challenges/${challengeId}/artifacts`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header for FormData, browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload artifact');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading artifact:', error);
      throw error;
    }
  }

  /**
   * Delete an artifact from a challenge
   * @param challengeId - Challenge ID
   * @param artifactId - Artifact ID to delete
   * @returns Success message
   */
  async deleteArtifact(challengeId: string, artifactId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/artifacts/${artifactId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete artifact');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting artifact:', error);
      throw error;
    }
  }

  /**
   * Add a single question to an existing challenge
   * @param challengeId - Challenge ID
   * @param question - Question data
   * @param type - Question type ('flag' | 'mcq' | 'fib')
   * @returns Updated challenge
   */
  async addQuestion(
    challengeId: string,
    question: Question | MCQQuestion | FIBQuestion,
    type: 'flag' | 'mcq' | 'fib'
  ): Promise<ChallengeResponse> {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  /**
   * Update a specific question in a challenge
   * @param challengeId - Challenge ID
   * @param questionId - Question ID
   * @param question - Updated question data
   * @param type - Question type ('flag' | 'mcq' | 'fib')
   * @returns Updated challenge
   */
  async updateQuestion(
    challengeId: string,
    questionId: string,
    question: Partial<Question | MCQQuestion | FIBQuestion>,
    type: 'flag' | 'mcq' | 'fib'
  ): Promise<ChallengeResponse> {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  /**
   * Delete a specific question from a challenge
   * @param challengeId - Challenge ID
   * @param questionId - Question ID
   * @param type - Question type ('flag' | 'mcq' | 'fib')
   * @returns Updated challenge
   */
  async deleteQuestion(
    challengeId: string,
    questionId: string,
    type: 'flag' | 'mcq' | 'fib'
  ): Promise<ChallengeResponse> {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/questions/${questionId}?type=${type}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete question');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }
}

export const challengeService = new ChallengeService();

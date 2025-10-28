/**
 * Event Registration API service
 * Handles event code validation and user registration with events
 */

import { apiClient } from './client';

// Event Code Validation Types
export interface EventCodeValidationRequest {
  event_code: string;
}

export interface EventCodeValidationResponse {
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
}

// User Status Check Types
export interface UserStatusCheckRequest {
  event_code: string;
  email: string;
}

export interface UserStatusCheckResponse {
  success: boolean;
  message: string;
  data: {
    user_exists: boolean;
    user_id?: string;
    user_email?: string;
    user_name?: string;
    event_name?: string;
    event_code?: string;
    registration_id?: string;
    registered_at?: string;
    event_description?: string;
    starts_at?: string;
    ends_at?: string;
    requires_registration?: boolean;
  };
}

// User Registration Types
export interface UserRegistrationRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  otp_id: string;
  role?: string;
  institution?: string;
  department?: string;
  event_id?: string; // Optional - for event-based registration
}

export interface UserRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    institution?: string;
    department?: string;
    is_active: boolean;
    date_joined: string;
  };
}

// Event Registration with Code Types
export interface EventRegistrationWithCodeRequest {
  event_code: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  otp_id: string;
  role?: string;
  institution?: string;
  department?: string;
}

export interface EventRegistrationWithCodeResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    user_email: string;
    user_name: string;
    event_name: string;
    event_code: string;
    registration_id: string;
    registered_at: string;
  };
}

class EventRegistrationAPI {
  /**
   * Validate event code
   * GET /api/v1/events/validate-code/{event_code}/
   */
  async validateEventCode(eventCode: string): Promise<EventCodeValidationResponse> {
    return apiClient.get<EventCodeValidationResponse>(
      `/events/validate-code/${eventCode}/`, 
      false // No authentication required
    );
  }

  /**
   * Check user status and register existing user to event
   * POST /api/v1/events/public/register-with-code/
   */
  async checkUserStatusAndRegister(data: UserStatusCheckRequest): Promise<UserStatusCheckResponse> {
    return apiClient.post<UserStatusCheckResponse>('/events/public/register-with-code/', data, false);
  }

  /**
   * Complete user registration with event code
   * POST /api/v1/events/register-user-with-code/
   */
  async registerUserWithEventCode(data: EventRegistrationWithCodeRequest): Promise<EventRegistrationWithCodeResponse> {
    return apiClient.post<EventRegistrationWithCodeResponse>('/events/register-user-with-code/', data, false);
  }

  /**
   * Register user without event
   * POST /api/v1/auth/register/
   */
  async registerUserWithoutEvent(userData: Omit<UserRegistrationRequest, 'event_id'>): Promise<UserRegistrationResponse> {
    return apiClient.post<UserRegistrationResponse>('/auth/register/', userData, false);
  }

  /**
   * Register user with event
   * POST /api/v1/auth/register/
   */
  async registerUserWithEvent(userData: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    return apiClient.post<UserRegistrationResponse>('/auth/register/', userData, false);
  }

  /**
   * Generic user registration (handles both with and without event)
   * POST /api/v1/auth/register/
   */
  async registerUser(userData: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    return apiClient.post<UserRegistrationResponse>('/auth/register/', userData, false);
  }
}

// Export singleton instance
export const eventRegistrationAPI = new EventRegistrationAPI();


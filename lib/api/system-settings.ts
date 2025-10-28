/**
 * System Settings API service
 * Handles all system settings related API calls
 */

import { apiClient } from './client';

// Types for system settings
export interface SystemSettings {
  id: string;
  password_policy: string;
  min_password_length: number;
  require_mixed_case: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  session_timeout_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface PasswordPolicyOption {
  value: string;
  label: string;
  description: string;
}

export interface SessionTimeoutOption {
  value: number;
  label: string;
}

export interface PublicSettings {
  password_policy: {
    min_length: number;
    require_mixed_case: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };
  session_timeout_minutes: number;
}

export interface UpdateSystemSettingsRequest {
  password_policy?: string;
  session_timeout_minutes?: number;
}

class SystemSettingsAPI {
  /**
   * Get current system settings
   */
  async getCurrentSettings(): Promise<SystemSettings> {
    return apiClient.get<SystemSettings>('/core/admin/system-settings/');
  }

  /**
   * Update system settings (admin only)
   */
  async updateSettings(data: UpdateSystemSettingsRequest): Promise<SystemSettings> {
    return apiClient.put<SystemSettings>('/core/admin/system-settings/', data);
  }

  /**
   * Get password policy dropdown options
   */
  async getPasswordPolicyOptions(): Promise<PasswordPolicyOption[]> {
    return apiClient.get<PasswordPolicyOption[]>('/core/admin/password-policy-options/');
  }

  /**
   * Get session timeout dropdown options
   */
  async getSessionTimeoutOptions(): Promise<SessionTimeoutOption[]> {
    return apiClient.get<SessionTimeoutOption[]>('/core/admin/session-timeout-options/');
  }

  /**
   * Get public settings for validation
   */
  async getPublicSettings(): Promise<PublicSettings> {
    return apiClient.get<PublicSettings>('/core/public/settings/');
  }
}

export const systemSettingsAPI = new SystemSettingsAPI();

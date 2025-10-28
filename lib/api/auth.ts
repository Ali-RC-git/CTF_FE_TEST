/**
 * Authentication API service
 * Handles all authentication-related API calls
 */

import { apiClient } from './client';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
  event_code?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  otp_id?: string;
  role?: string;
  institution?: string;
  department?: string;
  event_code?: string;
}

export interface LoginWithEventRequest {
  email: string;
  password: string;
  event_code: string;
}

export interface LoginWithEventResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      first_name: string;
      last_name: string;
      role: string;
      is_active: boolean;
    };
    tokens: {
      access: string;
      refresh: string;
    };
    event_registration: {
      registration_id: string;
      event_name: string;
      event_code: string;
      registered_at: string;
    };
  };
  user_status?: string;
}

export interface RegisterWithEventRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  institution?: string;
  department?: string;
  event_code: string;
}

export interface RegisterWithEventResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    email: string;
    username: string;
    status: string;
    event_registration: {
      registration_id: string;
      event_name: string;
      event_code: string;
      registered_at: string;
    };
    verification_email_sent: boolean;
  };
}

export interface SendVerificationEmailRequest {
  email: string;
}

export interface SendVerificationEmailResponse {
  success: boolean;
  message: string;
}

export interface VerifyAccountRequest {
  email: string;
  otp_code: string;
}

export interface VerifyAccountResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    status: string;
    verified_at: string;
  };
}

// Resend OTP interfaces
export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    user_name: string;
    otp_sent: boolean;
  };
  errors?: {
    email?: string[];
  };
}

// Forgot Password interfaces
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expires_at: string;
  };
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    email: string;
  };
}

export interface UserProfile {
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
  profile: {
    bio: string | null;
    avatar: string | null;
    phone: string | null;
    institution: string | null;
    department: string | null;
    student_id: string | null;
    email_notifications: boolean;
    push_notifications: boolean;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    status: string;
    verification_email_sent: boolean;
    event_registration: {
      registration_id: string;
      event_name: string;
      event_code: string;
      registered_at: string;
    } | null;
  };
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  profile?: Partial<UserProfile['profile']>;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface EnableMFARequest {
  password: string;
}

export interface User {
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
  profile: UserProfile['profile'];
  teams?: any[];
}

export interface UsersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface AuditLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

class AuthAPI {
  /**
   * User registration
   * Uses extended timeout for email service processing
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register/', data, false, {
      timeout: 30000 // 30 seconds for email service processing
    });
  }

  /**
   * User login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login/', data, false);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/token/refresh/', { refresh: refreshToken }, false);
  }

  /**
   * User logout
   */
  async logout(refreshToken: string): Promise<void> {
    return apiClient.post<void>('/auth/logout/', { refresh: refreshToken });
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/profile/');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/auth/profile/update/', data);
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/password/change/', data);
  }

  /**
   * Enable MFA
   */
  async enableMFA(data: EnableMFARequest): Promise<{ message: string; qr_code?: string }> {
    return apiClient.post<{ message: string; qr_code?: string }>('/auth/mfa/enable/', data);
  }

  /**
   * List all users (Admin/Instructor only)
   */
  async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<UsersListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/auth/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<UsersListResponse>(endpoint);
  }

  /**
   * Get user details (Admin only)
   */
  async getUser(userId: string): Promise<User> {
    return apiClient.get<User>(`/auth/users/${userId}/`);
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/auth/users/${userId}/`, data);
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/auth/users/${userId}/`);
  }

  /**
   * Get audit logs (Admin only)
   */
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    user?: string;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<AuditLogsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.user) queryParams.append('user', params.user);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.resource_type) queryParams.append('resource_type', params.resource_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const endpoint = `/auth/audit-logs/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<AuditLogsResponse>(endpoint);
  }

  /**
   * Login with event registration
   */
  async loginWithEvent(data: LoginWithEventRequest): Promise<LoginWithEventResponse> {
    return apiClient.post<LoginWithEventResponse>('/auth/login-with-event/', data, false);
  }

  /**
   * Register with event code
   */
  async registerWithEvent(data: RegisterWithEventRequest): Promise<RegisterWithEventResponse> {
    return apiClient.post<RegisterWithEventResponse>('/auth/register-with-event/', data, false);
  }

  /**
   * Send verification email
   * Uses extended timeout for email service processing
   */
  async sendVerificationEmail(data: SendVerificationEmailRequest): Promise<SendVerificationEmailResponse> {
    return apiClient.post<SendVerificationEmailResponse>('/auth/send-verification-email/', data, false, {
      timeout: 30000 // 30 seconds for email service processing
    });
  }

  /**
   * Verify account with OTP code
   */
  async verifyAccount(data: VerifyAccountRequest): Promise<VerifyAccountResponse> {
    return apiClient.post<VerifyAccountResponse>('/auth/verify-account/', data, false);
  }

  /**
   * Send forgot password OTP
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password/', data, false, { 
      timeout: 30000 // 30 seconds timeout for forgot password
    });
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return apiClient.post<ResetPasswordResponse>('/auth/reset-password/', data, false, { 
      timeout: 30000 // 30 seconds timeout for reset password
    });
  }

  /**
   * Resend OTP for account verification
   */
  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return apiClient.post<ResendOTPResponse>('/auth/resend-otp/', data, false, {
      timeout: 30000 // 30 seconds for email service processing
    });
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();

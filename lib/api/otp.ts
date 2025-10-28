/**
 * OTP API service
 * Handles all OTP-related API calls for user registration
 */

import { apiClient } from './client';

// OTP Types
export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expires_at: string;
    otp_id: string;
  };
}

export interface VerifyOTPRequest {
  email: string;
  otp_code: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    verified_at: string;
    otp_id: string;
  };
}

export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expires_at: string;
    otp_id: string;
  };
}

export interface OTPStatusResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    status: 'pending' | 'verified' | 'expired';
    attempts: number;
    max_attempts: number;
    created_at: string;
    expires_at: string;
    verified_at: string | null;
  };
}

export interface RegisterUserRequest {
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

export interface RegisterUserResponse {
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

export interface SendWelcomeEmailRequest {
  email: string;
  user_name: string;
}

export interface SendWelcomeEmailResponse {
  success: boolean;
  message: string;
}

class OTPAPI {
  /**
   * Send OTP to email
   */
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    return apiClient.post<SendOTPResponse>('/auth/otp/send/', data, false);
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return apiClient.post<VerifyOTPResponse>('/auth/otp/verify/', data, false);
  }

  /**
   * Resend OTP
   */
  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return apiClient.post<ResendOTPResponse>('/auth/otp/resend/', data, false);
  }

  /**
   * Check OTP status
   */
  async getOTPStatus(email: string): Promise<OTPStatusResponse> {
    return apiClient.get<OTPStatusResponse>(`/auth/otp/status/${email}/`, false);
  }

  /**
   * Register user with OTP
   */
  async registerUser(data: RegisterUserRequest): Promise<RegisterUserResponse> {
    return apiClient.post<RegisterUserResponse>('/auth/register/', data, false);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data: SendWelcomeEmailRequest): Promise<SendWelcomeEmailResponse> {
    return apiClient.post<SendWelcomeEmailResponse>('/auth/otp/send-welcome/', data, false);
  }
}

// Export singleton instance
export const otpAPI = new OTPAPI();

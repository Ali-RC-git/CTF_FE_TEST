/**
 * User Management API service
 * Handles all user-related API calls for admin functionality
 */

import { apiClient } from './client';

// Types for user management
export interface UserTeam {
  team_id: string;
  team_name: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'user';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
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
  teams?: UserTeam[];
  current_team?: UserTeam | null;
}

export interface UsersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface CreateUserRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  role?: 'admin' | 'instructor' | 'user';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  institution?: string;
  department?: string;
  team_id?: string | null;
  team_role?: 'leader' | 'member';
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  password_confirm?: string;
  role?: 'admin' | 'instructor' | 'user';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  team_id?: string | null;
  team_role?: 'leader' | 'member';
  profile?: {
    institution?: string;
    department?: string;
  };
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  suspended_users: number;
  pending_users: number;
  users_by_role: {
    admin: number;
    instructor: number;
    user: number;
  };
  mfa_enabled_users: number;
}

export interface BulkUpdateRequest {
  user_ids: string[];
  updates: {
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
    role?: 'admin' | 'instructor' | 'user';
  };
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  details: any;
}

export interface AuditLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

class UsersAPI {
  /**
   * List users with search, filter, and pagination
   */
  async listUsers(params?: {
    search?: string;
    role?: 'admin' | 'instructor' | 'user';
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
    is_mfa_enabled?: boolean;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<UsersListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_mfa_enabled !== undefined) queryParams.append('is_mfa_enabled', params.is_mfa_enabled.toString());
    if (params?.ordering) queryParams.append('ordering', params.ordering);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const endpoint = `/auth/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<UsersListResponse>(endpoint);
  }

  /**
   * Get specific user by ID
   */
  async getUser(userId: string): Promise<User> {
    return apiClient.get<User>(`/auth/users/${userId}/`);
  }

  /**
   * Create new user (Admin only)
   */
  async createUser(data: CreateUserRequest): Promise<{ user: User; message: string }> {
    return apiClient.post<{ user: User; message: string }>('/auth/users/create/', data);
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`/auth/users/${userId}/`, data);
  }

  /**
   * Partially update user
   */
  async patchUser(userId: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.patch<User>(`/auth/users/${userId}/`, data);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/auth/users/${userId}/`);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    return apiClient.get<UserStats>('/auth/users/stats/');
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(data: BulkUpdateRequest): Promise<{ message: string; updated_count: number }> {
    return apiClient.post<{ message: string; updated_count: number }>('/auth/users/bulk-update/', data);
  }

  /**
   * Get audit logs (Admin only)
   */
  async getAuditLogs(params?: {
    page?: number;
    page_size?: number;
    user?: string;
    action?: string;
    resource_type?: string;
    ordering?: string;
  }): Promise<AuditLogsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.user) queryParams.append('user', params.user);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.resource_type) queryParams.append('resource_type', params.resource_type);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const endpoint = `/auth/audit-logs/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<AuditLogsResponse>(endpoint);
  }
}

// Export singleton instance
export const usersAPI = new UsersAPI();

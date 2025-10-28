/**
 * Custom hook for user management
 * Provides user-related operations and state management for admin functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { usersAPI, APIError } from '@/lib/api';
import { User, CreateUserRequest, UpdateUserRequest, UserStats, BulkUpdateRequest } from '@/lib/api/users';

interface UseUserManagementState {
  users: User[];
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseUserManagementReturn extends UseUserManagementState {
  // User operations
  createUser: (data: CreateUserRequest) => Promise<User>;
  updateUser: (userId: string, data: UpdateUserRequest) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  bulkUpdateUsers: (data: BulkUpdateRequest) => Promise<{ message: string; updated_count: number }>;
  
  // Data fetching
  fetchUsers: (params?: {
    search?: string;
    role?: 'admin' | 'instructor' | 'user';
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
    is_mfa_enabled?: boolean;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  fetchUser: (userId: string) => Promise<User>;
  
  // Utility functions
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export function useUserManagement(): UseUserManagementReturn {
  const [state, setState] = useState<UseUserManagementState>({
    users: [],
    userStats: null,
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch users with filters and pagination
  const fetchUsers = useCallback(async (params?: {
    search?: string;
    role?: 'admin' | 'instructor' | 'user';
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
    is_mfa_enabled?: boolean;
    ordering?: string;
    page?: number;
    page_size?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.listUsers(params);
      
      // Handle both array response and paginated response
      let users, totalCount, hasNextPage, hasPreviousPage;
      
      if (Array.isArray(response)) {
        // Direct array response
        users = response;
        totalCount = response.length;
        hasNextPage = false;
        hasPreviousPage = false;
      } else {
        // Paginated response object
        users = response.results || [];
        totalCount = response.count || 0;
        hasNextPage = !!response.next;
        hasPreviousPage = !!response.previous;
      }
      
      setState(prev => ({
        ...prev,
        users: users,
        totalCount: totalCount,
        currentPage: params?.page || 1,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage
      }));
    } catch (error) {
      console.error('useUserManagement - fetchUsers error:', error);
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await usersAPI.getUserStats();
      setState(prev => ({ ...prev, userStats: stats }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch user statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific user
  const fetchUser = useCallback(async (userId: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await usersAPI.getUser(userId);
      return user;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to fetch user';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create user
  const createUser = useCallback(async (data: CreateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersAPI.createUser(data);
      const newUser = response.user; // Extract user from response
      
      // Add to users list
      setState(prev => ({ 
        ...prev, 
        users: [newUser, ...prev.users],
        totalCount: prev.totalCount + 1
      }));
      
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to create user';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (userId: string, data: UpdateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await usersAPI.updateUser(userId, data);
      
      // Update in users list
      setState(prev => ({ 
        ...prev, 
        users: prev.users.map(user => user.id === userId ? updatedUser : user)
      }));
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to update user';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await usersAPI.deleteUser(userId);
      
      // Remove from users list
      setState(prev => ({ 
        ...prev, 
        users: prev.users.filter(user => user.id !== userId),
        totalCount: prev.totalCount - 1
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to delete user';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk update users
  const bulkUpdateUsers = useCallback(async (data: BulkUpdateRequest): Promise<{ message: string; updated_count: number }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await usersAPI.bulkUpdateUsers(data);
      
      // Refresh users list to get updated data
      await fetchUsers({ page: state.currentPage });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to bulk update users';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, state.currentPage]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchUsers({ page: state.currentPage }),
      fetchUserStats()
    ]);
  }, [fetchUsers, fetchUserStats, state.currentPage]);

  // Remove automatic data loading - let components control when to fetch data

  return {
    ...state,
    createUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
    fetchUsers,
    fetchUserStats,
    fetchUser,
    clearError,
    refreshData
  };
}

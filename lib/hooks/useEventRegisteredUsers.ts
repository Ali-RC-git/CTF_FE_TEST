/**
 * Custom hook for managing event registered users
 * Provides functionality to fetch users registered for a specific event
 */

import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { teamsAPI } from '@/lib/api';

export interface EventRegisteredUser {
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
  last_login_at: string;
  profile: {
    bio?: string;
    avatar?: string;
    phone?: string;
    institution?: string;
    department?: string;
    student_id?: string;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  teams: any[];
  current_team: any;
}

interface UseEventRegisteredUsersReturn {
  users: EventRegisteredUser[];
  isLoading: boolean;
  error: string | null;
  fetchRegisteredUsers: (eventCode: string) => Promise<void>;
  clearError: () => void;
}

export function useEventRegisteredUsers(): UseEventRegisteredUsersReturn {
  const [users, setUsers] = useState<EventRegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  const fetchRegisteredUsers = useCallback(async (eventCode: string) => {
    if (!eventCode) {
      setError('Event code is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await teamsAPI.getEventRegisteredUsers(eventCode);
      setUsers(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch registered users';
      setError(errorMessage);
      console.error('Error fetching event registered users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchRegisteredUsers,
    clearError
  };
}

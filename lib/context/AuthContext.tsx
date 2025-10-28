'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, BackendUser } from '@/lib/types';
import { authAPI, TokenManager, APIError } from '@/lib/api';
import { mapBackendUserToUser } from '@/lib/utils/api-mappers';

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string, eventCode?: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  switchRole: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for auth state changes
  console.log('AuthContext authState:', authState);

  const refreshUser = async () => {
    try {
      console.log('refreshUser called');
      const userProfile = await authAPI.getProfile();
      console.log('Backend user profile:', userProfile);
      const user = mapBackendUserToUser(userProfile);
      console.log('Mapped user:', user);
      
      setAuthState({
        isAuthenticated: true,
        user
      });

      // Set user role in cookie for middleware access
      document.cookie = `user_role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      
      console.log('refreshUser completed successfully');
    } catch (error) {
      console.error('Failed to refresh user:', error);
      TokenManager.clearTokens();
      setAuthState({
        isAuthenticated: false,
        user: null
      });
      throw error;
    }
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('initializeAuth called');
      if (TokenManager.isAuthenticated()) {
        console.log('User is authenticated, refreshing user data');
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh user on initialization:', error);
          TokenManager.clearTokens();
        }
      } else {
        console.log('User is not authenticated');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, eventCode?: string) => {
    console.log('Login function called');
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare login data with optional event code
      const loginData = {
        email,
        password,
        ...(eventCode && { event_code: eventCode })
      };

      const response = await authAPI.login(loginData);
      console.log('Login API response:', response);
      
      // Store tokens (reverted to original structure)
      TokenManager.setTokens(response.access, response.refresh);
      console.log('Tokens stored');
      
      // Fetch user profile and return the user data
      const userProfile = await authAPI.getProfile();
      console.log('Profile API response:', userProfile);
      const user = mapBackendUserToUser(userProfile);
      console.log('Mapped user:', user);
      
      // Update auth state
      setAuthState({
        isAuthenticated: true,
        user
      });

      // Set user role in cookie for middleware access
      document.cookie = `user_role=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      
      console.log('Auth state updated, returning user data');
      console.log('Final user object:', user);
      console.log('User role:', user.role);
      return user; // Return user data for redirect logic
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Login failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        // Return the registration response data instead of auto-login
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear tokens and state regardless of API call result
      TokenManager.clearTokens();
      
      // Clear user role cookie
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      setAuthState({
        isAuthenticated: false,
        user: null
      });
      setIsLoading(false);
    }
  };

  const switchRole = () => {
    if (authState.user) {
      const newRole = authState.user.role === 'student' ? 'admin' : 'student';
      setAuthState({
        ...authState,
        user: {
          ...authState.user,
          role: newRole
        }
      });
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      register,
      logout, 
      switchRole, 
      refreshUser,
      isLoading,
      error: error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

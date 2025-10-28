'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  systemSettingsAPI, 
  SystemSettings, 
  PasswordPolicyOption, 
  SessionTimeoutOption,
  PublicSettings,
  UpdateSystemSettingsRequest 
} from '@/lib/api';
import toast from 'react-hot-toast';

// Global state for system settings
let globalState = {
  systemSettings: null as SystemSettings | null,
  passwordPolicyOptions: [] as PasswordPolicyOption[],
  sessionTimeoutOptions: [] as SessionTimeoutOption[],
  publicSettings: null as PublicSettings | null,
  isLoading: false,
  error: null as string | null,
  hasLoadedInitialData: false
};

// Global state update function
const updateGlobalState = (updater: (prev: typeof globalState) => typeof globalState) => {
  globalState = updater(globalState);
  // Notify all listeners
  listeners.forEach(listener => listener(globalState));
};

// Listener management
const listeners = new Set<(state: typeof globalState) => void>();

interface UseSystemSettingsState {
  systemSettings: SystemSettings | null;
  passwordPolicyOptions: PasswordPolicyOption[];
  sessionTimeoutOptions: SessionTimeoutOption[];
  publicSettings: PublicSettings | null;
  isLoading: boolean;
  error: string | null;
}

interface UseSystemSettingsReturn extends UseSystemSettingsState {
  // Actions
  fetchSystemSettings: () => Promise<void>;
  fetchPasswordPolicyOptions: () => Promise<void>;
  fetchSessionTimeoutOptions: () => Promise<void>;
  fetchPublicSettings: () => Promise<void>;
  updateSystemSettings: (data: UpdateSystemSettingsRequest) => Promise<SystemSettings>;
  refreshAllSettings: () => Promise<void>;
  clearError: () => void;
}

export function useSystemSettingsSingleton(): UseSystemSettingsReturn {
  const [state, setState] = useState<UseSystemSettingsState>(globalState);
  const hasLoadedInitialDataRef = useRef(false);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (newState: typeof globalState) => {
      setState(newState);
    };
    
    listeners.add(listener);
    
    // Set initial state
    setState(globalState);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Fetch system settings
  const fetchSystemSettings = useCallback(async (): Promise<void> => {
    updateGlobalState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const settings = await systemSettingsAPI.getCurrentSettings();
      updateGlobalState(prev => ({ 
        ...prev, 
        systemSettings: settings,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system settings';
      updateGlobalState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      toast.error(errorMessage);
    }
  }, []);

  // Fetch password policy options
  const fetchPasswordPolicyOptions = useCallback(async (): Promise<void> => {
    try {
      const options = await systemSettingsAPI.getPasswordPolicyOptions();
      updateGlobalState(prev => ({ 
        ...prev, 
        passwordPolicyOptions: options 
      }));
    } catch (error) {
      console.error('Failed to fetch password policy options:', error);
    }
  }, []);

  // Fetch session timeout options
  const fetchSessionTimeoutOptions = useCallback(async (): Promise<void> => {
    try {
      const options = await systemSettingsAPI.getSessionTimeoutOptions();
      updateGlobalState(prev => ({ 
        ...prev, 
        sessionTimeoutOptions: options 
      }));
    } catch (error) {
      console.error('Failed to fetch session timeout options:', error);
    }
  }, []);

  // Fetch public settings (for password validation)
  const fetchPublicSettings = useCallback(async (): Promise<void> => {
    try {
      const settings = await systemSettingsAPI.getPublicSettings();
      updateGlobalState(prev => ({ 
        ...prev, 
        publicSettings: settings 
      }));
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
      // Fallback to default settings
      const fallbackSettings: PublicSettings = {
        password_policy: {
          min_length: 8,
          require_mixed_case: true,
          require_numbers: false,
          require_symbols: false
        },
        session_timeout_minutes: 30
      };
      updateGlobalState(prev => ({ 
        ...prev, 
        publicSettings: fallbackSettings 
      }));
    }
  }, []);

  // Update system settings
  const updateSystemSettings = useCallback(async (data: UpdateSystemSettingsRequest): Promise<SystemSettings> => {
    updateGlobalState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedSettings = await systemSettingsAPI.updateSettings(data);
      updateGlobalState(prev => ({ 
        ...prev, 
        systemSettings: updatedSettings,
        isLoading: false 
      }));
      
      // After successful update, refetch public settings to get the latest password policy and session timeout
      try {
        console.log('Refetching public settings after system settings update...');
        const latestPublicSettings = await systemSettingsAPI.getPublicSettings();
        updateGlobalState(prev => ({ 
          ...prev, 
          publicSettings: latestPublicSettings 
        }));
        console.log('Public settings updated:', latestPublicSettings);
      } catch (publicSettingsError) {
        console.error('Failed to refetch public settings:', publicSettingsError);
        // Don't throw here as the main update was successful
      }
      
      return updatedSettings;
    } catch (error) {
      console.error('Failed to update system settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update system settings';
      updateGlobalState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Refresh all settings
  const refreshAllSettings = useCallback(async (): Promise<void> => {
    updateGlobalState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await Promise.all([
        fetchSystemSettings(),
        fetchPasswordPolicyOptions(),
        fetchSessionTimeoutOptions(),
        fetchPublicSettings()
      ]);
    } catch (error) {
      console.error('Failed to refresh all settings:', error);
    }
  }, [fetchSystemSettings, fetchPasswordPolicyOptions, fetchSessionTimeoutOptions, fetchPublicSettings]);

  // Clear error
  const clearError = useCallback(() => {
    updateGlobalState(prev => ({ ...prev, error: null }));
  }, []);

  // Load initial data only once - only fetch public settings initially
  useEffect(() => {
    if (!hasLoadedInitialDataRef.current && !globalState.hasLoadedInitialData) {
      hasLoadedInitialDataRef.current = true;
      updateGlobalState(prev => ({ ...prev, hasLoadedInitialData: true }));
      
      // Only load public settings initially (for password validation and session timeout)
      fetchPublicSettings();
    }
  }, [fetchPublicSettings]);

  return {
    // State
    systemSettings: state.systemSettings,
    passwordPolicyOptions: state.passwordPolicyOptions,
    sessionTimeoutOptions: state.sessionTimeoutOptions,
    publicSettings: state.publicSettings,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    fetchSystemSettings,
    fetchPasswordPolicyOptions,
    fetchSessionTimeoutOptions,
    fetchPublicSettings,
    updateSystemSettings,
    refreshAllSettings,
    clearError
  };
}

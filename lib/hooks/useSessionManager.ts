'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSystemSettingsSingleton } from './useSystemSettingsSingleton';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

export function useSessionManager() {
  const { logout } = useAuth();
  const router = useRouter();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const { publicSettings } = useSystemSettingsSingleton();

  // Start the session timeout timer
  const startTimer = useCallback(() => {
    if (!publicSettings) return;
    
    const timeoutMinutes = publicSettings.session_timeout_minutes;
    
    // If timeout is 0 (never), don't start timer
    if (timeoutMinutes === 0) return;

    // Clear existing timer
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Set new timer
    timeoutIdRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds
  }, [publicSettings]);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    console.log('Session timeout - logging out user');
    
    // Clear the timer
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    // Logout user and redirect to login
    logout();
    router.push('/login');
  }, [logout, router]);

  // Reset the timer (call this on user activity)
  const resetTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  // Setup activity listeners
  const setupActivityListeners = useCallback(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Return cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetTimer]);

  // Initialize session manager
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initializeSessionManager = () => {
      // Start the timer
      startTimer();
      
      // Setup activity listeners
      cleanup = setupActivityListeners();
    };

    initializeSessionManager();

    // Cleanup on unmount
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [startTimer, setupActivityListeners]);

  // Restart timer when settings change
  useEffect(() => {
    startTimer();
  }, [startTimer]);

  return {
    resetTimer,
    getCurrentTimeout: () => publicSettings?.session_timeout_minutes || 30
  };
}

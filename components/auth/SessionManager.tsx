'use client';

import { useSessionManager } from '@/lib/hooks/useSessionManager';

/**
 * SessionManager component that handles automatic session timeout
 * This component should be included in the main layout to manage user sessions
 */
export default function SessionManager() {
  useSessionManager();
  
  // This component doesn't render anything, it just manages the session
  return null;
}

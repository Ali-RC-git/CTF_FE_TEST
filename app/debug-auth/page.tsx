'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { TokenManager } from '@/lib/api';

export default function DebugAuthPage() {
  const { authState, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary p-8">
      <h1 className="text-3xl font-bold mb-6 text-accent-color">Authentication Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-secondary-bg p-6 rounded-lg border border-border-color">
          <h2 className="text-xl font-semibold mb-4">Auth State</h2>
          <div className="space-y-2">
            <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Is Authenticated:</strong> {authState.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {authState.user ? JSON.stringify(authState.user, null, 2) : 'None'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
        </div>

        <div className="bg-secondary-bg p-6 rounded-lg border border-border-color">
          <h2 className="text-xl font-semibold mb-4">Token Status</h2>
          <div className="space-y-2">
            <p><strong>Has Access Token:</strong> {TokenManager.getAccessToken() ? 'Yes' : 'No'}</p>
            <p><strong>Has Refresh Token:</strong> {TokenManager.getRefreshToken() ? 'Yes' : 'No'}</p>
            <p><strong>Is Authenticated (TokenManager):</strong> {TokenManager.isAuthenticated() ? 'Yes' : 'No'}</p>
            <p><strong>Access Token:</strong> {TokenManager.getAccessToken()?.substring(0, 20) + '...' || 'None'}</p>
          </div>
        </div>

        <div className="bg-secondary-bg p-6 rounded-lg border border-border-color">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/test-challenges'}
              className="bg-accent-color text-white px-6 py-3 rounded-lg hover:bg-accent-dark transition-colors"
            >
              Go to Test Challenges
            </button>
            <button 
              onClick={() => window.location.href = '/admin/challenges'}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Admin Challenges
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Go to Login
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { AuthState } from '@/lib/types';

export default function DemoPage() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  const handleLogin = () => {
    // Simulate login
    setAuthState({
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Rey Gengania',
        initials: 'RG',
        role: 'student',
        organization: 'CRDF Global'
      }
    });
  };

  

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">
              Header Demo
            </h1>
            
            <div className="bg-[#2D1B69] rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Authentication State Demo
              </h2>
              <p className="text-white mb-6">
                This page demonstrates how the header changes based on authentication state.
              </p>
              
              {!authState.isAuthenticated ? (
                <button
                  onClick={handleLogin}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Simulate Login
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-white">
                    Welcome, {authState.user?.name}! You are logged in as a {authState.user?.role}.
                  </p>
                  <button
                    onClick={() => setAuthState({ isAuthenticated: false, user: null })}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 mr-4"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-white">
              <p className="mb-4">
                <strong>When not authenticated:</strong> Header shows "Login" and "Sign Up" buttons
              </p>
              <p>
                <strong>When authenticated:</strong> Header shows user avatar, name, role badge, and "Switch to Admin/Student" button
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

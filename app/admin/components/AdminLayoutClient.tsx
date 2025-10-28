'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import Sidebar from './Sidebar';
import HamburgerButton from './HamburgerButton';

interface AdminLayoutClientProps {
  children: ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authState, isLoading } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Don't render the layout until user data is loaded
  if (isLoading || !authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-primary-bg text-text-primary">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Header with Hamburger */}
        <header className="lg:hidden bg-secondary-bg border-b border-border-color p-4 flex items-center justify-between">
          <HamburgerButton isOpen={sidebarOpen} onClick={toggleSidebar} />
          <div className="text-lg font-semibold text-text-primary">Admin Dashboard</div>
          <div className="w-8 h-8"></div> {/* Spacer for centering */}
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 xl:p-8 overflow-y-auto h-full">
          <div className="w-full max-w-none h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

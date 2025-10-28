'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { LogOut, X, BarChart3, Users, Target, TrendingUp, Key, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, authState } = useAuth();
  const user = authState.user;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Debug logging
  console.log('Sidebar - authState:', authState);
  console.log('Sidebar - user:', user);


  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect to login page after logout
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems = [
    { id: 'dashboard', href: '/admin', icon: BarChart3, label: 'Dashboard' },
    { id: 'users', href: '/admin/users', icon: Users, label: 'User Management' },
    { id: 'challenges', href: '/admin/challenges', icon: Target, label: 'Challenge Management' },
    { id: 'teams', href: '/admin/teams', icon: Users, label: 'Team Management' },
    { id: 'scoreboard', href: '/admin/scoreboard', icon: TrendingUp, label: 'Scoreboard Management' },
    { id: 'registration', href: '/admin/registration', icon: Key, label: 'Event Registration' },
    { id: 'analytics', href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', href: '/admin/settings', icon: Settings, label: 'System Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const hamburger = document.getElementById('hamburger-button');
      
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && !hamburger?.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        id="admin-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-secondary-bg border-r border-border-color flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center text-xl font-bold text-text-primary p-5 pb-5 border-b border-border-color mb-5">
          <div className="bg-gradient-to-r from-accent-dark to-accent-color w-9 h-9 rounded-lg flex items-center justify-center mr-3 font-bold">
            C
          </div>
          CRDF Global <span className="bg-admin-color text-white text-xs px-2 py-0.5 rounded-full ml-2">ADMIN</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1">
          {navigationItems.map((item) => (
            <Link 
              href={item.href} 
              key={item.id}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={`flex items-center py-3 px-5 text-text-secondary hover:bg-accent-color/10 hover:text-text-primary transition-all border-l-3 ${
                isActive(item.href) 
                  ? 'bg-accent-color/10 text-accent-color border-l-accent-color' 
                  : 'border-l-transparent'
              }`}
            >
              <item.icon className="mr-3 w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* User Info */}
        <div className="p-5 border-t border-border-color flex flex-col items-start">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center mr-3 font-bold">
              {user?.initials || 'A'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{user?.name || 'Admin User'}</div>
              <div className="text-xs text-text-secondary">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-text-secondary hover:text-danger-color transition-colors lg:hidden" 
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-start px-3 py-2 text-sm text-text-secondary hover:text-danger-color hover:bg-danger-color/10 transition-colors duration-200 rounded disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
}

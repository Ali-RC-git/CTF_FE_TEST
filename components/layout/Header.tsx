'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { NotificationsBell } from '@/components/notifications';
import { hasOngoingEvents, hasAnyEvents, hasUpcomingEvents } from '@/lib/utils/event-utils';
import { LogOut } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { authState, logout } = useAuth();

  // Check event status
  const hasAny = hasAnyEvents(authState.user as any);
  const hasOngoing = hasOngoingEvents(authState.user as any);
  const hasUpcoming = hasUpcomingEvents(authState.user as any);
  
  console.log('Header authState:', authState);
  // Filter navigation items based on event status
  const getFilteredNavigationItems = (): Array<{ name: string; href: string }> => {
    return NAVIGATION_ITEMS.filter(item => {
      // Always show Courses, Events, and My Teams
      if (['Courses', 'Events'].includes(item.name)) {
        return true;
      }
      
      // Show Dashboard and Scoreboard if user has any events (ongoing or upcoming)
      if (['Dashboard', 'Scoreboard'].includes(item.name)) {
        return hasAny;
      }
      
      return true;
    });
  };

  // Get navigation item with status information
  const getNavigationItemWithStatus = (item: { name: string; href: string }) => {
    if (['Dashboard', 'Scoreboard'].includes(item.name)) {
      if (hasOngoing) {
        // Event is ongoing - normal active state
        return { ...item, disabled: false, status: 'active' };
      } else if (hasUpcoming) {
        // Event is upcoming - show as disabled with placeholder
        return { ...item, disabled: true, status: 'upcoming' };
      }
    }
    return { ...item, disabled: false, status: 'normal' };
  };

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

  return (
    <header className="bg-primary-bg border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-accent-color rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-text-primary text-xl font-semibold">CRDF Global</span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {getFilteredNavigationItems().map((item) => {
              const itemWithStatus = getNavigationItemWithStatus(item);
              const translatedName = item.name === 'Dashboard' ? t.navigation.dashboard :
                                   item.name === 'Courses' ? t.navigation.courses :
                                   item.name === 'Events' ? t.navigation.events :
                                   item.name === 'Scoreboard' ? t.navigation.scoreboard :
                                   item.name === 'My Teams' ? t.navigation.teams : item.name;
              
              if (itemWithStatus.disabled && itemWithStatus.status === 'upcoming') {
                // Show disabled state for upcoming events
                if (item.name === 'Scoreboard') {
                  // For Scoreboard, show "Event starts soon" text instead of link
                  return (
                    <div
                      key={item.name}
                      className="text-text-secondary cursor-not-allowed opacity-75"
                    >
                      Event starts soon
                    </div>
                  );
                } else {
                  // For other tabs (like Dashboard), show disabled state with tooltip
                  return (
                    <div
                      key={item.name}
                      className="text-text-secondary cursor-not-allowed opacity-50 relative group"
                      title="Event starts soon"
                    >
                      {translatedName}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Event starts soon
                      </div>
                    </div>
                  );
                }
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-text-primary hover:text-accent-color transition-colors duration-200 ${
                    pathname === item.href ? 'border-b-2 border-accent-color pb-1' : ''
                  }`}
                >
                  {translatedName}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {authState.isAuthenticated && authState.user ? (
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="w-8 h-8 bg-accent-color rounded-full flex items-center justify-center">
                  <span className="text-text-primary text-sm font-medium">
                    {authState.user.initials}
                  </span>
                </div>
                
                {/* Notifications Bell */}
               
                
                {/* User Name */}
                <span className="text-text-primary text-xs font-medium flex flex-col">
                  {authState.user.name}
                   <span className="bg-accent-color text-white text-xs px-2 py-0.5 rounded-full mt-0.5 self-start">
                  {authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1)}
                </span>
                </span>
                
                {/* Role Badge */}
               
                 <NotificationsBell />
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-text-secondary hover:text-danger-color transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  title={isLoggingOut ? 'Logging out...' : 'Logout'}
                >
                  <LogOut className="w-5 h-5" />
                </button>
                
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-text-primary hover:text-accent-color transition-colors duration-200"
                >
                  {t.header.login}
                </Link>
                <Link
                  href="/signup"
                  className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  {t.header.signup}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-text-primary hover:text-accent-color"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-bg border-t border-border-color">
              {getFilteredNavigationItems().map((item) => {
                const itemWithStatus = getNavigationItemWithStatus(item);
                const translatedName = item.name === 'Dashboard' ? t.navigation.dashboard :
                                     item.name === 'Courses' ? t.navigation.courses :
                                     item.name === 'Events' ? t.navigation.events :
                                     item.name === 'Scoreboard' ? t.navigation.scoreboard :
                                     item.name === 'My Teams' ? t.navigation.teams : item.name;
                
                if (itemWithStatus.disabled && itemWithStatus.status === 'upcoming') {
                  // Show disabled state for upcoming events
                  if (item.name === 'Scoreboard') {
                    // For Scoreboard, show "Event starts soon" text instead of link
                    return (
                      <div
                        key={item.name}
                        className="block px-3 py-2 text-text-secondary cursor-not-allowed opacity-75"
                      >
                        Event starts soon
                      </div>
                    );
                  } else {
                    // For other tabs (like Dashboard), show disabled state with text
                    return (
                      <div
                        key={item.name}
                        className="block px-3 py-2 text-text-secondary cursor-not-allowed opacity-50"
                        title="Event starts soon"
                      >
                        {translatedName} (Event starts soon)
                      </div>
                    );
                  }
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-text-primary hover:text-accent-color transition-colors duration-200 ${
                      pathname === item.href ? 'bg-accent-color/20' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {translatedName}
                  </Link>
                );
              })}
              
              {/* Mobile Logout Button */}
              {authState.isAuthenticated && authState.user && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-text-secondary hover:text-danger-color transition-colors duration-200 disabled:opacity-50"
                  title={isLoggingOut ? 'Logging out...' : 'Logout'}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

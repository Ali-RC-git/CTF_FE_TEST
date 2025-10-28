"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, BarChart3, Users, Target, TrendingUp, Settings } from 'lucide-react';
import DashboardContent from './DashboardContent';
import UsersContent from './UsersContent';
import ChallengesContent from './ChallengesContent';
import TeamsContent from './TeamsContent';
import ScoreboardContent from './ScoreboardContent';
import AnalyticsContent from './AnalyticsContent';
import SystemContent from './SystemContent';

interface AdminViewProps {
  activePage: string;
}

export default function AdminView({ activePage: initialPage }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState('all-users');
  const pathname = usePathname();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-primary-bg text-text-primary">
      {/* Sidebar */}
      {/* <aside className="w-64 bg-secondary-bg border-r border-border-color flex flex-col">
        <div className="flex items-center text-xl font-bold text-text-primary p-5 pb-5 border-b border-border-color mb-5">
          <div className="bg-gradient-to-r from-accent-dark to-accent-color w-9 h-9 rounded-lg flex items-center justify-center mr-3 font-bold">
            C
          </div>
          CRDF Global <span className="bg-admin-color text-white text-xs px-2 py-0.5 rounded-full ml-2">ADMIN</span>
        </div>
        
        <nav className="flex-1">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard', href: '/admin/dashboard' },
            { id: 'users', icon: Users, label: 'User Management', href: '/admin/users' },
            { id: 'challenges', icon: Target, label: 'Challenge Management', href: '/admin/challenges' },
            { id: 'teams', icon: Users, label: 'Team Management', href: '/admin/teams' },
            { id: 'scoreboard', icon: TrendingUp, label: 'Scoreboard Management', href: '/admin/scoreboard' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
            { id: 'system', icon: Settings, label: 'System Settings', href: '/admin/system' },
          ].map((item) => (
            <Link 
              href={item.href} 
              key={item.id}
              className={`flex items-center py-3 px-5 text-text-secondary hover:bg-accent-color/10 hover:text-text-primary transition-all border-l-3 ${
                pathname.includes(item.id) 
                  ? 'bg-accent-color/15 text-accent-light border-l-accent-color' 
                  : 'border-l-transparent'
              }`}
            >
              <item.icon className="mr-3 w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-5 border-t border-border-color flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center mr-3 font-bold">
            AJ
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Admin Johnson</div>
            <div className="text-xs text-text-secondary">Super Administrator</div>
          </div>
          <button className="text-text-secondary hover:text-danger-color transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside> */}
      
      {/* Main Content */}
      <main className="flex-1 p-5 overflow-y-auto">
        {initialPage === 'dashboard' && <DashboardContent />}
        {initialPage === 'users' && <UsersContent activeTab={activeTab} onTabChange={handleTabChange} />}
        {initialPage === 'challenges' && <ChallengesContent />}
        {initialPage === 'teams' && <TeamsContent />}
        {initialPage === 'scoreboard' && <ScoreboardContent />}
        {initialPage === 'analytics' && <AnalyticsContent />}
        {initialPage === 'system' && <SystemContent />}
      </main>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';

export default function TeamStatsOverview() {
  const { 
    adminDashboardStats, 
    isLoading, 
    error, 
    fetchAdminDashboardStats 
  } = useTeamsSingleton();

  useEffect(() => {
    fetchAdminDashboardStats();
  }, [fetchAdminDashboardStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }


  if (!adminDashboardStats) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <span>⚠️</span>
          <span>No stats available</span>
        </div>
      </div>
    );
  }

  const { dashboard_stats } = adminDashboardStats;

  const stats = [
    { value: dashboard_stats.total_teams.toString(), label: 'Total Teams' },
    { value: dashboard_stats.total_users.toString(), label: 'Registered Users' },
    { value: dashboard_stats.pending_requests.toString(), label: 'Pending Requests' },
    { value: `${Math.round(dashboard_stats.active_participation)}%`, label: 'Active Participation' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <div key={index} className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1 text-text-primary">{stat.value}</div>
          <div className="text-sm text-text-secondary">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

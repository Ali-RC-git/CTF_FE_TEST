"use client";

import { useEffect } from 'react';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';

export default function DashboardStats() {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 text-red-400">
          <span>⚠️</span>
          <span>Failed to load dashboard stats: {error}</span>
        </div>
      </div>
    );
  }

  if (!adminDashboardStats) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 text-yellow-400">
          <span>⚠️</span>
          <span>No dashboard stats available</span>
        </div>
      </div>
    );
  }

  const { dashboard_stats, detailed_stats, recent_activity } = adminDashboardStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Total Teams Card */}
      <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
        <div className="text-3xl font-bold mb-1 text-accent-color">
          {dashboard_stats.total_teams}
        </div>
        <div className="text-sm text-text-secondary">Total Teams</div>
        <div className="mt-2.5 text-xs flex items-center gap-1 text-success-500">
          <span>↗</span>
          <span>{recent_activity.teams_created_7_days} new this week</span>
        </div>
      </div>

      {/* Total Users Card */}
      <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
        <div className="text-3xl font-bold mb-1 text-accent-color">
          {dashboard_stats.total_users}
        </div>
        <div className="text-sm text-text-secondary">Registered Users</div>
        <div className="mt-2.5 text-xs flex items-center gap-1 text-success-500">
          <span>↗</span>
          <span>{recent_activity.users_registered_7_days} new this week</span>
        </div>
      </div>

      {/* Pending Requests Card */}
      <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
        <div className="text-3xl font-bold mb-1 text-warning-500">
          {dashboard_stats.pending_requests}
        </div>
        <div className="text-sm text-text-secondary">Pending Requests</div>
        <div className="mt-2.5 text-xs flex items-center gap-1 text-warning-500">
          <span>⏳</span>
          <span>{recent_activity.requests_created_7_days} new this week</span>
        </div>
      </div>

      {/* Active Participation Card */}
      <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
        <div className="text-3xl font-bold mb-1 text-success-500">
          {dashboard_stats.active_participation}%
        </div>
        <div className="text-sm text-text-secondary">Active Participation</div>
        <div className="mt-2.5 text-xs flex items-center gap-1 text-success-500">
          <span>📈</span>
          <span>{detailed_stats.users.active} active users</span>
        </div>
      </div>
    </div>
  );
}

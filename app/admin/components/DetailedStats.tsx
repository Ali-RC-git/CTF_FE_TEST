"use client";

import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';

export default function DetailedStats() {
  const { adminDashboardStats, isLoading, error } = useTeamsSingleton();

  if (isLoading || error || !adminDashboardStats) {
    return null;
  }

  const { detailed_stats } = adminDashboardStats;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Teams Stats */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border-default">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent-color/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Teams Overview</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Total Teams</span>
            <span className="font-semibold text-text-primary">{detailed_stats.teams.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Active Teams</span>
            <span className="font-semibold text-success-500">{detailed_stats.teams.active}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Inactive Teams</span>
            <span className="font-semibold text-warning-500">{detailed_stats.teams.inactive}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Recently Created</span>
            <span className="font-semibold text-accent-color">{detailed_stats.teams.recent_created}</span>
          </div>
        </div>
      </div>

      {/* Users Stats */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border-default">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent-color/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Users Overview</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Total Users</span>
            <span className="font-semibold text-text-primary">{detailed_stats.users.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Active Users</span>
            <span className="font-semibold text-success-500">{detailed_stats.users.active}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Students</span>
            <span className="font-semibold text-accent-color">{detailed_stats.users.students}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Instructors</span>
            <span className="font-semibold text-warning-500">{detailed_stats.users.instructors}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Admins</span>
            <span className="font-semibold text-danger-500">{detailed_stats.users.admins}</span>
          </div>
        </div>
      </div>

      {/* Requests Stats */}
      <div className="bg-background-secondary rounded-lg p-6 border border-border-default">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent-color/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Requests Overview</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Total Requests</span>
            <span className="font-semibold text-text-primary">{detailed_stats.requests.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Pending</span>
            <span className="font-semibold text-warning-500">{detailed_stats.requests.pending}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Approved</span>
            <span className="font-semibold text-success-500">{detailed_stats.requests.approved}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Rejected</span>
            <span className="font-semibold text-danger-500">{detailed_stats.requests.rejected}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

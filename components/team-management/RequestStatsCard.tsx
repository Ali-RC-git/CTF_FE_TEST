import React from 'react';
import { RequestStats } from '@/lib/api/teams';
import { BarChart3 } from 'lucide-react';

interface RequestStatsCardProps {
  stats: RequestStats | null;
  isLoading?: boolean;
  error?: string | null;
}

export const RequestStatsCard: React.FC<RequestStatsCardProps> = ({
  stats,
  isLoading = false,
  error = null
}) => {
  if (isLoading) {
    return (
      <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Request Statistics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-secondary-bg rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
            ❌
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Request Statistics</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Request Statistics</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-text-secondary">No statistics available</p>
        </div>
      </div>
    );
  }

  const { statistics } = stats;

  return (
    <div className="bg-card-bg rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white">
          📊
        </div>
        <h3 className="text-lg font-semibold text-text-primary">Request Statistics</h3>
        <span className="text-sm text-text-secondary">for {stats.team_name}</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary-bg rounded-lg p-4">
          <div className="text-sm text-text-secondary mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-text-primary">{statistics.total_requests}</div>
        </div>
        
        <div className="bg-secondary-bg rounded-lg p-4">
          <div className="text-sm text-text-secondary mb-1">Pending</div>
          <div className="text-2xl font-bold text-blue-500">{statistics.pending_requests}</div>
        </div>
        
        <div className="bg-secondary-bg rounded-lg p-4">
          <div className="text-sm text-text-secondary mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-500">{statistics.approved_requests}</div>
        </div>
        
        <div className="bg-secondary-bg rounded-lg p-4">
          <div className="text-sm text-text-secondary mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-500">{statistics.rejected_requests}</div>
        </div>
      </div>
      
      {statistics.recent_requests > 0 && (
        <div className="mt-4 pt-4 border-t border-border-color">
          <div className="text-sm text-text-secondary">
            Recent requests: <span className="font-medium text-text-primary">{statistics.recent_requests}</span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { TeamRequest } from '@/lib/api/teams';
import { RequestCard } from './RequestCard';

interface RequestListProps {
  requests: TeamRequest[];
  isLoading?: boolean;
  error?: string | null;
  onCancel?: (requestId: string) => void;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onRefresh?: () => void;
  showActions?: boolean; // For team leaders to approve/reject
  showLeaderActions?: boolean; // For team leaders to approve/reject
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  isLoading = false,
  error = null,
  onCancel,
  onApprove,
  onReject,
  onRefresh,
  showActions = false,
  showLeaderActions = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2 ml-4">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Requests</h3>
        <p className="text-text-secondary mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          {showActions ? 'No Team Requests' : 'No Requests Sent'}
        </h3>
        <p className="text-text-secondary">
          {showActions 
            ? 'No one has requested to join your teams yet.'
            : 'You haven\'t sent any team requests yet. Browse teams to send requests.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onCancel={onCancel}
          onApprove={onApprove}
          onReject={onReject}
          isLoading={isLoading}
          showActions={showActions}
          showLeaderActions={showLeaderActions}
        />
      ))}
    </div>
  );
};

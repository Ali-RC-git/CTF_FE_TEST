import React from 'react';
import { TeamRequest } from '@/lib/api/teams';

interface BulkActionsBarProps {
  selectedRequests: string[];
  requests: TeamRequest[];
  onBulkApprove: (requestIds: string[]) => void;
  onBulkReject: (requestIds: string[]) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedRequests,
  requests,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  isLoading = false
}) => {
  if (selectedRequests.length === 0) return null;

  const selectedCount = selectedRequests.length;
  const pendingCount = requests.filter(req => 
    selectedRequests.includes(req.id) && req.status === 'pending'
  ).length;

  return (
    <div className="bg-accent-color/10 border border-accent-color rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent-color w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {selectedCount}
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary">
              {selectedCount} request{selectedCount !== 1 ? 's' : ''} selected
            </h4>
            <p className="text-xs text-text-secondary">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} can be processed
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClearSelection}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-secondary-bg border border-border-color rounded-md hover:bg-primary-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
          
          {pendingCount > 0 && (
            <>
              <button
                onClick={() => onBulkApprove(selectedRequests.filter(id => 
                  requests.find(req => req.id === id)?.status === 'pending'
                ))}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Approve All
              </button>
              
              <button
                onClick={() => onBulkReject(selectedRequests.filter(id => 
                  requests.find(req => req.id === id)?.status === 'pending'
                ))}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reject All
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

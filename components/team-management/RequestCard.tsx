import React from 'react';
import { TeamRequest } from '@/lib/api/teams';

interface RequestCardProps {
  request: TeamRequest;
  onCancel?: (requestId: string) => void;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isLoading?: boolean;
  showActions?: boolean; // For team leaders to approve/reject
  showLeaderActions?: boolean; // For team leaders to approve/reject
  isSelected?: boolean;
  onSelect?: (requestId: string, selected: boolean) => void;
  showBulkSelection?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onCancel,
  onApprove,
  onReject,
  isLoading = false,
  showActions = false,
  showLeaderActions = false,
  isSelected = false,
  onSelect,
  showBulkSelection = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-blue-300 bg-blue-50';
      case 'approved':
        return 'border-green-300 bg-green-50';
      case 'rejected':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-border-color bg-secondary-bg';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '📝';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const canCancel = request.status === 'pending' && onCancel;
  const canApproveReject = request.status === 'pending' && (showActions || showLeaderActions) && onApprove && onReject;

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(request.status)} ${isSelected ? 'ring-2 ring-accent-color' : ''}`}>
      <div className="flex items-start justify-between">
        {showBulkSelection && onSelect && (
          <div className="mr-3 mt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(request.id, e.target.checked)}
              className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color focus:ring-2"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getStatusIcon(request.status)}</span>
            <h3 className="font-semibold text-text-primary">{request.team_name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              request.status === 'pending' 
                ? 'bg-blue-200 text-blue-700'
                : request.status === 'approved'
                  ? 'bg-green-200 text-green-700'
                  : 'bg-red-200 text-red-700'
            }`}>
              {getStatusText(request.status)}
            </span>
          </div>
          
          <p className="text-sm text-text-secondary mb-2">
            {showActions ? (
              <>Requested by <span className="font-medium">{request.requested_by_name}</span> ({request.requested_by_email})</>
            ) : (
              <>Your request to join</>
            )}
          </p>
          
          {request.message && (
            <p className="text-sm text-text-primary mb-3 italic">
              "{request.message}"
            </p>
          )}
          
          <div className="text-xs text-text-secondary space-y-1">
            <div>Created: {new Date(request.created_at).toLocaleDateString()}</div>
            {request.responded_at && (
              <div>Responded: {new Date(request.responded_at).toLocaleDateString()}</div>
            )}
            {request.responded_by_email && (
              <div>Responded by: {request.responded_by_email}</div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          {canCancel && (
            <button
              onClick={() => onCancel(request.id)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          
          {canApproveReject && (
            <>
              <button
                onClick={() => onApprove(request.id)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(request.id)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

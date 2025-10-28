'use client';

interface RequestItemProps {
  request: {
    id: string;
    user: string;
    email: string;
    team: string;
    message: string;
    isTeamFull?: boolean;
  };
  onApprove: () => void;
  onReject: () => void;
}

export default function RequestItem({ request, onApprove, onReject }: RequestItemProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-secondary-bg rounded-lg border border-border-color">
      <div className="flex-1">
        <div className="font-semibold text-text-primary mb-1">
          {request.user} ({request.email})
        </div>
        <div className="text-sm text-text-secondary mb-1">
          Request to join: {request.team}
        </div>
        <div className="text-sm text-text-secondary">
          "{request.message}"
        </div>
      </div>
      <div className="flex gap-2">
        {request.isTeamFull ? (
          <button 
            disabled
            className="btn-secondary btn-sm opacity-50 cursor-not-allowed"
          >
            Team Full
          </button>
        ) : (
          <button 
            onClick={onApprove}
            className="btn-primary btn-sm"
          >
            Approve
          </button>
        )}
        <button 
          onClick={onReject}
          className="btn-danger btn-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

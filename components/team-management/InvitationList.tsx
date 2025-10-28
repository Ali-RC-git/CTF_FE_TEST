import React from 'react';
import { TeamInvitation } from '@/lib/api/teams';
import { InvitationCard } from './InvitationCard';

interface InvitationListProps {
  invitations: TeamInvitation[];
  isLoading?: boolean;
  error?: string | null;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  onRefresh?: () => void;
}

export const InvitationList: React.FC<InvitationListProps> = ({
  invitations,
  isLoading = false,
  error = null,
  onAccept,
  onDecline,
  onRefresh
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
        <h3 className="text-lg font-medium text-text-primary mb-2">Error Loading Invitations</h3>
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

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No Invitations</h3>
        <p className="text-text-secondary">
          You haven't received any team invitations yet. Team leaders can invite you to join their teams.
        </p>
      </div>
    );
  }

  const handleRespond = async (invitationId: string, status: 'accepted' | 'declined') => {
    if (status === 'accepted') {
      await onAccept(invitationId);
    } else {
      await onDecline(invitationId);
    }
  };

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          onRespond={handleRespond}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

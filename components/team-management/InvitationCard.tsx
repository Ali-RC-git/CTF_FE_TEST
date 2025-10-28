/**
 * Invitation Card Component
 * Displays a single team invitation with accept/decline actions
 */

import { useState } from 'react';
import { TeamInvitation } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Users } from 'lucide-react';

interface InvitationCardProps {
  invitation: TeamInvitation;
  onRespond: (invitationId: string, status: 'accepted' | 'declined') => Promise<void>;
  isLoading?: boolean;
}

export function InvitationCard({ invitation, onRespond, isLoading = false }: InvitationCardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    action: 'accept' | 'decline';
  }>({
    isOpen: false,
    action: 'accept'
  });
  const { showSuccess, showError } = useToast();

  const handleRespond = async (action: 'accept' | 'decline') => {
    try {
      await onRespond(invitation.id, action === 'accept' ? 'accepted' : 'declined');
      showSuccess(`Invitation ${action === 'accept' ? 'accepted' : 'declined'} successfully!`);
      setShowConfirmModal({ isOpen: false, action: 'accept' });
    } catch (error) {
      showError(`Failed to ${action} invitation. Please try again.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'accepted':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'declined':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'expired':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = invitation.is_expired || new Date(invitation.expires_at) < new Date();

  return (
    <>
      <div className="bg-card-bg border border-border-color rounded-xl p-6 hover:border-accent-color/30 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{invitation.team_name}</h3>
              <p className="text-sm text-text-secondary">Invited by {invitation.invited_by}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invitation.status)}`}>
            {(invitation.status || 'pending').charAt(0).toUpperCase() + (invitation.status || 'pending').slice(1)}
          </span>
        </div>

        {/* Message */}
        {invitation.message && (
          <div className="mb-4">
            <p className="text-text-secondary text-sm bg-secondary-bg rounded-lg p-3 border border-border-color">
              "{invitation.message}"
            </p>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-text-secondary">Invited:</span>
            <span className="text-text-primary ml-2">{formatDate(invitation.created_at)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Expires:</span>
            <span className={`ml-2 ${isExpired ? 'text-red-500' : 'text-text-primary'}`}>
              {formatDate(invitation.expires_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {invitation.status === 'pending' && !isExpired && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirmModal({ isOpen: true, action: 'accept' })}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept Invitation
            </button>
            <button
              onClick={() => setShowConfirmModal({ isOpen: true, action: 'decline' })}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Decline
            </button>
          </div>
        )}

        {/* Expired or responded state */}
        {(invitation.status !== 'pending' || isExpired) && (
          <div className="text-center py-2">
            {isExpired ? (
              <span className="text-red-500 text-sm font-medium">This invitation has expired</span>
            ) : (
              <span className="text-text-secondary text-sm">
                {invitation.status === 'accepted' ? 'You accepted this invitation' : 'You declined this invitation'}
                {invitation.responded_at && (
                  <span className="ml-2">on {formatDate(invitation.responded_at)}</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal.isOpen}
        onClose={() => setShowConfirmModal({ isOpen: false, action: 'accept' })}
        onConfirm={() => handleRespond(showConfirmModal.action)}
        title={`${showConfirmModal.action === 'accept' ? 'Accept' : 'Decline'} Invitation`}
        message={`Are you sure you want to ${showConfirmModal.action} the invitation to join "${invitation.team_name}"?`}
        confirmText={showConfirmModal.action === 'accept' ? 'Accept' : 'Decline'}
        cancelText="Cancel"
        type={showConfirmModal.action === 'accept' ? 'approve' : 'reject'}
        isLoading={isLoading}
      />
    </>
  );
}
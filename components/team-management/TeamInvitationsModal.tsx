/**
 * Team Invitations Modal Component
 * Shows all invitations sent by a team and allows management
 */

import { useState, useEffect } from 'react';
import { TeamInvitation } from '@/lib/api';
import { useToast } from '@/lib/hooks/useToast';
import { SendInvitationModal } from './SendInvitationModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

interface TeamInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  invitations: TeamInvitation[];
  availableUsers: any[];
  onSendInvitation: (data: any) => Promise<void>;
  onCancelInvitation: (invitationId: string) => Promise<void>;
  onFetchAvailableUsers: (teamId: string, params?: { page?: number; search?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function TeamInvitationsModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  invitations,
  availableUsers,
  onSendInvitation,
  onCancelInvitation,
  onFetchAvailableUsers,
  isLoading = false
}: TeamInvitationsModalProps) {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<{
    isOpen: boolean;
    invitation: TeamInvitation | null;
  }>({
    isOpen: false,
    invitation: null
  });
  const { showSuccess, showError } = useToast();

  const handleCancelInvitation = async (invitation: TeamInvitation) => {
    try {
      await onCancelInvitation(invitation.id);
      showSuccess('Invitation cancelled successfully!');
      setShowCancelModal({ isOpen: false, invitation: null });
    } catch (error) {
      showError('Failed to cancel invitation. Please try again.');
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

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const otherInvitations = invitations.filter(inv => inv.status !== 'pending');

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl w-full max-w-6xl border border-border-color shadow-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-card-bg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📧</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-light">Team Invitations</h3>
                <p className="text-sm text-text-secondary">{teamName}</p>
              </div>
            </div>
            <ModalCloseButton onClick={onClose} />
          </div>

          <div className="p-6">
            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-medium text-text-primary">Manage Invitations</h4>
                <p className="text-sm text-text-secondary">
                  {invitations.length} total invitation{invitations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  onFetchAvailableUsers(teamId);
                  setShowSendModal(true);
                }}
                className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Send Invitation
              </button>
            </div>

            {/* All Invitations - Unified Table */}
            {invitations.length > 0 && (
              <div className="bg-secondary-bg border border-border-color rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-border-color/20 text-sm font-semibold text-text-secondary border-b border-border-color">
                  <div className="col-span-4 flex items-center">User</div>
                  <div className="col-span-3 flex items-center">Message</div>
                  <div className="col-span-2 flex items-center">Sent</div>
                  <div className="col-span-2 flex items-center">Status</div>
                  <div className="col-span-1 flex items-center justify-center">Actions</div>
                </div>
                
                {/* Table Rows */}
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-color/50 hover:bg-secondary-bg/50 transition-colors last:border-b-0">
                    {/* User Column */}
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-accent-dark to-accent-color rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {(invitation.invited_user_email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary text-sm truncate">{invitation.invited_user_email}</p>
                      </div>
                    </div>
                    
                    {/* Message Column */}
                    <div className="col-span-3 flex items-center">
                      <p className="text-sm text-text-secondary truncate">
                        {invitation.message || 'No message'}
                      </p>
                    </div>
                    
                    {/* Sent Column */}
                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-text-secondary">{formatDate(invitation.created_at)}</p>
                    </div>
                    
                    {/* Status Column */}
                    <div className="col-span-2 flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invitation.status)}`}>
                        {(invitation.status || 'pending').charAt(0).toUpperCase() + (invitation.status || 'pending').slice(1)}
                      </span>
                    </div>
                    
                    {/* Actions Column */}
                    <div className="col-span-1 flex items-center justify-center">
                      {invitation.status === 'pending' ? (
                        <button
                          onClick={() => setShowCancelModal({ isOpen: true, invitation })}
                          className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-red-500/10 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-text-secondary">
                          {invitation.responded_at ? formatDate(invitation.responded_at) : 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {invitations.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h5 className="text-lg font-medium text-text-primary mb-2">No Invitations Yet</h5>
                <p className="text-text-secondary mb-6">Start by sending invitations to users you'd like to join your team.</p>
                <button
                  onClick={() => setShowSendModal(true)}
                  className="bg-accent-color hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Send First Invitation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Invitation Modal */}
      <SendInvitationModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={onSendInvitation}
        teamName={teamName}
        teamId={teamId}
        availableUsers={availableUsers}
        isLoading={isLoading}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal.isOpen}
        onClose={() => setShowCancelModal({ isOpen: false, invitation: null })}
        onConfirm={() => showCancelModal.invitation && handleCancelInvitation(showCancelModal.invitation)}
        title="Cancel Invitation"
        message={`Are you sure you want to cancel the invitation to ${showCancelModal.invitation?.invited_user_email}?`}
        confirmText="Cancel Invitation"
        cancelText="Keep Invitation"
        type="delete"
        isLoading={isLoading}
      />
    </>
  );
}

"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { useToast } from '@/lib/hooks/useToast';
import { TeamRequest } from '@/lib/api/teams';

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'invitations' | 'requests'>('invitations');
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { showSuccess, showError, showLoading } = useToast();
  const { 
    invitations, 
    requests, 
    fetchUserPendingInvitations, 
    fetchRequests,
    cancelTeamRequest,
    respondToInvitation,
    cancelInvitation
  } = useTeamsSingleton();

  // Filter requests to only show pending ones
  const pendingRequests = requests?.filter(request => request.status === 'pending') || [];

  // Calculate total notifications
  useEffect(() => {
    const total = (invitations?.length || 0) + (pendingRequests?.length || 0);
    setTotalNotifications(total);
  }, [invitations, pendingRequests]);

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchUserPendingInvitations();
    fetchRequests();
  }, [fetchUserPendingInvitations, fetchRequests]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleCancelRequest = async (requestId: string) => {
    setIsCancelling(requestId);
    const loadingToast = showLoading('Cancelling request...');
    
    try {
      await cancelTeamRequest(requestId);
      showSuccess('Request cancelled successfully');
      await fetchRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      showError('Failed to cancel request. Please try again.');
    } finally {
      setIsCancelling(null);
      loadingToast();
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    setIsResponding(invitationId);
    const loadingToast = showLoading('Accepting invitation...');
    
    try {
      await respondToInvitation(invitationId, { status: 'accepted' });
      showSuccess('Invitation accepted successfully');
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      if (error?.non_field_errors) {
        showError(error.non_field_errors[0]);
      } else if (error?.message) {
        showError(error.message);
      } else {
        showError('Failed to accept invitation. Please try again.');
      }
    } finally {
      setIsResponding(null);
      loadingToast();
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    setIsResponding(invitationId);
    const loadingToast = showLoading('Declining invitation...');
    
    try {
      await cancelInvitation(invitationId);
      showSuccess('Invitation declined');
    } catch (error: any) {
      console.error('Failed to decline invitation:', error);
      if (error?.non_field_errors) {
        showError(error.non_field_errors[0]);
      } else if (error?.message) {
        showError(error.message);
      } else {
        showError('Failed to decline invitation. Please try again.');
      }
    } finally {
      setIsResponding(null);
      loadingToast();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-bg rounded-lg transition-all duration-200 hover:scale-105"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        
        {/* Notification Badge */}
        {totalNotifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {totalNotifications > 99 ? '99+' : totalNotifications}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 h-96 bg-card-bg border border-border-color rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border-color">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('invitations')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    activeTab === 'invitations'
                      ? 'bg-accent-color text-white'
                      : 'bg-secondary-bg text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Invitations {invitations.length > 0 && `(${invitations.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    activeTab === 'requests'
                      ? 'bg-accent-color text-white'
                      : 'bg-secondary-bg text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="h-80 overflow-y-auto">
            {activeTab === 'invitations' && (
              <div className="p-2">
                {invitations.length > 0 ? (
                  <div className="space-y-2">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="p-3 bg-secondary-bg rounded-lg hover:bg-border-color/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {(invitation.team_name || 'T').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-text-primary truncate">
                                Invitation to join {invitation.team_name}
                              </p>
                              <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                                {formatDate(invitation.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary mb-2">
                              From {invitation.invited_by_email}
                            </p>
                            {invitation.message && (
                              <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                                "{invitation.message}"
                              </p>
                            )}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptInvitation(invitation.id)}
                                disabled={isResponding === invitation.id}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isResponding === invitation.id ? 'Accepting...' : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleDeclineInvitation(invitation.id)}
                                disabled={isResponding === invitation.id}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isResponding === invitation.id ? 'Declining...' : 'Decline'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-text-secondary">No pending invitations</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="p-2">
                {pendingRequests.length > 0 ? (
                  <div className="space-y-2">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="p-3 bg-secondary-bg rounded-lg hover:bg-border-color/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {(request.team_name || 'T').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-text-primary truncate">
                                Request to {request.team_name}
                              </p>
                              <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                                {formatDate(request.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                {(request.status || 'pending').charAt(0).toUpperCase() + (request.status || 'pending').slice(1)}
                              </span>
                              {request.status === 'pending' && (
                                <button
                                  onClick={() => handleCancelRequest(request.id)}
                                  disabled={isCancelling === request.id}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isCancelling === request.id ? 'Cancelling...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-text-secondary">No pending requests</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

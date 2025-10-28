/**
 * Send Invitation Modal Component
 * Allows team leaders to send invitations to users
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/lib/hooks/useToast';
import { useEventRegisteredUsers, EventRegisteredUser } from '@/lib/hooks/useEventRegisteredUsers';
import { SendInvitationRequest } from '@/lib/api';

// Form data interface (without email, as we add it dynamically for each user)
interface SendInvitationFormData {
  message: string;
  expires_at: string;
}
import ModalCloseButton from '@/components/ui/ModalCloseButton';

const sendInvitationSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
  expires_at: z.string().min(1, 'Expiration date is required')
});


interface SendInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: SendInvitationRequest) => Promise<void>;
  teamName: string;
  teamId: string;
  eventCode?: string;
  availableUsers?: any[]; 
  isLoading?: boolean;
}

export function SendInvitationModal({ 
  isOpen, 
  onClose, 
  onSend, 
  teamName, 
  teamId,
  eventCode = '',
  availableUsers = [],
  isLoading = false 
}: SendInvitationModalProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(true); 
  const [selectedUsers, setSelectedUsers] = useState<EventRegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { showError } = useToast();
  
  // Event registered users hook
  const { 
    users: eventRegisteredUsers, 
    isLoading: isLoadingUsers, 
    error: usersError, 
    fetchRegisteredUsers 
  } = useEventRegisteredUsers();

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setShowUserSelector(true);
      setSelectedUsers([]);
      setHasChanges(false);
      if (eventCode && eventCode.trim() !== '') {
        fetchRegisteredUsers(eventCode);
      } else {
        showError('Event code is required to fetch participants');
      }
    }
  }, [isOpen, eventCode]);

  // Filter users based on search term
  const filteredUsers = Array.isArray(eventRegisteredUsers) 
    ? eventRegisteredUsers.filter(user => {
        if (!searchTerm.trim()) return true;
        
        const term = searchTerm.toLowerCase();
        return (
          user.first_name.toLowerCase().includes(term) ||
          user.last_name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          user.profile?.institution?.toLowerCase().includes(term) ||
          user.profile?.department?.toLowerCase().includes(term) ||
          user.profile?.student_id?.toLowerCase().includes(term)
        );
      })
    : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<SendInvitationFormData>({
    resolver: zodResolver(sendInvitationSchema),
    defaultValues: {
      message: `Hi! You're invited to join the team "${teamName}". We'd love to have you on board!`,
      expires_at: ''
    }
  });

  const watchedFields = watch();

  // Track changes
  React.useEffect(() => {
    const hasFormChanges = watchedFields.message || watchedFields.expires_at;
    setHasChanges(!!hasFormChanges);
  }, [watchedFields]);

  const handleUserSelect = (user: EventRegisteredUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        // Remove user if already selected
        return prev.filter(u => u.id !== user.id);
      } else {
        // Add user if not selected
        return [...prev, user];
      }
    });
    setHasChanges(true);
  };

  const isUserSelected = (user: EventRegisteredUser) => {
    return selectedUsers.some(u => u.id === user.id);
  };

  const onSubmit = async (data: SendInvitationFormData) => {
    try {
      // Send invitation to each selected user
      for (const user of selectedUsers) {
        const invitationData: SendInvitationRequest = {
          ...data,
          invited_user_email: user.email
        };
        await onSend(invitationData);
      }
      reset();
      setHasChanges(false);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('Do you want to discard the changes?')) {
        reset();
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, hasChanges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {showUserSelector ? (
        <div className="bg-card-bg rounded-xl w-full max-w-4xl border border-border-color shadow-lg max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border-color">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-light">Select Event Participant</h3>
                <p className="text-sm text-text-secondary">Choose from users registered for this event</p>
              </div>
            </div>
            <ModalCloseButton onClick={onClose} />
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-border-color">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, username, institution, or student ID..."
                className="w-full px-4 py-3 pl-10 bg-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent transition-all duration-200"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
                <p className="text-text-secondary mt-4">Loading participants...</p>
              </div>
            ) : usersError ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h4 className="text-lg font-medium text-text-primary mb-2">Error Loading Participants</h4>
                <p className="text-text-secondary">{usersError}</p>
                <button
                  onClick={() => fetchRegisteredUsers(eventCode)}
                  className="mt-4 px-4 py-2 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-text-secondary">
                    {filteredUsers.length} of {eventRegisteredUsers?.length || 0} participant{(eventRegisteredUsers?.length || 0) !== 1 ? 's' : ''}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-sm text-accent-color hover:text-accent-dark"
                    >
                      Clear search
                    </button>
                  )}
                </div>
                
                {/* Professional Table Layout */}
                <div className="bg-secondary-bg rounded-lg border border-border-color overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-primary-bg border-b border-border-color">
                        <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers);
                        } else {
                          setSelectedUsers([]);
                        }
                        setHasChanges(true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color focus:ring-2"
                    />
                  </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">User</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Joined</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color">
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className={`hover:bg-secondary-bg/50 transition-colors duration-200 cursor-pointer ${
                              isUserSelected(user) ? 'bg-accent-color/5' : ''
                            }`}
                          >
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={isUserSelected(user)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleUserSelect(user);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color focus:ring-2"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-accent-dark to-accent-color rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-text-primary">{user.full_name}</div>
                                  <div className="text-sm text-text-secondary">@{user.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-text-primary">{user.email}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-text-secondary">
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-text-secondary">
                                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="text-lg font-medium text-text-primary mb-2">
                  {searchTerm ? 'No Participants Found' : 'No Event Participants'}
                </h4>
                <p className="text-text-secondary">
                  {searchTerm 
                    ? `No participants match "${searchTerm}"` 
                    : 'No participants have registered for this event yet'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-sm text-accent-color hover:text-accent-dark"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border-color">
            <div className="flex justify-between items-center">
              <div className="text-sm text-text-secondary">
                {eventRegisteredUsers?.length || 0 > 0 && (
                  <span>
                    {filteredUsers.length} of {eventRegisteredUsers?.length || 0} participant{(eventRegisteredUsers?.length || 0) !== 1 ? 's' : ''} shown
                    {selectedUsers.length > 0 && (
                      <span className="ml-2 text-accent-color font-medium">
                        • {selectedUsers.length} selected
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-secondary-bg text-text-primary border border-border-color rounded-lg hover:bg-border-color hover:border-accent-color transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                {selectedUsers.length > 0 && (
                  <button
                    onClick={() => setShowUserSelector(false)}
                    className="px-6 py-2 bg-accent-color hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
                  >
                    Proceed ({selectedUsers.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card-bg rounded-xl w-full max-w-2xl border border-border-color shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border-color">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📧</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-light">Send Invitation{selectedUsers.length > 1 ? 's' : ''}</h3>
                <p className="text-sm text-text-secondary">
                  {selectedUsers.length > 0 
                    ? `Invite ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} to join ${teamName}`
                    : `Invite users to join ${teamName}`
                  }
                </p>
              </div>
            </div>
            <ModalCloseButton onClick={handleClose} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Selected Users Display */}
          {selectedUsers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
                Selected Users ({selectedUsers.length})
            </label>
              <div className="space-y-2 max-h-32 overflow-y-auto  px-2 py-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="p-3 bg-accent-color/10 border border-accent-color/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-accent-color rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {(user.first_name || 'U').charAt(0)}{(user.last_name || 'U').charAt(0)}
                  </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                  </div>
                  <button
                    type="button"
                        onClick={() => handleUserSelect(user)}
                        className="text-red-500 hover:text-red-700 text-sm"
                  >
                        Remove
                  </button>
                </div>
              </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Message *
            </label>
            <textarea
              {...register('message')}
              rows={4}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Write a personal message to invite them..."
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>

          {/* Expiration Date (Required) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Expiration Date *
            </label>
            <input
              type="datetime-local"
              {...register('expires_at')}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-text-secondary mt-1">
              Select when this invitation should expire
            </p>
            {errors.expires_at && (
              <p className="text-red-500 text-xs mt-1">{errors.expires_at.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-secondary-bg text-text-primary border border-border-color rounded-lg hover:bg-border-color hover:border-accent-color transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowUserSelector(true)}
              className="flex-1 px-4 py-3 bg-secondary-bg text-text-primary border border-border-color rounded-lg hover:bg-border-color hover:border-accent-color transition-all duration-200 font-medium"
            >
              Back to Users
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedUsers.length === 0}
              className="flex-1 bg-accent-color hover:bg-accent-dark text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : `Send Invitation${selectedUsers.length > 1 ? `s (${selectedUsers.length})` : ''}`}
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
}

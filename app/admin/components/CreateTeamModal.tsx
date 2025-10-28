'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTeamData, createTeamSchema } from '@/lib/validation';
import { useTeams } from '@/lib/hooks/useTeams';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { useToast } from '@/lib/hooks/useToast';
import { APIError, teamsAPI } from '@/lib/api';
import { useFormErrors } from '@/lib/hooks/useFormErrors';
import ModalCloseButton from '@/components/ui/ModalCloseButton';
import ConfirmationModal from './ConfirmationModal';
import { Users } from 'lucide-react';
import { handleTeamCreationError } from '@/lib/utils/errorHandlers';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamData: any) => void;
}

export default function CreateTeamModal({ isOpen, onClose, onSave }: CreateTeamModalProps) {
  const { createTeam, isLoading, error } = useTeams();
  const { users, isLoading: usersLoading, fetchUsers } = useUserManagement();
  const { showError } = useToast();
  
  // State for event-specific users
  const [eventUsers, setEventUsers] = useState<any[]>([]);
  const [isLoadingEventUsers, setIsLoadingEventUsers] = useState(false);
  const [eventUsersError, setEventUsersError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CreateTeamData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      max_size: 4,
      min_size: 1,
      is_invite_only: false,
      event_code: ''
    }
  });
  
  const { setError, clearErrors, getFieldError, getGeneralError } = useFormErrors();
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedCaptain, setSelectedCaptain] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Watch event code changes
  const eventCode = watch('event_code');
  
  // Function to fetch users for the specific event
  const fetchEventUsers = async (eventCode: string) => {
    if (!eventCode || eventCode.trim() === '') {
      setEventUsers([]);
      return;
    }
    
    setIsLoadingEventUsers(true);
    setEventUsersError(null);
    
    try {
      const users = await teamsAPI.getEventAvailableUsers(eventCode);
      setEventUsers(users);
    } catch (error) {
      console.error('Error fetching event users:', error);
      setEventUsersError('Failed to load users for this event');
      setEventUsers([]);
    } finally {
      setIsLoadingEventUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasChanges(false);
      clearErrors();
      setSelectedMembers([]);
      setSelectedCaptain('');
      setEventUsers([]);
      setEventUsersError(null);
      reset();
    }
  }, [isOpen, reset, clearErrors]);

  // Watch for event code changes and fetch users
  useEffect(() => {
    if (eventCode && eventCode.trim() !== '') {
      // Debounce the API call
      const timeoutId = setTimeout(() => {
        fetchEventUsers(eventCode);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setEventUsers([]);
    }
  }, [eventCode]);


  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (hasChanges) {
          if (confirm('Do you want to discard the changes?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, hasChanges, onClose]);

  const onSubmit = async (data: CreateTeamData) => {
    clearErrors();
    
    try {
      // Get captain email from selected captain
      const captainUser = eventUsers.find(user => user.id === selectedCaptain);
      const captainEmail = captainUser?.email || undefined;
      
      // Get member emails from selected members (excluding captain)
      const memberEmails = selectedMembers
        .filter(memberId => memberId !== selectedCaptain)
        .map(memberId => {
          const member = eventUsers.find(user => user.id === memberId);
          return member?.email;
        })
        .filter(email => email); // Remove undefined values
      
      // Prepare the team data with captain and member emails
      const teamData = {
        name: data.name,
        description: data.description || '',
        max_size: data.max_size,
        min_size: data.min_size,
        is_invite_only: data.is_invite_only,
        event_code: data.event_code,
        captain_email: captainEmail,
        member_emails: memberEmails
      };
      
      console.log('Creating team with data:', teamData);
      const newTeam = await createTeam(teamData);
      console.log('Team created successfully:', newTeam);
      
      // Show success feedback
      onSave(newTeam);
      
      // Close modal immediately to show the refreshed table
      onClose();
    } catch (error) {
      console.error('Team creation error:', error);
      handleTeamCreationError(error, { 
        showError,
        fallbackMessage: 'Failed to create team. Please try again.'
      });
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" 
      style={{ 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backdropFilter: 'blur(4px)', 
        WebkitBackdropFilter: 'blur(4px)',
        position: 'fixed',
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="bg-card-bg rounded-xl w-full max-w-2xl border border-border-color shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-gradient-to-r from-card-bg to-accent-color/5 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-color to-accent-dark rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-accent-light">Create New Team</h3>
              <p className="text-sm text-text-secondary mt-1">Add team members and assign a captain</p>
            </div>
          </div>
          <ModalCloseButton onClick={handleClose} />
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Team Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name", {
                onChange: () => setHasChanges(true)
              })}
              placeholder="Enter team name"
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all duration-200"
            />
            {(errors.name || getFieldError("name")) && (
              <p className="text-red-500 text-sm mt-1">{errors.name?.message || getFieldError("name")}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Team Description
            </label>
            <textarea
              {...register("description", {
                onChange: () => setHasChanges(true)
              })}
              placeholder="Describe the team's focus or expertise"
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all duration-200 min-h-[100px] resize-none"
            />
            {(errors.description || getFieldError("description")) && (
              <p className="text-red-500 text-sm mt-1">{errors.description?.message || getFieldError("description")}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Event Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("event_code", {
                onChange: () => setHasChanges(true)
              })}
              placeholder="Enter event code (e.g., TES-2025-001)"
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all duration-200"
            />
            {(errors.event_code || getFieldError("event_code")) && (
              <p className="text-red-500 text-sm mt-1">{errors.event_code?.message || getFieldError("event_code")}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Team Members
            </label>
            <p className="text-xs text-text-secondary mb-3">
              {eventCode ? 
                `Select team members from users registered for event "${eventCode}" (not in any team). Only one captain can be selected.` : 
                "Enter an event code to see available users"
              }
            </p>
            
            {!eventCode && (
              <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-secondary-bg to-accent-color/5 border border-border-color rounded-xl">
                <div className="w-16 h-16 bg-accent-color/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-accent-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-text-primary font-medium text-center">Enter Event Code to Continue</p>
                <p className="text-text-secondary text-sm text-center mt-1">Type an event code above to see available team members</p>
                <div className="mt-4 px-4 py-2 bg-accent-color/10 rounded-lg">
                  <p className="text-accent-color text-xs text-center">
                    💡 Only users registered for the event and not in any team will be shown
                  </p>
                </div>
              </div>
            )}
            
            {eventCode && isLoadingEventUsers && (
              <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-secondary-bg to-accent-color/5 rounded-xl border border-border-color">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-color/20"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-color border-t-transparent absolute top-0 left-0"></div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-text-primary font-medium">Loading users for event</p>
                  <p className="text-text-secondary text-sm mt-1">Finding available team members...</p>
                </div>
              </div>
            )}
            
            {eventCode && eventUsersError && !isLoadingEventUsers && (
              <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium text-center">{eventUsersError}</p>
                <p className="text-red-500 dark:text-red-500 text-sm text-center mt-1">Please try again or check the event code</p>
              </div>
            )}
            
            {eventCode && !isLoadingEventUsers && !eventUsersError && eventUsers && eventUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium text-center">No available users found</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm text-center mt-1">All registered users may already be in teams</p>
                <div className="mt-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs text-center">
                    💡 Users in active teams are excluded from this list
                  </p>
                </div>
              </div>
            )}
            
            {eventCode && !isLoadingEventUsers && !eventUsersError && eventUsers && eventUsers.length > 0 && (
              <div className="max-h-64 overflow-y-auto border border-border-color rounded-lg bg-secondary-bg p-4 space-y-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-color">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-text-primary">
                      {eventUsers.length} Available User{eventUsers.length !== 1 ? 's' : ''}
                    </span>
                    {selectedCaptain && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-color/10 text-accent-color border border-accent-color/20">
                        👑 Captain Selected
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Registered for event • Not in any team • One captain only
                  </div>
                </div>
                {eventUsers?.map((user, index) => (
                  <label key={user.id} className={`flex items-center space-x-4 cursor-pointer hover:bg-accent-color/10 p-4 rounded-xl transition-all duration-200 group border-2 border-transparent hover:border-accent-color/20 ${
                    selectedCaptain === user.id
                      ? 'bg-accent-color/10 border-accent-color/50 shadow-lg' 
                      : selectedMembers.includes(user.id)
                        ? 'bg-accent-color/5 border-accent-color/30'
                        : 'hover:bg-accent-color/5'
                  }`}>
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.id) || selectedCaptain === user.id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers(prev => [...prev, user.id]);
                          } else {
                            setSelectedMembers(prev => prev.filter(id => id !== user.id));
                            if (selectedCaptain === user.id) {
                              setSelectedCaptain('');
                            }
                          }
                          setHasChanges(true);
                        }}
                        className="w-5 h-5 text-accent-color bg-secondary-bg border-2 border-border-color rounded-md focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-card-bg transition-all duration-200"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-color to-accent-dark rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                          {user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-text-primary truncate">{user.full_name}</p>
                            {selectedCaptain === user.id && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-color text-white">
                                👑 Captain
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-1">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              ✓ Available
                            </span>
                            <span className="text-xs text-text-secondary">•</span>
                            <span className="text-xs text-text-secondary">Role: {user.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="captain"
                          checked={selectedCaptain === user.id}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Clear any previous captain selection
                              setSelectedCaptain(user.id);
                              // Automatically add as member if not already selected
                              if (!selectedMembers.includes(user.id)) {
                                setSelectedMembers(prev => [...prev, user.id]);
                              }
                            }
                            setHasChanges(true);
                          }}
                          className="w-4 h-4 text-accent-color bg-secondary-bg border-2 border-border-color focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-card-bg"
                        />
                        <span className="text-xs text-accent-color font-medium">Captain</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {/* Selection Summary */}
            {eventCode && eventUsers && eventUsers.length > 0 && (selectedMembers.length > 0 || selectedCaptain) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-accent-color/5 to-accent-color/10 border border-accent-color/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-color rounded-full"></div>
                      <span className="text-sm font-medium text-text-primary">
                        {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''} Selected
                      </span>
                    </div>
                    {selectedCaptain && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium text-text-primary">
                          Captain: {eventUsers.find(u => u.id === selectedCaptain)?.full_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {selectedCaptain ? 'Ready to create team' : 'Select a captain to continue'}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Maximum Members
              </label>
              <select
                {...register("max_size", { 
                  valueAsNumber: true,
                  onChange: () => setHasChanges(true)
                })}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value={4}>4 members</option>
                <option value={5}>5 members</option>
                <option value={6}>6 members</option>
                <option value={8}>8 members</option>
              </select>
              {(errors.max_size || getFieldError("max_size")) && (
                <p className="text-red-500 text-sm mt-1">{errors.max_size?.message || getFieldError("max_size")}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Team Visibility
              </label>
              <select
                {...register("is_invite_only", {
                  onChange: () => setHasChanges(true)
                })}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="false">Public (Anyone can join)</option>
                <option value="true">Private (Invite only)</option>
              </select>
              {(errors.is_invite_only || getFieldError("is_invite_only")) && (
                <p className="text-red-500 text-sm mt-1">{errors.is_invite_only?.message || getFieldError("is_invite_only")}</p>
              )}
            </div>
          </div>
          
          
          <div className="flex justify-end gap-4 pt-6 border-t border-border-color">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-accent-color to-accent-dark text-white rounded-xl hover:from-accent-dark hover:to-accent-color transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating Team...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Team
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-4 bg-secondary-bg text-text-primary border-2 border-border-color rounded-xl hover:bg-accent-color/10 hover:border-accent-color transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmClose}
        title="Discard Changes"
        message="Are you sure you want to discard the changes? This action cannot be undone."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="warning"
      />
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamInvitation, TeamRequest } from '@/lib/api/teams';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { useToast } from '@/lib/hooks/useToast';
import { useFormErrors } from '@/lib/hooks/useFormErrors';
import { UpdateTeamData, updateTeamSchema } from '@/lib/validation';
import { APIError } from '@/lib/api';
import { TeamDetailsView } from './TeamDetailsView';
import { SendInvitationModal } from './SendInvitationModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';


interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export function TeamManagementModal({ isOpen, onClose, teamId, teamName }: TeamManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'requests' | 'invitations'>('details');
  const [showSendInvitationModal, setShowSendInvitationModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'cancel-invitation' | 'remove-member' | 'close-with-changes';
    requestId: string;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    type: 'approve',
    requestId: '',
    userId: '',
    userName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    teamDetails, 
    teamRequests, 
    invitations,
    isLoading, 
    error,
    fetchTeamDetails,
    fetchTeamRequests,
    fetchTeamInvitations,
    fetchPendingTeamInvitations,
    fetchAvailableUsers,
    sendInvitation,
    cancelInvitation,
    respondToRequest,
    removeTeamMember,
    updateTeam,
    refreshData
  } = useTeamsSingleton();
  const { showSuccess, showError, showLoading } = useToast();
  const { clearErrors, setError, getGeneralError } = useFormErrors();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<UpdateTeamData>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      max_size: 4,
      min_size: 1,
      is_invite_only: false,
      status: 'active'
    }
  });

  // Watch for form changes
  const watchedFields = watch();

  // Get team data
  const team = teamDetails?.[teamId];
  const requests = teamRequests?.[teamId] || [];
  const teamInvitations = invitations?.filter(inv => inv.team === teamId) || [];
  const teamAvailableUsers: any[] = []; // availableUsers not available in hook

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamDetails(teamId);
      fetchTeamRequests(teamId);
      fetchPendingTeamInvitations(teamId); // Only fetch pending invitations
    }
  }, [isOpen, teamId, fetchTeamDetails, fetchTeamRequests, fetchPendingTeamInvitations]);

  // Reset form when team details are loaded or updated
  useEffect(() => {
    if (team && isOpen) {
      reset({
        name: team.name || '',
        description: team.description || '',
        max_size: team.max_size || 4,
        min_size: team.min_size || 1,
        is_invite_only: team.is_invite_only || false,
        status: team.status === 'suspended' ? 'inactive' : (team.status || 'active'),
        leader: team.leader || '',
        event: ''
      });
    }
  }, [team, isOpen, reset, team?.name, team?.description, team?.max_size, team?.min_size, team?.is_invite_only, team?.status, team?.leader]);

  // Check for changes
  useEffect(() => {
    if (team && isOpen && isEditing) {
      const hasFormChanges = 
        watchedFields.name !== (team.name || '') ||
        watchedFields.description !== (team.description || '') ||
        watchedFields.max_size !== (team.max_size || 4) ||
        watchedFields.min_size !== (team.min_size || 1) ||
        watchedFields.is_invite_only !== (team.is_invite_only || false) ||
        watchedFields.status !== (team.status || 'active') ||
        watchedFields.leader !== (team.leader || '') ||
        watchedFields.event !== '';
      
      setHasChanges(hasFormChanges);
    }
  }, [watchedFields, team, isOpen, isEditing]);

  const handleApproveRequest = (requestId: string, userName: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'approve',
      requestId,
      userId: '',
      userName
    });
  };

  const handleRejectRequest = (requestId: string, userName: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'reject',
      requestId,
      userId: '',
      userName
    });
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'remove-member',
      requestId: '',
      userId,
      userName
    });
  };

  const handleConfirmAction = async () => {
    const { type, requestId, userId, userName } = confirmationModal;
    setIsProcessing(true);
    
    if (type === 'cancel-invitation') {
      const loadingToast = showLoading('Cancelling invitation...');
      try {
        await cancelInvitation(requestId);
        showSuccess('Invitation cancelled successfully!');
        await fetchPendingTeamInvitations(teamId); // Refresh invitations
        setConfirmationModal({ isOpen: false, type: 'approve', requestId: '', userId: '', userName: '' });
      } catch (error) {
        showError('Failed to cancel invitation. Please try again.');
      } finally {
        setIsProcessing(false);
        loadingToast();
      }
    } else if (type === 'remove-member') {
      const loadingToast = showLoading('Removing team member...');
      try {
        await removeTeamMember(teamId, userId);
        showSuccess('Team member removed successfully!');
        await fetchTeamDetails(teamId); // Refresh team details
        setConfirmationModal({ isOpen: false, type: 'approve', requestId: '', userId: '', userName: '' });
      } catch (error) {
        showError('Failed to remove team member. Please try again.');
      } finally {
        setIsProcessing(false);
        loadingToast();
      }
    } else if (type === 'close-with-changes') {
      setIsEditing(false);
      setHasChanges(false);
      onClose();
      setConfirmationModal({ isOpen: false, type: 'approve', requestId: '', userId: '', userName: '' });
    } else {
      const loadingToast = showLoading(`${type === 'approve' ? 'Approving' : 'Rejecting'} request...`);
      try {
        await respondToRequest(requestId, type === 'approve' ? 'approved' : 'rejected');
        showSuccess(`Request ${type === 'approve' ? 'approved' : 'rejected'} successfully!`);
        await fetchTeamRequests(teamId); // Refresh requests
        await refreshData(); // Refresh overall data
        setConfirmationModal({ isOpen: false, type: 'approve', requestId: '', userId: '', userName: '' });
      } catch (error) {
        showError(`Failed to ${type} request. Please try again.`);
      } finally {
        setIsProcessing(false);
        loadingToast();
      }
    }
  };

  const onSubmit = async (data: UpdateTeamData) => {
    if (!team) return;
    
    clearErrors();
    try {
      const teamData = {
        name: data.name,
        description: data.description || '',
        max_size: data.max_size,
        min_size: data.min_size,
        is_invite_only: data.is_invite_only,
        status: data.status,
        leader: data.leader || undefined,
        event: data.event || undefined
      };
      
      await updateTeam(teamId, teamData);
      showSuccess('Team updated successfully');
      
      // Exit edit mode - form will reset automatically when team data updates
      setIsEditing(false);
      setHasChanges(false);
      
    } catch (error) {
      console.error('Team update error:', error);
      
      if (error instanceof APIError) {
        if (error.status === 404) {
          setError('Team not found. It may have been deleted.');
        } else if (error.status === 400) {
          setError(error.message || 'Invalid team data. Please check your inputs.');
        } else if (error.status === 403) {
          setError('You do not have permission to update this team.');
        } else {
          setError(error.message || 'Failed to update team. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setConfirmationModal({
        isOpen: true,
        type: 'close-with-changes',
        requestId: '',
        userId: '',
        userName: ''
      });
    } else {
      onClose();
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({ isOpen: false, type: 'approve', requestId: '', userId: '', userName: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color bg-gradient-to-r from-secondary-bg to-primary-bg">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-accent-color to-accent-dark w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Manage Team</h2>
              <p className="text-sm text-text-secondary font-medium">{teamName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-bg rounded-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-color bg-secondary-bg/30">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 relative ${
              activeTab === 'details'
                ? 'text-accent-color bg-accent-color/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Team Details
            </span>
            {activeTab === 'details' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-color to-accent-dark"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 relative ${
              activeTab === 'requests'
                ? 'text-accent-color bg-accent-color/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Join Requests
              <span className="bg-accent-color text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            </span>
            {activeTab === 'requests' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-color to-accent-dark"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 relative ${
              activeTab === 'invitations'
                ? 'text-accent-color bg-accent-color/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Invitations
              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {teamInvitations.filter(i => i.status === 'pending').length}
              </span>
            </span>
            {activeTab === 'invitations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-color to-accent-dark"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Messages */}
              {(error || getGeneralError()) && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error || getGeneralError()}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
                  <span className="ml-3 text-text-secondary">Loading team details...</span>
                </div>
              ) : team ? (
                <>
                  {/* Team Basic Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                          Team Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            {...register('name')}
                            className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                            placeholder="Enter team name"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary font-medium">
                            {team.name || 'Unknown Team'}
                          </div>
                        )}
                        {errors.name && (
                          <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                          Description
                        </label>
                        {isEditing ? (
                          <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                            placeholder="Enter team description"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary min-h-[60px]">
                            {team.description || 'No description provided'}
                          </div>
                        )}
                        {errors.description && (
                          <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                          Status
                        </label>
                        {isEditing ? (
                          <select
                            {...register('status')}
                            className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                          >
                            <option value="active">Active - Team is active and available for members to join</option>
                            <option value="inactive">Inactive - Team is temporarily disabled but not deleted</option>
                            <option value="disbanded">Disbanded - Team has been permanently disbanded</option>
                            <option value="pending">Pending - Team is awaiting approval or setup</option>
                          </select>
                        ) : (
                          <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              team.status === 'active' 
                                ? 'bg-green-500/20 text-green-600' 
                                : team.status === 'inactive'
                                ? 'bg-yellow-500/20 text-yellow-600'
                                : team.status === 'suspended'
                                ? 'bg-red-500/20 text-red-600'
                                : 'bg-blue-500/20 text-blue-600'
                            }`}>
                              {team.status ? team.status.charAt(0).toUpperCase() + team.status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        )}
                        {errors.status && (
                          <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                          Team Size
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {isEditing ? (
                            <>
                              <div>
                                <input
                                  type="number"
                                  {...register('min_size', { valueAsNumber: true })}
                                  min="1"
                                  max="10"
                                  className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                                  placeholder="Min"
                                />
                                <p className="text-xs text-text-secondary mt-1">Min Size</p>
                              </div>
                              <div>
                                <input
                                  type="number"
                                  {...register('max_size', { valueAsNumber: true })}
                                  min="1"
                                  max="10"
                                  className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                                  placeholder="Max"
                                />
                                <p className="text-xs text-text-secondary mt-1">Max Size</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-center">
                                <div className="text-lg font-bold text-text-primary">{team.current_size || 0}</div>
                                <div className="text-xs text-text-secondary">CURRENT</div>
                              </div>
                              <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-center">
                                <div className="text-lg font-bold text-text-primary">{team.max_size || 0}</div>
                                <div className="text-xs text-text-secondary">MAX</div>
                              </div>
                            </>
                          )}
                        </div>
                        {errors.min_size && (
                          <p className="text-red-400 text-xs mt-1">{errors.min_size.message}</p>
                        )}
                        {errors.max_size && (
                          <p className="text-red-400 text-xs mt-1">{errors.max_size.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team Leader */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Team Leader
                    </label>
                    {isEditing ? (
                      <select
                        {...register('leader')}
                        className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent"
                      >
                        <option value="">Select a leader</option>
                        {team?.members?.map((member: any) => (
                          <option key={member.id} value={member.user.id}>
                            {member.user.full_name} ({member.user.email}) - {member.role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-3 py-2 bg-secondary-bg border border-border-color rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {team.leader_name?.charAt(0) || 'L'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{team.leader_name || 'No Leader'}</div>
                            <div className="text-xs text-text-secondary">ID: {team.leader || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {errors.leader && (
                      <p className="text-red-400 text-xs mt-1">{errors.leader.message}</p>
                    )}
                  </div>

                  {/* Team Members */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Team Members ({team.members?.length || 0})
                    </label>
                    <div className="space-y-2">
                      {team.members?.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-secondary-bg border border-border-color rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {member.user.first_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">
                                {member.user.full_name}
                                {member.is_leader && (
                                  <span className="ml-2 px-2 py-1 bg-accent-color/20 text-accent-color text-xs rounded-full">
                                    Leader
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-secondary">{member.user.username}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === 'active' 
                                ? 'bg-green-500/20 text-green-600' 
                                : 'bg-red-500/20 text-red-600'
                            }`}>
                              {member.status}
                            </span>
                            {isEditing && !member.is_leader && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.user.id, member.user.full_name)}
                                className="px-2 py-1 text-red-400 hover:text-red-300 text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invite Code */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Invite Code
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded-md font-mono text-text-primary">
                        {team.invite_code || 'N/A'}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(team.invite_code || '')}
                        className="px-3 py-2 bg-accent-color text-white rounded-md hover:bg-accent-dark transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Invite Only Setting */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_invite_only')}
                      disabled={!isEditing}
                      className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label className="ml-2 text-sm text-text-primary">
                      Invite Only Team
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-border-color">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 text-text-secondary bg-secondary-bg border border-border-color rounded-lg hover:bg-primary-bg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-3 bg-gradient-to-r from-accent-dark to-accent-color text-white rounded-lg hover:from-accent-color hover:to-accent-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Updating...
                            </>
                          ) : (
                            'Update Team'
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-accent-color text-white rounded-lg hover:bg-accent-dark transition-colors"
                      >
                        Edit Team
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  Failed to load team details.
                </div>
              )}
            </form>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-text-secondary">
                  Loading requests...
                </div>
              ) : requests.length > 0 ? (
                requests.map(request => (
                  <div key={request.id} className="bg-gradient-to-r from-secondary-bg to-secondary-bg/80 rounded-2xl p-6 border border-border-color/20 hover:border-accent-color/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent-color/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="font-bold text-xl text-text-primary mb-1">
                            {request.requested_by_name || request.requested_by_email}
                          </h3>
                          <div className="text-sm text-text-secondary">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                              {request.requested_by_email}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-text-secondary space-y-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span><strong>Requested:</strong> {new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                          {request.message && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <strong>Message:</strong>
                              </div>
                              <p className="text-text-primary p-3 bg-primary-bg/50 rounded-xl border-l-4 border-accent-color/50 backdrop-blur-sm">
                                {request.message}
                              </p>
                            </div>
                          )}
                          {request.responded_at && (
                            <div className="flex items-center gap-2 text-xs text-text-secondary/80">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span><strong>Responded:</strong> {new Date(request.responded_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          request.status === 'pending' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          request.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {(request.status || 'pending').charAt(0).toUpperCase() + (request.status || 'pending').slice(1)}
                        </span>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(request.id, request.requested_by_name || request.requested_by_email)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id, request.requested_by_name || request.requested_by_email)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <div className="text-lg mb-2">📭 No requests</div>
                  <div className="text-sm">No join requests for this team yet.</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Team Invitations</h3>
                  <p className="text-sm text-text-secondary">
                    {teamInvitations.length} total invitation{teamInvitations.length !== 1 ? 's' : ''}
                  </p>
                </div>
                 <button
                   onClick={() => {
                     setShowSendInvitationModal(true);
                   }}
                   className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                 >
                   Send Invitation
                 </button>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-text-secondary">
                  Loading invitations...
                </div>
              ) : teamInvitations.length > 0 ? (
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
                  {teamInvitations.map((invitation) => (
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
                        <p className="text-sm text-text-secondary">{new Date(invitation.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                      {/* Status Column */}
                      <div className="col-span-2 flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          invitation.status === 'pending' 
                            ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                            : invitation.status === 'accepted'
                            ? 'text-green-500 bg-green-500/10 border-green-500/20'
                            : invitation.status === 'declined'
                            ? 'text-red-500 bg-red-500/10 border-red-500/20'
                            : 'text-gray-500 bg-gray-500/10 border-gray-500/20'
                        }`}>
                          {(invitation.status || 'pending').charAt(0).toUpperCase() + (invitation.status || 'pending').slice(1)}
                        </span>
                      </div>
                      {/* Actions Column */}
                      <div className="col-span-1 flex items-center justify-center">
                        {invitation.status === 'pending' ? (
                          <button
                            onClick={() => setConfirmationModal({
                              isOpen: true,
                              type: 'cancel-invitation',
                              requestId: invitation.id,
                              userId: '',
                              userName: invitation.invited_user_email
                            })}
                            className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-red-500/10 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-xs text-text-secondary">
                            {invitation.responded_at ? new Date(invitation.responded_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <div className="text-lg mb-2">📧 No invitations</div>
                  <div className="text-sm">No invitations sent from this team yet.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title={
          confirmationModal.type === 'cancel-invitation' ? 'Cancel Invitation' :
          confirmationModal.type === 'remove-member' ? 'Remove Team Member' :
          `${confirmationModal.type === 'approve' ? 'Approve' : 'Reject'} Request`
        }
        message={
          confirmationModal.type === 'cancel-invitation' 
            ? `Are you sure you want to cancel the invitation to ${confirmationModal.userName}?`
            : confirmationModal.type === 'remove-member'
            ? `Are you sure you want to remove ${confirmationModal.userName} from the team? This action cannot be undone.`
            : `Are you sure you want to ${confirmationModal.type} the request from ${confirmationModal.userName}?`
        }
        type={confirmationModal.type === 'cancel-invitation' || confirmationModal.type === 'remove-member' ? 'delete' : confirmationModal.type === 'close-with-changes' ? 'warning' : confirmationModal.type}
        confirmText={
          confirmationModal.type === 'cancel-invitation' ? 'Cancel Invitation' :
          confirmationModal.type === 'remove-member' ? 'Remove Member' :
          undefined
        }
        cancelText={
          confirmationModal.type === 'cancel-invitation' ? 'Keep Invitation' :
          confirmationModal.type === 'remove-member' ? 'Keep Member' :
          undefined
        }
        isLoading={isProcessing}
      />

      {/* Send Invitation Modal */}
      <SendInvitationModal
        isOpen={showSendInvitationModal}
        onClose={() => setShowSendInvitationModal(false)}
        onSend={async (data) => {
          try {
            await sendInvitation(teamId, data);
            showSuccess('Invitation sent successfully!');
            setShowSendInvitationModal(false);
            // Refresh invitations specifically for this team
            await fetchPendingTeamInvitations(teamId);
          } catch (error) {
            showError('Failed to send invitation');
            throw error;
          }
        }}
        teamName={teamName}
        teamId={teamId}
        eventCode={''} // Event code not available in team details
        availableUsers={teamAvailableUsers}
        isLoading={isLoading}
      />

    </div>
  );
}

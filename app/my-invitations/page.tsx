"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { useToast } from '@/lib/hooks/useToast';
import { InvitationCard } from '@/components/team-management/InvitationCard';
import Pagination from '@/components/ui/Pagination';

export default function MyInvitationsPage() {
  const { authState } = useAuth();
  const { 
    invitations, 
    fetchInvitations, 
    respondToInvitation,
    isLoading, 
    error 
  } = useTeamsSingleton();
  const { showSuccess, showError } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Simple pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil((invitations?.length || 0) / itemsPerPage);
  const totalCount = invitations?.length || 0;

  // Fetch invitations when component mounts or user changes
  useEffect(() => {
    if (authState.user?.id) {
      fetchInvitations();
    }
  }, [authState.user?.id, currentPage, statusFilter, fetchInvitations]);

  const handleRespondToInvitation = async (invitationId: string, status: 'accepted' | 'declined') => {
    try {
      await respondToInvitation(invitationId, { status });
      showSuccess(`Invitation ${status} successfully!`);
      
      // Refresh invitations
      if (authState.user?.id) {
        await fetchInvitations();
      }
    } catch (error) {
      showError(`Failed to ${status} invitation. Please try again.`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const pendingInvitations = invitations?.filter(inv => inv.status === 'pending' && !inv.is_expired) || [];
  const otherInvitations = invitations?.filter(inv => inv.status !== 'pending' || inv.is_expired) || [];

  if (!authState.user) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Please log in to view your invitations</h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-color border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">Loading invitations...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Team Invitations</h1>
          <p className="text-text-secondary">Manage invitations you've received from team leaders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <span className="text-yellow-500 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{pendingInvitations.length}</p>
                <p className="text-sm text-text-secondary">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <span className="text-green-500 text-lg">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {invitations?.filter(inv => inv.status === 'accepted').length || 0}
                </p>
                <p className="text-sm text-text-secondary">Accepted</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-lg">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{invitations?.length || 0}</p>
                <p className="text-sm text-text-secondary">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilterChange('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === '' 
                  ? 'bg-accent-color text-white' 
                  : 'bg-secondary-bg text-text-secondary hover:bg-border-color'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilterChange('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending' 
                  ? 'bg-accent-color text-white' 
                  : 'bg-secondary-bg text-text-secondary hover:bg-border-color'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusFilterChange('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'accepted' 
                  ? 'bg-accent-color text-white' 
                  : 'bg-secondary-bg text-text-secondary hover:bg-border-color'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => handleStatusFilterChange('declined')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'declined' 
                  ? 'bg-accent-color text-white' 
                  : 'bg-secondary-bg text-text-secondary hover:bg-border-color'
              }`}
            >
              Declined
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
            <p className="text-text-secondary mt-4">Loading invitations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Invitations List */}
        {!isLoading && !error && (
          <>
            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Pending Invitations ({pendingInvitations.length})
                </h2>
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      onRespond={handleRespondToInvitation}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Invitations */}
            {otherInvitations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Previous Invitations ({otherInvitations.length})
                </h2>
                <div className="space-y-4">
                  {otherInvitations.map((invitation) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      onRespond={handleRespondToInvitation}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(invitations?.length || 0) === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No Invitations Found</h3>
                <p className="text-text-secondary">
                  {statusFilter 
                    ? `No ${statusFilter} invitations found.` 
                    : "You haven't received any team invitations yet."
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={10}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useTeamsSingleton } from '@/lib/hooks/useTeamsSingleton';
import { useToast } from '@/lib/hooks/useToast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import Pagination from '@/components/ui/Pagination';

export default function JoinRequestsTab() {
  const { showSuccess, showError, showLoading } = useToast();
  const { 
    allRequests, 
    adminRequestStats,
    isLoading, 
    error,
    fetchAllRequests,
    fetchAdminRequestStats,
    respondToRequest,
    bulkActionRequests,
    clearError
  } = useTeamsSingleton();

  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'bulk-approve' | 'bulk-reject';
    requestId?: string;
    userName?: string;
    requestIds?: string[];
    count?: number;
  }>({
    isOpen: false,
    type: 'approve',
    requestId: '',
    userName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllRequests();
    fetchAdminRequestStats();
  }, [fetchAllRequests, fetchAdminRequestStats]);

  const handleApprove = (requestId: string, userName: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'approve',
      requestId,
      userName
    });
  };

  const handleReject = (requestId: string, userName: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'reject',
      requestId,
      userName
    });
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedRequests.length === 0) return;
    
    setConfirmationModal({
      isOpen: true,
      type: action === 'approve' ? 'bulk-approve' : 'bulk-reject',
      requestIds: selectedRequests,
      count: selectedRequests.length
    });
  };

  const handleConfirmAction = async () => {
    const { type, requestId, userName, requestIds, count } = confirmationModal;
    setIsProcessing(true);
    
    try {
      if (type === 'approve' || type === 'reject') {
        // Individual request action
        const loadingToast = showLoading(`${type === 'approve' ? 'Approving' : 'Rejecting'} request...`);
        await respondToRequest(requestId!, type === 'approve' ? 'approved' : 'rejected');
        showSuccess(`Request from ${userName} ${type === 'approve' ? 'approved' : 'rejected'} successfully`);
        loadingToast();
      } else if (type === 'bulk-approve' || type === 'bulk-reject') {
        // Bulk action
        const action = type === 'bulk-approve' ? 'approve' : 'reject';
        const loadingToast = showLoading(`${action.charAt(0).toUpperCase() + action.slice(1)}ing requests...`);
        await bulkActionRequests(action, requestIds!);
        showSuccess(`${count} request(s) ${action}d successfully`);
        setSelectedRequests([]);
        loadingToast();
      }
      
      fetchAllRequests(); // Refresh the list
      setConfirmationModal({ isOpen: false, type: 'approve', requestId: '', userName: '' });
    } catch (error) {
      console.error('Failed to process action:', error);
      showError('Failed to process action. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({ isOpen: false, type: 'approve', requestId: '', userName: '' });
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id));
    }
  };

  // Filter requests based on status and search term
  const filteredRequests = allRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_by_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">📨</span>
          Join Requests
        </h2>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
          <span className="ml-3 text-text-secondary">Loading join requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {adminRequestStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card-bg rounded-lg p-4 border border-border-color">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Requests</p>
                <p className="text-2xl font-bold text-text-primary">{adminRequestStats.overall_statistics.total_requests}</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>
          <div className="bg-card-bg rounded-lg p-4 border border-border-color">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="text-2xl font-bold text-blue-500">{adminRequestStats.overall_statistics.pending_requests}</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </div>
          <div className="bg-card-bg rounded-lg p-4 border border-border-color">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Approved</p>
                <p className="text-2xl font-bold text-green-500">{adminRequestStats.overall_statistics.approved_requests}</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </div>
          <div className="bg-card-bg rounded-lg p-4 border border-border-color">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Rejected</p>
                <p className="text-2xl font-bold text-red-500">{adminRequestStats.overall_statistics.rejected_requests}</p>
              </div>
              <div className="text-2xl">❌</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-accent-light font-semibold flex items-center gap-2.5">
            <span className="text-xl">📨</span>
            Join Requests
          </h2>
          
          {/* Bulk Actions */}
          {selectedRequests.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve ({selectedRequests.length})
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject ({selectedRequests.length})
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by team name, user name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 rounded-lg bg-secondary-bg border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            <div className="text-5xl mb-4 opacity-50">📭</div>
            <h3 className="text-lg font-semibold mb-2">No requests found</h3>
            <p>No join requests match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-2 pb-2 border-b border-border-color">
              <input
                type="checkbox"
                checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                onChange={handleSelectAll}
                className="rounded border-border-color text-accent-color focus:ring-accent-color"
              />
              <span className="text-sm text-text-secondary">
                Select all ({filteredRequests.length} requests)
              </span>
            </div>

            {paginatedRequests.map((request) => (
              <div key={request.id} className="bg-secondary-bg rounded-lg p-4 border border-border-color">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                    className="mt-1 rounded border-border-color text-accent-color focus:ring-accent-color"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getStatusIcon(request.status)}</span>
                      <h3 className="text-lg font-semibold text-text-primary">{request.team_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-text-secondary space-y-1">
                      <p><strong>User:</strong> {request.requested_by_name} ({request.requested_by_email})</p>
                      <p><strong>Requested:</strong> {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}</p>
                      {request.responded_at && (
                        <p><strong>Responded:</strong> {new Date(request.responded_at).toLocaleDateString()} at {new Date(request.responded_at).toLocaleTimeString()}</p>
                      )}
                      {request.responded_by_email && (
                        <p><strong>Responded by:</strong> {request.responded_by_email}</p>
                      )}
                    </div>

                    {request.message && (
                      <div className="mt-3 p-3 bg-primary-bg rounded-lg">
                        <p className="text-sm text-text-primary italic">"{request.message}"</p>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id, request.requested_by_name)}
                        disabled={isResponding === request.id}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isResponding === request.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id, request.requested_by_name)}
                        disabled={isResponding === request.id}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isResponding === request.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={filteredRequests.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title={confirmationModal.type.includes('bulk') 
          ? `${confirmationModal.type === 'bulk-approve' ? 'Approve' : 'Reject'} Multiple Requests`
          : `${confirmationModal.type === 'approve' ? 'Approve' : 'Reject'} Request`
        }
        message={confirmationModal.type.includes('bulk')
          ? `Are you sure you want to ${confirmationModal.type === 'bulk-approve' ? 'approve' : 'reject'} ${confirmationModal.count} request(s)?`
          : `Are you sure you want to ${confirmationModal.type} the request from ${confirmationModal.userName}?`
        }
        type={confirmationModal.type}
        isLoading={isProcessing}
      />
    </div>
  );
}

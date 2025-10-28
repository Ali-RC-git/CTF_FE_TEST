/**
 * User Selector Component
 * Allows team leaders to search and select users for invitations
 */

import { useState, useEffect, useMemo } from 'react';
import { AvailableUser } from '@/lib/api/teams';
import { useToast } from '@/lib/hooks/useToast';
import { Users, Search } from 'lucide-react';

interface UserSelectorProps {
  teamId: string;
  availableUsers: AvailableUser[];
  onUserSelect: (user: AvailableUser) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function UserSelector({ 
  teamId, 
  availableUsers, 
  onUserSelect, 
  onClose, 
  isLoading = false 
}: UserSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const { showError } = useToast();

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return availableUsers;
    
    const term = searchTerm.toLowerCase();
    return availableUsers.filter(user => 
      user.first_name.toLowerCase().includes(term) ||
      user.last_name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.profile?.bio && user.profile.bio.toLowerCase().includes(term))
    );
  }, [availableUsers, searchTerm]);

  const handleUserSelect = (user: AvailableUser) => {
    setSelectedUser(user);
  };

  const handleConfirmSelection = () => {
    if (selectedUser) {
      onUserSelect(selectedUser);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card-bg rounded-xl border border-border-color shadow-lg max-h-[80vh] w-full max-w-4xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-color">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-accent-light">Select User to Invite</h3>
              <p className="text-sm text-text-secondary">Choose from available users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-bg rounded-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or bio..."
            className="w-full px-4 py-3 pl-10 bg-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent transition-all duration-200"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
            <p className="text-text-secondary mt-4">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedUser?.id === user.id
                    ? 'border-accent-color bg-accent-color/10 shadow-md'
                    : 'border-border-color hover:border-accent-color/50 hover:bg-secondary-bg/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-r from-accent-dark to-accent-color rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {(user.first_name || 'U').charAt(0)}{(user.last_name || 'U').charAt(0)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                      <h4 className="font-medium text-text-primary truncate">
                        {user.first_name} {user.last_name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${
                        user.is_active
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20 font-light'
                          : 'bg-gray-500/10 text-gray-300 border border-gray-300/20 font-light'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-2 break-all">{user.email}</p>
                    
                    {user.profile?.bio && (
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {user.profile.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-xs text-text-secondary">
                      <span>Joined: {formatDate(user.date_joined)}</span>
                      {user.profile?.phone && (
                        <span className="break-all">Phone: {user.profile.phone}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {selectedUser?.id === user.id && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-accent-color rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-text-secondary" />
            </div>
            <h4 className="text-lg font-medium text-text-primary mb-2">No Users Found</h4>
            <p className="text-text-secondary">
              {searchTerm 
                ? `No users match "${searchTerm}"` 
                : 'No available users to invite'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border-color">
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-secondary-bg text-text-primary border border-border-color rounded-lg hover:bg-border-color hover:border-accent-color transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedUser}
            className="flex-1 bg-accent-color hover:bg-accent-dark text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedUser ? `Invite ${selectedUser.first_name}` : 'Select User'}
          </button>
        </div>
      </div>
    </div>
  );
}

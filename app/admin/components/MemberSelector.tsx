'use client';

import { useState, useEffect } from 'react';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { AdminUser } from '@/lib/api';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

interface MemberSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: AdminUser) => void;
  currentMembers: any[];
  teamId: string;
}

export default function MemberSelector({ isOpen, onClose, onSelect, currentMembers, teamId }: MemberSelectorProps) {
  const { users, isLoading, error, fetchUsers } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'leader' | 'member'>('member');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  // Filter out users who are already team members
  const availableUsers = users.filter(user => 
    !currentMembers.some(member => member.user?.id === user.id || member.id === user.id)
  );

  // Filter users based on search term
  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: AdminUser) => {
    onSelect(user);
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
      <div className="bg-card-bg rounded-xl w-full max-w-2xl border border-border-color shadow-2xl max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-card-bg rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-accent-light">Add Team Member</h3>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>
        
        <div className="p-6 space-y-4">
          {/* Search and Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, username, or email..."
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'leader' | 'member')}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all duration-200"
              >
                <option value="member">Member</option>
                <option value="leader">Leader</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-danger-color/10 border border-danger-color/20 text-danger-color px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto border border-border-color rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
                <span className="ml-3 text-text-secondary">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                {searchTerm ? 'No users found matching your search.' : 'No available users to add.'}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center justify-between p-4 bg-secondary-bg hover:bg-accent-color/10 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-accent-color/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-text-primary font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-text-secondary text-sm">
                          @{user.username} • {user.email}
                        </div>
                        <div className="text-text-secondary text-xs">
                          Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • Status: {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-success-color/20 text-success-color'
                          : user.status === 'pending'
                          ? 'bg-warning-color/20 text-warning-color'
                          : 'bg-danger-color/20 text-danger-color'
                      }`}>
                        {user.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedRole === 'leader' 
                          ? 'bg-accent-color/20 text-accent-color' 
                          : 'bg-text-secondary/20 text-text-secondary'
                      }`}>
                        {selectedRole}
                      </span>
                      <span className="text-accent-color">+</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-4 p-6 border-t border-border-color">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-secondary-bg text-text-primary border border-border-color rounded-lg hover:bg-border-color hover:border-accent-color transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

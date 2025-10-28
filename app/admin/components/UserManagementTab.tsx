'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { useToast } from '@/lib/hooks/useToast';
import { AdminUser, CreateUserRequest, UpdateUserRequest } from '@/lib/api';
import SearchBox from './SearchBox';
import DataTable from './DataTable';
import ActionButton from './ActionButton';
import UserAvatar from './UserAvatar';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import ViewUserModal from './ViewUserModal';
import ConfirmationModal from './ConfirmationModal';
import Pagination from '@/components/ui/Pagination';

export default function UserManagementTab() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const {
    users,
    userStats,
    isLoading,
    error,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    createUser,
    updateUser,
    deleteUser,
    fetchUsers,
    fetchUserStats,
    clearError
  } = useUserManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Fetch users and stats on component mount
  useEffect(() => {
    if ((!users || users.length === 0) && !isLoading) {
      fetchUsers({ page: 1, page_size: 20 });
    }
    
    // Fetch stats only once when component mounts
    if (!userStats) {
      fetchUserStats();
    }
  }, [users, isLoading, userStats, fetchUsers, fetchUserStats]);

  // Filter users based on search and filters
  const getFilteredUsers = useCallback(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const filteredUsers = getFilteredUsers();

  const handleCreateUser = async (userData: any) => {
    try {
      const createData: CreateUserRequest = {
        email: userData.email,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        password_confirm: userData.password_confirm,
        role: userData.role as 'admin' | 'instructor' | 'user',
        status: userData.status as 'active' | 'inactive' | 'pending' | 'suspended',
        institution: userData.institution || undefined,
        department: userData.department || undefined,
        team_id: userData.team || null,
        team_role: userData.team_role || undefined
      };
      
      await createUser(createData);
      setShowAddModal(false);
      showSuccess('User created successfully!');
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error; // Re-throw to be handled by the form
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      const updateData: UpdateUserRequest = {
        email: userData.email,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role as 'admin' | 'instructor' | 'user',
        status: userData.status as 'active' | 'inactive' | 'pending' | 'suspended',
        team_id: userData.team || null,
        team_role: userData.team_role || undefined,
        profile: {
          institution: userData.institution || undefined,
          department: userData.department || undefined
        }
      };

      // Only include password fields if they are provided
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password;
        updateData.password_confirm = userData.password_confirm;
      }
      
      await updateUser(userId, updateData);
      setShowEditModal(false);
      setSelectedUser(null);
      showSuccess('User updated successfully!');
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error; // Re-throw to be handled by the form
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users?.find(u => u.id === userId);
    if (userToDelete) {
      setSelectedUser(userToDelete);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        setShowDeleteModal(false);
        setSelectedUser(null);
        showSuccess('User deleted successfully!');
      } catch (error) {
        console.error('Failed to delete user:', error);
        setShowDeleteModal(false);
        setSelectedUser(null);
        showError('Failed to delete user. Please try again.');
      }
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'instructor': return 'Instructor';
      case 'user': return 'Student';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-color/20 text-success-color';
      case 'inactive': return 'bg-warning-500/20 text-warning-500';
      case 'pending': return 'bg-warning-500/20 text-warning-500';
      case 'suspended': return 'bg-danger-color/20 text-danger-color';
      default: return 'bg-text-secondary/20 text-text-secondary';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'team', label: 'Team' },
    { key: 'status', label: 'Status' },
    { key: 'lastActive', label: 'Last Active' },
    { key: 'actions', label: 'Actions' }
  ];

  const renderCell = (user: AdminUser, column: string) => {
    switch (column) {
      case 'user':
        return (
          <div className="flex items-center gap-3">
            <UserAvatar initials={getInitials(user.first_name, user.last_name)} />
            <div>
              <div className="font-medium text-text-primary">{user.full_name}</div>
              <div className="text-sm text-text-secondary">@{user.username}</div>
            </div>
          </div>
        );
      case 'email':
        return <span className="text-text-primary">{user.email}</span>;
      case 'role':
        return (
          <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs font-medium">
            {getRoleDisplayName(user.role)}
          </span>
        );
      case 'team':
        return (
          <div className="flex items-center gap-2">
            {user.current_team ? (
              <>
                <span className="text-sm font-medium text-text-primary">{user.current_team.team_name}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  user.current_team.role === 'leader' 
                    ? 'bg-primary-500/20 text-primary-300' 
                    : 'bg-text-secondary/20 text-text-secondary'
                }`}>
                  {user.current_team.role}
                </span>
              </>
            ) : (
              <span className="text-text-secondary text-sm">No team</span>
            )}
          </div>
        );
      case 'status':
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(user.status)}`}>
            {user.status}
          </span>
        );
      case 'lastActive':
        return (
          <span className="text-text-secondary">
            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
          </span>
        );
      case 'actions':
        return (
          <div className="flex gap-2">
            <ActionButton 
              icon="✏️" 
              title="Edit" 
              onClick={() => handleEditUser(user)}
            />
            <ActionButton 
              icon="👁️" 
              title="View Profile" 
              onClick={() => handleViewUser(user)}
            />
            <ActionButton 
              icon="🗑️" 
              title="Delete" 
              onClick={() => handleDeleteUser(user.id)}
              className="hover:text-danger-color"
            />
          </div>
        );
      default:
        const value = user[column as keyof AdminUser];
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return value.toString();
        }
        if (value === null || value === undefined) {
          return 'N/A';
        }
        return JSON.stringify(value);
    }
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">👤</span>
          User Management
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          Add User
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-danger-color/20 border border-danger-color text-danger-color px-4 py-3 rounded-lg flex items-center justify-between">
          <span className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </span>
          <button 
            onClick={clearError}
            className="text-danger-color hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}
      
      <SearchBox
        placeholder="Search users by name, email, or username..."
        value={searchTerm}
        onChange={setSearchTerm}
        className="mb-6"
      />
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="instructor">Instructor</option>
          <option value="user">Student</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      
      <DataTable
        columns={columns}
        data={filteredUsers}
        renderCell={renderCell}
        isLoading={isLoading}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / 20)}
            totalCount={totalCount}
            pageSize={20}
            onPageChange={(page) => fetchUsers({ page, page_size: 20 })}
          />
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateUser}
      />
      
      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSave={handleUpdateUser}
        user={selectedUser}
      />
      
      {/* View User Modal */}
      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

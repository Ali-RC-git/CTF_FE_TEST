'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { useToast } from '@/lib/hooks/useToast';
import { AdminUser, CreateUserRequest, UpdateUserRequest } from '@/lib/api';
import { adminExportAPI } from '@/lib/api/admin-export';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import ViewUserModal from './ViewUserModal';
import ConfirmationModal from './ConfirmationModal';
import UserTable from './UserTable';

interface UsersContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function UsersContent({ activeTab, onTabChange }: UsersContentProps) {
  const { t } = useLanguage();
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
  const { showSuccess, showError } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter users based on active tab
  const getFilteredUsers = () => {
    if (!users || !Array.isArray(users)) {
      return [];
    }
    
    let filtered = users;
    
    // Apply tab filter (works exactly like role dropdown)
    if (activeTab === 'students') {
      filtered = filtered.filter(user => user.role === 'user');
    } else if (activeTab === 'instructors') {
      filtered = filtered.filter(user => user.role === 'instructor');
    } else if (activeTab === 'admins') {
      filtered = filtered.filter(user => user.role === 'admin');
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  
  // Debug: Log current state
  console.log('Current state:', {
    activeTab,
    usersCount: users?.length || 0,
    filteredUsersCount: filteredUsers?.length || 0,
    users: users?.map(u => ({ name: u.full_name, role: u.role })) || [],
    filteredUsers: filteredUsers?.map(u => ({ name: u.full_name, role: u.role })) || []
  });

  // Handle tab change
  const handleTabChange = (tab: string) => {
    // Clear role filter when switching tabs to avoid conflicts
    setRoleFilter('');
    onTabChange(tab);
  };

  // Handle initial data fetch and search/filter changes
  useEffect(() => {
    const params: any = {
      page: 1,
      page_size: 20
    };
    
    if (searchTerm) params.search = searchTerm;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    
    // Only fetch if we don't have users or if filters have changed
    if (!users || users.length === 0 || searchTerm || roleFilter || statusFilter) {
      fetchUsers(params);
    }
    
    // Fetch stats only once when component mounts
    if (!userStats) {
      fetchUserStats();
    }
  }, [searchTerm, roleFilter, statusFilter, fetchUsers, fetchUserStats, users, userStats]);

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
      console.log('UsersContent - userData received:', userData);
      const updateData: UpdateUserRequest = {
        email: userData.email,
        username: userData.username, // Use username from form
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role as 'admin' | 'instructor' | 'user',
        status: userData.status as 'active' | 'inactive' | 'pending' | 'suspended',
        team_id: userData.team || null,
        team_role: userData.team_role || undefined
      };

      console.log('UsersContent - updateData being sent to API:', updateData);

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

  const handleExportUsers = async () => {
    try {
      await adminExportAPI.exportAndDownloadUsers({
        format: 'excel',
        includeInactive: activeTab === 'all-users',
        includeAuditLogs: true
      });
      showSuccess('Users data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export users data. Please try again.');
    }
  };
  
  return (
    <section>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          {t.admin.users.title}
        </h1>
        <div className="flex gap-4 md:flex-row flex-col">
          <button 
            onClick={handleExportUsers}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <span>📥</span>
            {t.admin.users.exportUsers}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <span>➕</span>
            {t.admin.users.addUser}
          </button>
        </div>
      </header>
      
      {/* Error Messages */}
      {error && (
        <div className="bg-error-500/20 border border-error-500 text-error-500 px-4 py-3 rounded mb-6 flex items-center">
          <span className="mr-2">✗</span>
          {error}
          <button onClick={clearError} className="ml-auto text-error-500 hover:text-error-600">×</button>
        </div>
      )}
      
      {/* Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
            <div className="text-3xl font-bold mb-1">{userStats.total_users}</div>
            <div className="text-sm text-text-secondary">Total Users</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
            <div className="text-3xl font-bold mb-1">{userStats.users_by_role.user}</div>
            <div className="text-sm text-text-secondary">Students</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
            <div className="text-3xl font-bold mb-1">{Math.round((userStats.active_users / userStats.total_users) * 100)}%</div>
            <div className="text-sm text-text-secondary">Active Users</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
            <div className="text-3xl font-bold mb-1">{userStats.users_by_role.admin}</div>
            <div className="text-sm text-text-secondary">Admins</div>
          </div>
        </div>
      )}
      
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <div className="flex border-b border-border-color mb-5">
          {['all-users', 'students', 'instructors', 'admins'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-3 px-5 cursor-pointer transition-all border-b-2 ${
                activeTab === tab 
                  ? 'text-accent-color border-b-accent-color' 
                  : 'text-text-secondary border-b-transparent'
              }`}
            >
              {tab === 'all-users' ? t.admin.users.allUsers : 
               tab === 'students' ? t.admin.users.students : 
               tab === 'instructors' ? t.admin.users.instructors : t.admin.users.administrators}
            </button>
          ))}
        </div>
        
        {/* Filter Controls */}
        <div className="bg-background-secondary p-4 rounded-lg mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-text-secondary mb-2">Search Users</label>
            <input 
              type="text" 
              placeholder="Search by name, email, or username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded bg-background-primary border border-border-default text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="w-[150px]">
            <label className="block text-sm text-text-secondary mb-2">
              Role {activeTab !== 'all-users' && <span className="text-accent-color">(Filtered by tab)</span>}
            </label>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 rounded bg-background-primary border border-border-default text-text-primary focus:outline-none focus:border-primary-500"
              disabled={activeTab !== 'all-users'}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="instructor">Instructor</option>
              <option value="user">Student</option>
            </select>
          </div>
          <div className="w-[150px]">
            <label className="block text-sm text-text-secondary mb-2">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded bg-background-primary border border-border-default text-text-primary focus:outline-none focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <UserTable
            users={filteredUsers}
            isLoading={isLoading}
            onEditUser={handleEditUser}
            onViewUser={handleViewUser}
            onDeleteUser={handleDeleteUser}
            getRoleDisplayName={getRoleDisplayName}
            getStatusColor={getStatusColor}
            getInitials={getInitials}
          />
           <div className="flex justify-between items-center mt-6">
        <div className="text-text-secondary text-sm">
          Showing <span className="font-medium">1-{filteredUsers?.length || 0}</span> of <span className="font-medium">{totalCount || 0}</span> users
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchUsers({ page: currentPage - 1 })}
            disabled={!hasPreviousPage}
            className="px-3 py-1 border border-border-default rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button className="px-3 py-1 border border-primary-500 rounded bg-primary-500/20 text-primary-300">
            {currentPage}
          </button>
          <button 
            onClick={() => fetchUsers({ page: currentPage + 1 })}
            disabled={!hasNextPage}
            className="px-3 py-1 border border-border-default rounded bg-background-secondary text-text-secondary hover:bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
        </div>
      </div>
      
      {/* Pagination */}
     
      
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
        </section>
      );
    }
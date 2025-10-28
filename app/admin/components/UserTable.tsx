'use client';

import { AdminUser } from '@/lib/api';

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onEditUser: (user: AdminUser) => void;
  onViewUser: (user: AdminUser) => void;
  onDeleteUser: (userId: string) => void;
  getRoleDisplayName: (role: string) => string;
  getStatusColor: (status: string) => string;
  getInitials: (firstName: string, lastName: string) => string;
  className?: string;
}

export default function UserTable({
  users,
  isLoading = false,
  onEditUser,
  onViewUser,
  onDeleteUser,
  getRoleDisplayName,
  getStatusColor,
  getInitials,
  className = ''
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className={`w-full border-collapse ${className}`}>
        <div className="py-8 text-center text-text-secondary">
          Loading users...
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className={`w-full border-collapse ${className}`}>
        <div className="py-8 text-center text-text-secondary">
          No users found
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" style={{ height: '400px', overflowY: 'auto' }}>
      <table className={`w-full border-collapse ${className}`}>
        <thead className="sticky top-0 bg-card-bg z-10">
          <tr>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">User</th>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Email</th>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Role</th>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Team</th>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Joined</th>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Last Active</th>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Status</th>
            <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-white/3">
            <td className="py-3 px-4 border-b border-white/5">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs mr-3">
                  {getInitials(user.first_name, user.last_name)}
                </div>
                <span className="font-medium">{user.full_name}</span>
              </div>
            </td>
            <td className="py-3 px-4 border-b border-white/5">{user.email}</td>
            <td className="py-3 px-4 border-b border-white/5">
              <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                {getRoleDisplayName(user.role)}
              </span>
            </td>
            <td className="py-3 px-4 border-b border-white/5">
              {user.current_team ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.current_team.team_name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    user.current_team.role === 'leader' 
                      ? 'bg-primary-500/20 text-primary-300' 
                      : 'bg-text-secondary/20 text-text-secondary'
                  }`}>
                    {user.current_team.role}
                  </span>
                </div>
              ) : (
                <span className="text-text-secondary text-sm">No team</span>
              )}
            </td>
            <td className="py-3 px-4 border-b border-white/5">
              {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="py-3 px-4 border-b border-white/5">
              {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
            </td>
            <td className="py-3 px-4 border-b border-white/5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
            </td>
            <td className="py-3 px-4 border-b border-white/5">
              <div className="flex gap-2">
                <button 
                  onClick={() => onEditUser(user)}
                  className="p-1 text-text-secondary hover:text-accent-color"
                  title="Edit user"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onViewUser(user)}
                  className="p-1 text-text-secondary hover:text-accent-color"
                  title="View user"
                >
                  👁️
                </button>
                <button 
                  onClick={() => onDeleteUser(user.id)}
                  className="p-1 text-text-secondary hover:text-danger-color"
                  title="Delete user"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

'use client';

import { AdminUser } from '@/lib/api';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl w-full max-w-2xl border border-border-color shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border-color sticky top-0 bg-card-bg">
          <h3 className="text-xl font-semibold text-accent-light">User Details</h3>
          <ModalCloseButton onClick={onClose} />
        </div>
        
        <div className="p-6 space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4 pb-6 border-b border-border-color">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-xl font-bold text-white">
              {getInitials(user.first_name, user.last_name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{user.full_name}</h2>
              <p className="text-text-secondary">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Username
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                {user.username}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                User ID
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary font-mono text-sm">
                {user.id}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Institution
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                {user.profile?.institution || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Current Team
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                {user.current_team ? (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{user.current_team.team_name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.current_team.role === 'leader' 
                        ? 'bg-primary-500/20 text-primary-300' 
                        : 'bg-text-secondary/20 text-text-secondary'
                    }`}>
                      {user.current_team.role}
                    </span>
                  </div>
                ) : (
                  'No current team'
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                All Teams
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                {user.teams && user.teams.length > 0 ? (
                  <div className="space-y-2">
                    {user.teams.map((team, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{team.team_name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          team.role === 'leader' 
                            ? 'bg-primary-500/20 text-primary-300' 
                            : 'bg-text-secondary/20 text-text-secondary'
                        }`}>
                          {team.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  'No teams assigned'
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Department
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                {user.profile?.department || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Created At
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                {new Date(user.created_at).toLocaleString()}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Last Login
              </label>
              <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="pt-6 border-t border-border-color">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Security Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  MFA Enabled
                </label>
                <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.is_mfa_enabled 
                      ? 'bg-success-color/20 text-success-color' 
                      : 'bg-warning-500/20 text-warning-500'
                  }`}>
                    {user.is_mfa_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Notifications
                </label>
                <div className="px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.profile?.email_notifications 
                      ? 'bg-success-color/20 text-success-color' 
                      : 'bg-warning-500/20 text-warning-500'
                  }`}>
                    {user.profile?.email_notifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

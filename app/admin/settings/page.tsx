'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/hooks/useToast';
import { useAuth } from '@/lib/context/AuthContext';
import { useSystemSettingsSingleton } from '@/lib/hooks/useSystemSettingsSingleton';
import { UpdateSystemSettingsRequest } from '@/lib/api';

export default function SystemSettingsPage() {
  const { t } = useLanguage();
  const { showSuccess, showError, showLoading } = useToast();
  const { authState } = useAuth();
  
  // Use singleton for system settings
  const {
    systemSettings,
    passwordPolicyOptions,
    sessionTimeoutOptions,
    isLoading,
    error,
    fetchSystemSettings,
    fetchPasswordPolicyOptions,
    fetchSessionTimeoutOptions,
    updateSystemSettings,
    clearError
  } = useSystemSettingsSingleton();
  
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check if user is admin (can edit settings)
  const isAdmin = authState.user?.role === 'admin';
  
  // Load admin-specific settings when component mounts
  useEffect(() => {
    if (isAdmin) {
      // Load admin-specific settings when admin visits the page
      fetchSystemSettings();
      fetchPasswordPolicyOptions();
      fetchSessionTimeoutOptions();
    }
  }, [isAdmin, fetchSystemSettings, fetchPasswordPolicyOptions, fetchSessionTimeoutOptions]);
  
  // Legacy settings for other sections
  const [settings, setSettings] = useState({
    platformName: 'CRDF Global Training Platform',
    platformDescription: 'Advanced OT/ICS cybersecurity training platform for critical infrastructure protection.',
    defaultUserRole: 'instructor',
    registrationPolicy: 'invite-only',
    systemEmail: 'noreply@crdfglobal.org',
    smtpServer: 'smtp.crdfglobal.org',
    smtpPort: 587,
    encryption: 'starttls'
  });

  // Handle password policy update
  const handlePasswordPolicyChange = async (newPolicy: string) => {
    if (!isAdmin || !systemSettings) return;
    
    try {
      setIsUpdating(true);
      const loadingToast = showLoading('Updating password policy...');
      
      const updateData: UpdateSystemSettingsRequest = {
        password_policy: newPolicy
      };
      
      await updateSystemSettings(updateData);
      
      loadingToast();
      showSuccess(`Password policy updated to: ${passwordPolicyOptions.find(opt => opt.value === newPolicy)?.label || newPolicy}`);
    } catch (error) {
      console.error('Failed to update password policy:', error);
      showError('Failed to update password policy');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle session timeout update
  const handleSessionTimeoutChange = async (newTimeout: number) => {
    if (!isAdmin || !systemSettings) return;
    
    try {
      setIsUpdating(true);
      const loadingToast = showLoading('Updating session timeout...');
      
      const updateData: UpdateSystemSettingsRequest = {
        session_timeout_minutes: newTimeout
      };
      
      await updateSystemSettings(updateData);
      
      loadingToast();
      showSuccess(`Session timeout updated to: ${sessionTimeoutOptions.find(opt => opt.value === newTimeout)?.label || `${newTimeout} minutes`}`);
    } catch (error) {
      console.error('Failed to update session timeout:', error);
      showError('Failed to update session timeout');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to a database
    showSuccess('Settings saved successfully!');
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setSettings({
        platformName: 'CRDF Global Training Platform',
        platformDescription: 'Advanced OT/ICS cybersecurity training platform for critical infrastructure protection.',
        defaultUserRole: 'instructor',
        registrationPolicy: 'invite-only',
        systemEmail: 'noreply@crdfglobal.org',
        smtpServer: 'smtp.crdfglobal.org',
        smtpPort: 587,
        encryption: 'starttls'
      });
      showSuccess('Settings reset to defaults!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
            System Settings
          </h1>
          {isAdmin && (
            <p className="text-sm text-text-secondary mt-1">
              You have admin privileges to modify system settings
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleResetDefaults}
            className="bg-transparent border border-border-color text-text-primary py-2.5 px-5 rounded-lg font-semibold cursor-pointer transition-all hover:bg-card-bg hover:border-accent-color flex items-center gap-2"
          >
            <span>🔄</span>
            Reset to Defaults
          </button>
          <button 
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-accent-dark to-accent-color text-white py-2.5 px-5 rounded-lg font-semibold cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-[0_6px_15px_rgba(138,79,255,0.3)] flex items-center gap-2"
          >
            <span>💾</span>
            Save Settings
          </button>
        </div>
      </div>


      {/* General Settings */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">🌐</span>
          General Settings
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({...settings, platformName: e.target.value})}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Platform Description
            </label>
            <textarea
              value={settings.platformDescription}
              onChange={(e) => setSettings({...settings, platformDescription: e.target.value})}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Default User Role
              </label>
              <select
                value={settings.defaultUserRole}
                onChange={(e) => setSettings({...settings, defaultUserRole: e.target.value})}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Registration Policy
              </label>
              <select
                value={settings.registrationPolicy}
                onChange={(e) => setSettings({...settings, registrationPolicy: e.target.value})}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="open">Open Registration</option>
                <option value="invite-only">Invite Only</option>
                <option value="admin-approval">Admin Approval Required</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">🔐</span>
          Security Settings
          {isAdmin && (
            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full ml-2">
              Editable
            </span>
          )}
        </h2>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-4 bg-secondary-bg rounded animate-pulse mb-2"></div>
                <div className="h-12 bg-secondary-bg rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-secondary-bg rounded animate-pulse mb-2"></div>
                <div className="h-12 bg-secondary-bg rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-secondary-bg rounded animate-pulse"></div>
              <div className="h-6 bg-secondary-bg rounded animate-pulse"></div>
              <div className="h-6 bg-secondary-bg rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Policy Dropdown */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password Policy
                </label>
                <select
                  value={systemSettings?.password_policy || ''}
                  onChange={(e) => handlePasswordPolicyChange(e.target.value)}
                  disabled={!isAdmin || isUpdating}
                  className={`w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                    !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {passwordPolicyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!isAdmin && (
                  <p className="text-xs text-text-secondary mt-1">
                    Only admins can modify password policy
                  </p>
                )}
              </div>
              
              {/* Session Timeout Dropdown */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Session Timeout
                </label>
                <select
                  value={systemSettings?.session_timeout_minutes || 30}
                  onChange={(e) => handleSessionTimeoutChange(Number(e.target.value))}
                  disabled={!isAdmin || isUpdating}
                  className={`w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color ${
                    !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {sessionTimeoutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!isAdmin && (
                  <p className="text-xs text-text-secondary mt-1">
                    Only admins can modify session timeout
                  </p>
                )}
              </div>
            </div>
            
            {/* Security Checkboxes */}
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color opacity-50"
                />
                <span className="text-text-secondary">Require email verification for new accounts</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color opacity-50"
                />
                <span className="text-text-secondary">Enable two-factor authentication for administrators</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color opacity-50"
                />
                <span className="text-text-secondary">Enable two-factor authentication for all users</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Email Settings */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">📧</span>
          Email Settings
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              System Email Address
            </label>
            <input
              type="email"
              value={settings.systemEmail}
              onChange={(e) => setSettings({...settings, systemEmail: e.target.value})}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              SMTP Server
            </label>
            <input
              type="text"
              value={settings.smtpServer}
              onChange={(e) => setSettings({...settings, smtpServer: e.target.value})}
              className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Encryption
              </label>
              <select
                value={settings.encryption}
                onChange={(e) => setSettings({...settings, encryption: e.target.value})}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="none">None</option>
                <option value="starttls">STARTTLS</option>
                <option value="ssl">SSL/TLS</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

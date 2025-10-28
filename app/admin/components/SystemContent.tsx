"use client";
import { useState } from 'react';

export default function SystemContent() {
  const [settings, setSettings] = useState({
    platformName: 'CRDF Global Training Platform',
    platformDescription: 'Advanced OT/ICS cybersecurity training platform for critical infrastructure protection.',
    defaultUserRole: 'instructor',
    registrationPolicy: 'invite-only',
    passwordPolicy: 'medium',
    sessionTimeout: '30-minutes',
    emailVerification: true,
    admin2FA: true,
    user2FA: false,
    systemEmail: 'noreply@crdfglobal.org',
    smtpServer: 'smtp.crdfglobal.org',
    smtpPort: 587,
    encryption: 'starttls'
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to a database
    alert('Settings saved successfully!');
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setSettings({
        platformName: 'CRDF Global Training Platform',
        platformDescription: 'Advanced OT/ICS cybersecurity training platform for critical infrastructure protection.',
        defaultUserRole: 'instructor',
        registrationPolicy: 'invite-only',
        passwordPolicy: 'medium',
        sessionTimeout: '30-minutes',
        emailVerification: true,
        admin2FA: true,
        user2FA: false,
        systemEmail: 'noreply@crdfglobal.org',
        smtpServer: 'smtp.crdfglobal.org',
        smtpPort: 587,
        encryption: 'starttls'
      });
      alert('Settings reset to defaults!');
    }
  };

  return (
    <section>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          System Settings
        </h1>
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
      </header>

      {/* General Settings */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg mb-6">
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
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg mb-6">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">🔐</span>
          Security Settings
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password Policy
              </label>
              <select
                value={settings.passwordPolicy}
                onChange={(e) => setSettings({...settings, passwordPolicy: e.target.value})}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="low">Low (6+ characters)</option>
                <option value="medium">Medium (8+ characters, mixed case)</option>
                <option value="high">High (12+ characters, mixed case + numbers + symbols)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Session Timeout
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                <option value="15-minutes">15 minutes</option>
                <option value="30-minutes">30 minutes</option>
                <option value="1-hour">1 hour</option>
                <option value="4-hours">4 hours</option>
                <option value="never">Never (until browser closed)</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.emailVerification}
                onChange={(e) => setSettings({...settings, emailVerification: e.target.checked})}
                className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
              />
              <span className="text-text-secondary">Require email verification for new accounts</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.admin2FA}
                onChange={(e) => setSettings({...settings, admin2FA: e.target.checked})}
                className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
              />
              <span className="text-text-secondary">Enable two-factor authentication for administrators</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.user2FA}
                onChange={(e) => setSettings({...settings, user2FA: e.target.checked})}
                className="w-4 h-4 text-accent-color bg-secondary-bg border-border-color rounded focus:ring-accent-color"
              />
              <span className="text-text-secondary">Enable two-factor authentication for all users</span>
            </label>
          </div>
        </div>
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
    </section>
  );
}
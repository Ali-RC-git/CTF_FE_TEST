"use client";

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { adminExportAPI } from '@/lib/api/admin-export';
import { LogOut, BarChart3, Users, Target, TrendingUp, Settings } from 'lucide-react';
import DashboardStats from './components/DashboardStats';
import DetailedStats from './components/DetailedStats';

export default function AdminView() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('all-users');
  const { showSuccess, showError } = useToast();

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleExportUsers = async () => {
    try {
      await adminExportAPI.exportAndDownloadUsers({
        format: 'excel',
        includeInactive: true,
        includeAuditLogs: true
      });
      showSuccess('Users data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export users data. Please try again.');
    }
  };

  const handleExportSystem = async () => {
    try {
      console.log('Starting system export...', { format: 'excel', includeInactive: true, includeAuditLogs: true });
      await adminExportAPI.exportAndDownloadSystem({
        format: 'excel',
        includeInactive: true,
        includeAuditLogs: true
      });
      console.log('System export completed successfully');
      showSuccess('Complete system data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError(`Failed to export system data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <Head>
        <title>CRDF Global - Admin Dashboard</title>
      </Head>
      <div className="flex min-h-screen bg-background-primary text-text-primary">
        {/* Sidebar */}
        <aside className="w-64 bg-background-secondary border-r border-border-default flex flex-col">
          <div className="flex items-center text-xl font-bold text-text-primary p-5 pb-5 border-b border-border-default mb-5">
            <div className="bg-gradient-to-r from-primary-700 to-primary-500 w-9 h-9 rounded-lg flex items-center justify-center mr-3 font-bold">
              C
            </div>
            CRDF Global <span className="bg-error-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">ADMIN</span>
          </div>
          
          <nav className="flex-1">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'users', icon: Users, label: 'User Management' },
              { id: 'challenges', icon: Target, label: 'Challenge Management' },
              { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
              { id: 'scoreboard', icon: TrendingUp, label: 'Scoreboard Management' },
              { id: 'system', icon: Settings, label: 'System Settings' },
            ].map((item) => (
              <Link 
                href="#" 
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`flex items-center py-3 px-5 text-text-secondary hover:bg-primary-500/10 hover:text-text-primary transition-all border-l-3 ${
                  activePage === item.id 
                    ? 'bg-primary-500/15 text-primary-300 border-l-primary-500' 
                    : 'border-l-transparent'
                }`}
              >
                <item.icon className="mr-3 w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-5 border-t border-border-default flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-700 to-primary-500 flex items-center justify-center mr-3 font-bold">
              AJ
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Admin Johnson</div>
              <div className="text-xs text-text-secondary">Super Administrator</div>
            </div>
            <button className="text-text-secondary hover:text-error-500 transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-5 overflow-y-auto">
          {/* Dashboard Page */}
          {activePage === 'dashboard' && (
            <section>
              <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <div className="flex gap-4 md:flex-row flex-col">
                  <button 
                    onClick={handleExportSystem}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <span>📥</span>
                    Export System Data
                  </button>
                  <button className="btn-primary flex items-center justify-center gap-2">
                    <span>➕</span>
                    Quick Add Challenge
                  </button>
                </div>
              </header>
              
              {/* Stats Overview */}
              <DashboardStats />
              
              {/* Detailed Stats */}
              <DetailedStats />
              
              {/* Recent Activity */}
              <div className="bg-background-tertiary rounded-xl p-6 border border-border-default shadow-lg mb-6">
                <h2 className="text-lg mb-5 text-primary-300 font-semibold flex items-center gap-2.5">
                  <span className="text-xl">🔄</span>
                  Recent Activity
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">User</th>
                        <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Action</th>
                        <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Challenge</th>
                        <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Time</th>
                        <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-white/3">
                        <td className="py-3 px-4 border-b border-white/5">john.doe@example.com</td>
                        <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                        <td className="py-3 px-4 border-b border-white/5">Midnight Credentials - OT Edition</td>
                        <td className="py-3 px-4 border-b border-white/5">10:23 AM</td>
                        <td className="py-3 px-4 border-b border-white/5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-500/20 text-success-500">Success</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/3">
                        <td className="py-3 px-4 border-b border-white/5">sarah.connor@example.com</td>
                        <td className="py-3 px-4 border-b border-white/5">Started challenge</td>
                        <td className="py-3 px-4 border-b border-white/5">PLC Manipulation</td>
                        <td className="py-3 px-4 border-b border-white/5">09:45 AM</td>
                        <td className="py-3 px-4 border-b border-white/5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-500/20 text-warning-500">In Progress</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/3">
                        <td className="py-3 px-4 border-b border-white/5">mike.smith@example.com</td>
                        <td className="py-3 px-4 border-b border-white/5">Submitted flag</td>
                        <td className="py-3 px-4 border-b border-white/5">HMI Exploitation</td>
                        <td className="py-3 px-4 border-b border-white/5">09:12 AM</td>
                        <td className="py-3 px-4 border-b border-white/5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-500/20 text-success-500">Correct</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/3">
                        <td className="py-3 px-4 border-b border-white/5">lisa.jones@example.com</td>
                        <td className="py-3 px-4 border-b border-white/5">Requested hint</td>
                        <td className="py-3 px-4 border-b border-white/5">Network Segmentation</td>
                        <td className="py-3 px-4 border-b border-white/5">08:56 AM</td>
                        <td className="py-3 px-4 border-b border-white/5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-500/20 text-warning-500">Hint Used</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/3">
                        <td className="py-3 px-4 border-b border-white/5">admin@crdf.org</td>
                        <td className="py-3 px-4 border-b border-white/5">Created challenge</td>
                        <td className="py-3 px-4 border-b border-white/5">SCADA Protocol Analysis</td>
                        <td className="py-3 px-4 border-b border-white/5">Yesterday</td>
                        <td className="py-3 px-4 border-b border-white/5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-500/20 text-success-500">Published</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* System Health */}
              <div className="bg-background-tertiary rounded-xl p-6 border border-border-default shadow-lg">
                <h2 className="text-lg mb-5 text-primary-300 font-semibold flex items-center gap-2.5">
                  <span className="text-xl">❤️</span>
                  System Health
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
                    <div className="text-3xl font-bold mb-1">98%</div>
                    <div className="text-sm text-text-secondary">Uptime</div>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
                    <div className="text-3xl font-bold mb-1">2.4 GB</div>
                    <div className="text-sm text-text-secondary">Memory Usage</div>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
                    <div className="text-3xl font-bold mb-1">42%</div>
                    <div className="text-sm text-text-secondary">CPU Load</div>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-5 border border-border-default flex flex-col">
                    <div className="text-3xl font-bold mb-1">1.2 TB</div>
                    <div className="text-sm text-text-secondary">Storage Used</div>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* User Management Page */}
          {activePage === 'users' && (
            <section>
              <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                  User Management
                </h1>
                <div className="flex gap-4 md:flex-row flex-col">
                  <button 
                    onClick={handleExportUsers}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <span>📥</span>
                    Export Users
                  </button>
                  <button className="btn-primary flex items-center justify-center gap-2">
                    <span>➕</span>
                    Add User
                  </button>
                </div>
              </header>
              
              <div className="bg-background-tertiary rounded-xl p-6 border border-border-default shadow-lg">
                <div className="flex border-b border-border-default mb-5">
                  {['all-users', 'students', 'instructors', 'admins'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`py-3 px-5 cursor-pointer transition-all border-b-2 ${
                        activeTab === tab 
                          ? 'text-primary-300 border-b-primary-500' 
                          : 'text-text-secondary border-b-transparent'
                      }`}
                    >
                      {tab === 'all-users' ? 'All Users' : 
                       tab === 'students' ? 'Students' : 
                       tab === 'instructors' ? 'Instructors' : 'Administrators'}
                    </button>
                  ))}
                </div>
                
                {activeTab === 'all-users' && (
                  <div className="overflow-x-auto" style={{ height: '400px', overflowY: 'auto' }}>
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-card-bg z-10">
                        <tr>
                          <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Name</th>
                          <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Email</th>
                          <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Role</th>
                          <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Joined</th>
                          <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Last Active</th>
                          <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Status</th>
                          <th className="text-left py-3 px-4 border-b border-border-default text-text-secondary font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Sample user data rows would go here */}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}
          
          {/* Placeholder for other pages */}
          {activePage !== 'dashboard' && activePage !== 'users' && (
            <div className="flex items-center justify-center h-full">
              <h2 className="text-2xl font-bold text-primary-300">
                {activePage.charAt(0).toUpperCase() + activePage.slice(1)} Page Coming Soon
              </h2>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
'use client';

import { adminExportAPI } from '@/lib/api/admin-export';
import { useToast } from '@/lib/hooks/useToast';
import { AdminRouteGuard } from '@/components/auth/RoleBasedRouteGuard';

export default function AdminPage() {
  const { showSuccess, showError } = useToast();

  const handleExportSystemData = async () => {
    try {
      console.log('🚀 Export System Data button clicked!');
      await adminExportAPI.exportAndDownloadSystem({
        format: 'excel',
        includeInactive: true,
        includeAuditLogs: true
      });
      showSuccess('Complete system data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError(`Failed to export system data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <AdminRouteGuard>
      <section className="w-full max-w-none h-full flex flex-col">
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0 mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <div className="flex gap-3 lg:gap-4 flex-col sm:flex-row">
          <button 
            onClick={handleExportSystemData}
            className="btn-secondary flex items-center justify-center gap-2 text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-3"
          >
            <span>📥</span>
            <span className="hidden sm:inline">Export System Data</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button className="btn-primary flex items-center justify-center gap-2 text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-3">
            <span>➕</span>
            <span className="hidden sm:inline">Quick Add Challenge</span>
            <span className="sm:hidden">Add Challenge</span>
          </button>
        </div>
      </header>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">1,247</div>
          <div className="text-sm text-text-secondary">Total Users</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-success-color">
            <span>↗</span>
            <span>12% increase this month</span>
          </div>
        </div>
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">42</div>
          <div className="text-sm text-text-secondary">Active Challenges</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-success-color">
            <span>↗</span>
            <span>3 new this week</span>
          </div>
        </div>
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">78%</div>
          <div className="text-sm text-text-secondary">Completion Rate</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-danger-color">
            <span>↘</span>
            <span>2% decrease from last month</span>
          </div>
        </div>
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">3.2k</div>
          <div className="text-sm text-text-secondary">Flag Submissions Today</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-success-color">
            <span>↗</span>
            <span>15% increase</span>
          </div>
        </div>
      </div>
      
      {/* System Health */}
      <div className="bg-card-bg rounded-xl p-4 lg:p-6 border border-border-color shadow-lg mb-6">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">❤️</span>
          System Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">98%</div>
            <div className="text-sm text-text-secondary">Uptime</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">2.4 GB</div>
            <div className="text-sm text-text-secondary">Memory Usage</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">42%</div>
            <div className="text-sm text-text-secondary">CPU Load</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">1.2 TB</div>
            <div className="text-sm text-text-secondary">Storage Used</div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-card-bg rounded-xl p-4 lg:p-6 border border-border-color shadow-lg flex-1 flex flex-col">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">🔄</span>
          Recent Activity
        </h2>
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto -mx-2 lg:mx-0 flex-1 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-card-bg z-10">
                <tr>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">User</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Action</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Challenge</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Time</th>
                  <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">john.doe@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Midnight Credentials - OT Edition</td>
                  <td className="py-3 px-4 border-b border-white/5">10:23 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Success</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">sarah.connor@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Started challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">PLC Manipulation</td>
                  <td className="py-3 px-4 border-b border-white/5">09:45 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">In Progress</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">mike.smith@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Submitted flag</td>
                  <td className="py-3 px-4 border-b border-white/5">HMI Exploitation</td>
                  <td className="py-3 px-4 border-b border-white/5">09:12 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Correct</span>
                  </td>
                </tr>
                {/* Add more rows to fill the space */}
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">alex.johnson@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Network Penetration Testing</td>
                  <td className="py-3 px-4 border-b border-white/5">08:30 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Success</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">emma.wilson@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Started challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Web Application Security</td>
                  <td className="py-3 px-4 border-b border-white/5">08:15 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">In Progress</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">david.brown@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Submitted flag</td>
                  <td className="py-3 px-4 border-b border-white/5">Cryptography Challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">07:45 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Correct</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">lisa.garcia@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Reverse Engineering</td>
                  <td className="py-3 px-4 border-b border-white/5">07:20 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Success</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">robert.taylor@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Started challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Forensics Analysis</td>
                  <td className="py-3 px-4 border-b border-white/5">06:55 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">In Progress</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">sophia.martinez@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Submitted flag</td>
                  <td className="py-3 px-4 border-b border-white/5">Binary Exploitation</td>
                  <td className="py-3 px-4 border-b border-white/5">06:30 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Correct</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">james.anderson@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Mobile Security</td>
                  <td className="py-3 px-4 border-b border-white/5">06:10 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Success</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">olivia.thomas@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Started challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Cloud Security</td>
                  <td className="py-3 px-4 border-b border-white/5">05:45 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">In Progress</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">william.clark@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">IoT Security Assessment</td>
                  <td className="py-3 px-4 border-b border-white/5">05:20 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Success</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">ava.rodriguez@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Submitted flag</td>
                  <td className="py-3 px-4 border-b border-white/5">Social Engineering</td>
                  <td className="py-3 px-4 border-b border-white/5">04:55 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Correct</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">ethan.lee@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Started challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">API Security Testing</td>
                  <td className="py-3 px-4 border-b border-white/5">04:30 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">In Progress</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">mia.hall@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Database Security</td>
                  <td className="py-3 px-4 border-b border-white/5">04:10 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Success</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">noah.young@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Submitted flag</td>
                  <td className="py-3 px-4 border-b border-white/5">Wireless Security</td>
                  <td className="py-3 px-4 border-b border-white/5">03:45 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Correct</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">charlotte.king@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Started challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Incident Response</td>
                  <td className="py-3 px-4 border-b border-white/5">03:20 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">In Progress</span>
                  </td>
                </tr>
                <tr className="hover:bg-white/3">
                  <td className="py-3 px-4 border-b border-white/5">lucas.wright@example.com</td>
                  <td className="py-3 px-4 border-b border-white/5">Completed challenge</td>
                  <td className="py-3 px-4 border-b border-white/5">Vulnerability Assessment</td>
                  <td className="py-3 px-4 border-b border-white/5">02:55 AM</td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">Success</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </section>
    </AdminRouteGuard>
  );
}
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DashboardContent() {
  const { t } = useLanguage();
  
  return (
    <section>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          {t.admin.dashboard.title}
        </h1>
        <div className="flex gap-4 md:flex-row flex-col">
          <button className="btn-secondary flex items-center justify-center gap-2">
            <span>📥</span>
            {t.admin.dashboard.exportData}
          </button>
          <button className="btn-primary flex items-center justify-center gap-2">
            <span>➕</span>
            {t.admin.dashboard.quickAddChallenge}
          </button>
        </div>
      </header>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">1,247</div>
          <div className="text-sm text-text-secondary">{t.admin.dashboard.totalUsers}</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-success-color">
            <span>↗</span>
            <span>12% increase this month</span>
          </div>
        </div>
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">42</div>
          <div className="text-sm text-text-secondary">{t.admin.dashboard.activeChallenges}</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-success-color">
            <span>↗</span>
            <span>3 new this week</span>
          </div>
        </div>
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">78%</div>
          <div className="text-sm text-text-secondary">{t.admin.dashboard.completionRate}</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-danger-color">
            <span>↘</span>
            <span>2% decrease from last month</span>
          </div>
        </div>
        <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1">3.2k</div>
          <div className="text-sm text-text-secondary">{t.admin.dashboard.flagSubmissionsToday}</div>
          <div className="mt-2.5 text-xs flex items-center gap-1 text-success-color">
            <span>↗</span>
            <span>15% increase</span>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg mb-6">
        <h2 className="text-lg mb-5 text-accent-color font-semibold flex items-center gap-2.5">
          <span className="text-xl">🔄</span>
          {t.admin.dashboard.recentActivity}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.dashboard.user}</th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.dashboard.action}</th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.dashboard.challenge}</th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.dashboard.time}</th>
                <th className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm">{t.admin.dashboard.status}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-white/3">
                <td className="py-3 px-4 border-b border-white/5">john.doe@example.com</td>
                <td className="py-3 px-4 border-b border-white/5">{t.admin.dashboard.completedChallenge}</td>
                <td className="py-3 px-4 border-b border-white/5">Midnight Credentials - OT Edition</td>
                <td className="py-3 px-4 border-b border-white/5">10:23 AM</td>
                <td className="py-3 px-4 border-b border-white/5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">{t.admin.dashboard.success}</span>
                </td>
              </tr>
              <tr className="hover:bg-white/3">
                <td className="py-3 px-4 border-b border-white/5">sarah.connor@example.com</td>
                <td className="py-3 px-4 border-b border-white/5">{t.admin.dashboard.startedChallenge}</td>
                <td className="py-3 px-4 border-b border-white/5">PLC Manipulation</td>
                <td className="py-3 px-4 border-b border-white/5">09:45 AM</td>
                <td className="py-3 px-4 border-b border-white/5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">{t.admin.dashboard.inProgress}</span>
                </td>
              </tr>
              <tr className="hover:bg-white/3">
                <td className="py-3 px-4 border-b border-white/5">mike.smith@example.com</td>
                <td className="py-3 px-4 border-b border-white/5">{t.admin.dashboard.submittedFlag}</td>
                <td className="py-3 px-4 border-b border-white/5">HMI Exploitation</td>
                <td className="py-3 px-4 border-b border-white/5">09:12 AM</td>
                <td className="py-3 px-4 border-b border-white/5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">{t.admin.dashboard.correct}</span>
                </td>
              </tr>
              <tr className="hover:bg-white/3">
                <td className="py-3 px-4 border-b border-white/5">lisa.jones@example.com</td>
                <td className="py-3 px-4 border-b border-white/5">{t.admin.dashboard.requestedHint}</td>
                <td className="py-3 px-4 border-b border-white/5">Network Segmentation</td>
                <td className="py-3 px-4 border-b border-white/5">08:56 AM</td>
                <td className="py-3 px-4 border-b border-white/5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-warning-color/20 text-warning-color">{t.admin.dashboard.hintUsed}</span>
                </td>
              </tr>
              <tr className="hover:bg-white/3">
                <td className="py-3 px-4 border-b border-white/5">admin@crdf.org</td>
                <td className="py-3 px-4 border-b border-white/5">{t.admin.dashboard.createdChallenge}</td>
                <td className="py-3 px-4 border-b border-white/5">SCADA Protocol Analysis</td>
                <td className="py-3 px-4 border-b border-white/5">Yesterday</td>
                <td className="py-3 px-4 border-b border-white/5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-success-color/20 text-success-color">{t.admin.dashboard.published}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* System Health */}
      <div className="bg-background-tertiary rounded-xl p-6 border border-border-default shadow-lg">
        <h2 className="text-lg mb-5 text-accent-color font-semibold flex items-center gap-2.5">
          <span className="text-xl">❤️</span>
          {t.admin.dashboard.systemHealth}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">98%</div>
            <div className="text-sm text-text-secondary">{t.admin.dashboard.uptime}</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">2.4 GB</div>
            <div className="text-sm text-text-secondary">{t.admin.dashboard.memoryUsage}</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">42%</div>
            <div className="text-sm text-text-secondary">{t.admin.dashboard.cpuLoad}</div>
          </div>
          <div className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
            <div className="text-3xl font-bold mb-1">1.2 TB</div>
            <div className="text-sm text-text-secondary">{t.admin.dashboard.storageUsed}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

interface TeamTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TeamTabs({ activeTab, onTabChange }: TeamTabsProps) {
  const tabs = [
    { id: 'teams', label: 'All Teams', icon: '👥' },
    { id: 'users', label: 'User Management', icon: '👤' },
    { id: 'requests', label: 'Join Requests', icon: '📨' },
    { id: 'settings', label: 'Team Settings', icon: '⚙️' }
  ];

  return (
    <div className="flex border-b border-border-color">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'text-accent-light border-accent-color'
              : 'text-text-secondary border-transparent hover:text-text-primary'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

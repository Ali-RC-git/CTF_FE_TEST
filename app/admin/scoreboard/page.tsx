'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/hooks/useToast';
import ScoreboardManagementHeader from '../components/ScoreboardManagementHeader';
import ScoreboardStatsOverview from '../components/ScoreboardStatsOverview';
import ScoreboardTabs from '../components/ScoreboardTabs';
import LiveScoreboardTab from '../components/LiveScoreboardTab';
import RankingControlsTab from '../components/RankingControlsTab';
import ScoringSystemTab from '../components/ScoringSystemTab';
import DisplaySettingsTab from '../components/DisplaySettingsTab';

export default function ScoreboardManagementPage() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('scoreboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <ScoreboardManagementHeader />

      {/* Stats Overview */}
      <ScoreboardStatsOverview />

      {/* Tabs Navigation */}
      <ScoreboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'scoreboard' && <LiveScoreboardTab onShowSuccess={showSuccess} onShowError={showError} />}
        {activeTab === 'ranking' && <RankingControlsTab onShowSuccess={showSuccess} onShowError={showError} />}
        {activeTab === 'scoring' && <ScoringSystemTab onShowSuccess={showSuccess} onShowError={showError} />}
        {activeTab === 'display' && <DisplaySettingsTab onShowSuccess={showSuccess} onShowError={showError} />}
        </div>
      </div>
  );
}
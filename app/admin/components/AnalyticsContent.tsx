'use client';

import { useState } from 'react';
import ChartContainer from './ChartContainer';
import AnalyticsCard from './AnalyticsCard';

export default function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('completion');

  const handleRefresh = () => {
    // Simulate data refresh
    console.log('Refreshing analytics data...');
  };

  const handleExport = () => {
    // Simulate report export
    console.log('Exporting analytics report...');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent-color bg-clip-text text-transparent">
          Analytics
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <span>📥</span>
            Export Report
          </button>
          <button 
            onClick={handleRefresh}
            className="btn-primary flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-4 items-center">
        <label className="text-text-secondary font-medium">Time Range:</label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Main Chart */}
      <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
        <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
          <span className="text-xl">📈</span>
          Challenge Completion Rates
        </h2>
        <ChartContainer
          type="completion"
          data={completionData}
          height={300}
        />
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard
          title="User Engagement"
          icon="👥"
          type="engagement"
          data={engagementData}
        />
        <AnalyticsCard
          title="Difficulty Distribution"
          icon="🎯"
          type="difficulty"
          data={difficultyData}
        />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Top Performers"
          icon="🏆"
          type="performers"
          data={performersData}
        />
        <AnalyticsCard
          title="Challenge Categories"
          icon="📊"
          type="categories"
          data={categoriesData}
        />
        <AnalyticsCard
          title="System Performance"
          icon="⚡"
          type="performance"
          data={performanceData}
        />
      </div>
    </div>
  );
}

// Mock data for charts
const completionData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Easy Challenges',
      data: [85, 78, 92, 88],
      borderColor: '#6fcf97',
      backgroundColor: 'rgba(111, 207, 151, 0.1)',
    },
    {
      label: 'Medium Challenges',
      data: [65, 72, 68, 75],
      borderColor: '#f2c94c',
      backgroundColor: 'rgba(242, 201, 76, 0.1)',
    },
    {
      label: 'Hard Challenges',
      data: [35, 42, 38, 45],
      borderColor: '#eb5757',
      backgroundColor: 'rgba(235, 87, 87, 0.1)',
    }
  ]
};

const engagementData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Active Users',
      data: [120, 135, 142, 138, 155, 98, 85],
      borderColor: '#8a4fff',
      backgroundColor: 'rgba(138, 79, 255, 0.1)',
    }
  ]
};

const difficultyData = {
  labels: ['Easy', 'Medium', 'Hard', 'Expert'],
  datasets: [
    {
      data: [35, 40, 20, 5],
      backgroundColor: [
        '#6fcf97',
        '#f2c94c',
        '#eb5757',
        '#8a4fff'
      ]
    }
  ]
};

const performersData = [
  { name: 'QuantumPoptarts', score: 6242, change: '+12%' },
  { name: 'WEH', score: 5995, change: '+8%' },
  { name: 'TeamName-of-MyChoice', score: 5258, change: '+15%' },
  { name: 'The Undecideds', score: 3489, change: '+5%' },
  { name: 'Geren', score: 3125, change: '+3%' }
];

const categoriesData = [
  { name: 'OT/ICS Security', count: 15, percentage: 45 },
  { name: 'Network Security', count: 8, percentage: 24 },
  { name: 'Web Application Security', count: 6, percentage: 18 },
  { name: 'Digital Forensics', count: 3, percentage: 9 },
  { name: 'Cryptography', count: 1, percentage: 3 }
];

const performanceData = [
  { metric: 'Response Time', value: '120ms', status: 'good' },
  { metric: 'Uptime', value: '99.9%', status: 'excellent' },
  { metric: 'Error Rate', value: '0.1%', status: 'good' },
  { metric: 'Throughput', value: '1.2k req/s', status: 'excellent' }
];
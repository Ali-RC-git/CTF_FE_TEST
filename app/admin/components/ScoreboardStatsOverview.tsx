'use client';

export default function ScoreboardStatsOverview() {
  const stats = [
    { value: '42', label: 'Active Teams' },
    { value: '6,242', label: 'Leading Score' },
    { value: '1,247', label: 'Total Submissions' },
    { value: '78%', label: 'Active Participation' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <div key={index} className="bg-secondary-bg rounded-lg p-5 border border-border-color flex flex-col">
          <div className="text-3xl font-bold mb-1 text-text-primary">{stat.value}</div>
          <div className="text-sm text-text-secondary">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

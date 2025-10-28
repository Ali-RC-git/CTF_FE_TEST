'use client';

interface ChartContainerProps {
  type: string;
  data: any;
  height?: number;
}

export default function ChartContainer({ type, data, height = 300 }: ChartContainerProps) {
  const renderChart = () => {
    switch (type) {
      case 'completion':
        return (
          <div className="flex items-center justify-center h-full bg-secondary-bg rounded-lg p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Challenge Completion Chart</h3>
              <p className="text-text-secondary">Interactive chart showing completion rates over time</p>
              <div className="mt-4 text-sm text-text-muted">
                Easy: 85% | Medium: 65% | Hard: 35%
              </div>
            </div>
          </div>
        );
      
      case 'engagement':
        return (
          <div className="flex items-center justify-center h-full bg-secondary-bg rounded-lg p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">User Engagement Chart</h3>
              <p className="text-text-secondary">Daily active users and engagement metrics</p>
              <div className="mt-4 text-sm text-text-muted">
                Peak: 155 users | Average: 125 users
              </div>
            </div>
          </div>
        );
      
      case 'difficulty':
        return (
          <div className="flex items-center justify-center h-full bg-secondary-bg rounded-lg p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Difficulty Distribution</h3>
              <p className="text-text-secondary">Challenge distribution by difficulty level</p>
              <div className="mt-4 text-sm text-text-muted">
                Easy: 35% | Medium: 40% | Hard: 20% | Expert: 5%
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-secondary-bg rounded-lg p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Chart Visualization</h3>
              <p className="text-text-secondary">Interactive chart would be rendered here</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      {renderChart()}
    </div>
  );
}

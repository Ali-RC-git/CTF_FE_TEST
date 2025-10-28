'use client';

interface AnalyticsCardProps {
  title: string;
  icon: string;
  type: string;
  data: any;
}

export default function AnalyticsCard({ title, icon, type, data }: AnalyticsCardProps) {
  const renderContent = () => {
    switch (type) {
      case 'performers':
        return (
          <div className="space-y-3">
            {data.map((performer: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-secondary-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-accent-dark to-accent-color rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">{performer.name}</div>
                    <div className="text-sm text-text-secondary">{performer.score} points</div>
                  </div>
                </div>
                <div className="text-success-color font-semibold">{performer.change}</div>
              </div>
            ))}
          </div>
        );
      
      case 'categories':
        return (
          <div className="space-y-3">
            {data.map((category: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-secondary-bg rounded-lg">
                <div>
                  <div className="font-semibold text-text-primary">{category.name}</div>
                  <div className="text-sm text-text-secondary">{category.count} challenges</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-accent-color">{category.percentage}%</div>
                  <div className="w-16 bg-primary-bg rounded-full h-2 mt-1">
                    <div 
                      className="bg-accent-color h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'performance':
        return (
          <div className="space-y-3">
            {data.map((metric: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-secondary-bg rounded-lg">
                <div>
                  <div className="font-semibold text-text-primary">{metric.metric}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    metric.status === 'excellent' ? 'text-success-color' :
                    metric.status === 'good' ? 'text-warning-color' : 'text-danger-color'
                  }`}>
                    {metric.value}
                  </div>
                  <div className={`text-xs ${
                    metric.status === 'excellent' ? 'text-success-color' :
                    metric.status === 'good' ? 'text-warning-color' : 'text-danger-color'
                  }`}>
                    {metric.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-48 bg-secondary-bg rounded-lg">
            <div className="text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-text-secondary">Chart visualization</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color shadow-lg">
      <h2 className="text-lg mb-5 text-accent-light font-semibold flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        {title}
      </h2>
      {renderContent()}
    </div>
  );
}

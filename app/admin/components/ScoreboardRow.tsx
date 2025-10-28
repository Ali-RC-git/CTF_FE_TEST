'use client';

interface Team {
  id: number;
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  rank: number;
}

interface ScoreboardRowProps {
  team: Team;
}

export default function ScoreboardRow({ team }: ScoreboardRowProps) {
  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'first-place';
      case 2:
        return 'second-place';
      case 3:
        return 'third-place';
      default:
        return '';
    }
  };

  const getMovementIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getMovementClass = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success-color';
      case 'down':
        return 'text-danger-color';
      case 'stable':
        return 'text-warning-color';
      default:
        return 'text-warning-color';
    }
  };

  return (
    <div className={`flex items-center p-4 border-b border-white/5 hover:bg-white/3 transition-all ${getRankClass(team.rank)}`}>
      <div className="w-16 font-bold text-lg">
        {team.rank === 1 && <span className="text-yellow-400">1st</span>}
        {team.rank === 2 && <span className="text-gray-300">2nd</span>}
        {team.rank === 3 && <span className="text-amber-600">3rd</span>}
        {team.rank > 3 && <span className="text-text-primary">{team.rank}th</span>}
      </div>
      <div className="flex-1 font-semibold text-lg text-text-primary">
        {team.name}
      </div>
      <div className="w-32 text-right font-bold text-lg text-text-primary">
        {team.score}pts
      </div>
      <div className={`w-10 text-center font-bold text-lg ${getMovementClass(team.trend)}`}>
        {getMovementIcon(team.trend)}
      </div>
    </div>
  );
}

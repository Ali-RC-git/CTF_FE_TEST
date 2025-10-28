interface StatCardProps {
  value: number;
  label: string;
  className?: string;
}

export default function StatCard({ value, label, className = '' }: StatCardProps) {
  return (
    <div className={`bg-secondary-bg rounded-lg p-6 text-center ${className}`}>
      <div className="text-3xl font-bold text-text-primary mb-2">
        {value.toLocaleString()}
      </div>
      <div className="text-text-secondary text-sm">
        {label}
      </div>
    </div>
  );
}

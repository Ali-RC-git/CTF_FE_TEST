'use client';

interface ActionButtonProps {
  icon: string;
  title: string;
  onClick: () => void;
  className?: string;
}

export default function ActionButton({ icon, title, onClick, className = '' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`text-text-secondary hover:text-accent-light transition-colors p-1 ${className}`}
    >
      {icon}
    </button>
  );
}

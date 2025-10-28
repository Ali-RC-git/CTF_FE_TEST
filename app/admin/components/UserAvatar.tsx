'use client';

interface UserAvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ initials, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-accent-dark to-accent-color flex items-center justify-center font-bold text-white`}>
      {initials}
    </div>
  );
}

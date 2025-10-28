'use client';

interface SearchBoxProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchBox({ placeholder, value, onChange, className = '' }: SearchBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary">
        🔍
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
      />
    </div>
  );
}

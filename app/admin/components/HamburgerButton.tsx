'use client';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      id="hamburger-button"
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-text-primary hover:bg-accent-color/10 transition-colors"
      aria-label="Toggle sidebar"
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span 
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        />
        <span 
          className={`block h-0.5 w-6 bg-current transition-all duration-300 mt-1 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span 
          className={`block h-0.5 w-6 bg-current transition-all duration-300 mt-1 ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        />
      </div>
    </button>
  );
}

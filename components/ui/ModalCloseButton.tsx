/**
 * Standardized close button for modals
 * Provides consistent styling across all admin modals
 */

interface ModalCloseButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export default function ModalCloseButton({ 
  onClick, 
  title = "Close", 
  className = "" 
}: ModalCloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-text-secondary hover:text-text-primary hover:bg-secondary-bg rounded-xl transition-all duration-200 hover:scale-105 ${className}`}
      title={title}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

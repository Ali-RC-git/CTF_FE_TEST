'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-danger-color hover:bg-red-600 text-white',
          iconBg: 'bg-danger-color/20'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-warning-500 hover:bg-warning-600 text-white',
          iconBg: 'bg-warning-500/20'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-accent-color hover:bg-accent-dark text-white',
          iconBg: 'bg-accent-color/20'
        };
      default:
        return {
          icon: '⚠️',
          confirmButton: 'bg-danger-color hover:bg-red-600 text-white',
          iconBg: 'bg-danger-color/20'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl w-full max-w-md border border-border-color shadow-lg">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mr-4 text-2xl`}>
              {styles.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            </div>
          </div>
          
          <p className="text-text-secondary mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-secondary hover:bg-background-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

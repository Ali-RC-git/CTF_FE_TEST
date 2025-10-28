"use client";
import { ReactNode } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'approve' | 'reject' | 'delete' | 'warning' | 'bulk-approve' | 'bulk-reject';
  isLoading?: boolean;
  children?: ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false,
  children
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'approve':
      case 'bulk-approve':
        return {
          icon: '✅',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          iconBg: 'bg-green-100'
        };
      case 'reject':
      case 'bulk-reject':
        return {
          icon: '❌',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100'
        };
      case 'delete':
        return {
          icon: '🗑️',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100'
        };
      default:
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          iconBg: 'bg-yellow-100'
        };
    }
  };

  const styles = getTypeStyles();
  const defaultConfirmText = type === 'approve' || type === 'bulk-approve' ? 'Approve' : 
                            type === 'reject' || type === 'bulk-reject' ? 'Reject' : 'Confirm';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl p-6 max-w-md w-full border border-border-color shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center text-2xl`}>
            {styles.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-text-secondary mb-4">{message}</p>
          {children}
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.confirmButton}`}
          >
            {isLoading ? 'Processing...' : (confirmText || defaultConfirmText)}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-secondary-bg border border-border-color rounded-lg hover:bg-primary-bg focus:outline-none focus:ring-2 focus:ring-accent-color disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

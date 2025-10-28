import toast from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message: string, options?: { duration?: number }) => {
    toast.success(message, {
      duration: options?.duration || 3000,
    });
  };

  const showError = (message: string, options?: { duration?: number }) => {
    toast.error(message, {
      duration: options?.duration || 5000,
    });
  };

  const showLoading = (message: string) => {
    const toastId = toast.loading(message);
    return () => toast.dismiss(toastId);
  };

  const showInfo = (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#1e40af', // bg-blue-800
        color: '#dbeafe', // text-blue-100
        border: '1px solid #2563eb', // border-blue-600
      },
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#92400e', // bg-yellow-800
        color: '#fef3c7', // text-yellow-100
        border: '1px solid #d97706', // border-yellow-600
      },
    });
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    showSuccess,
    showError,
    showLoading,
    showInfo,
    showWarning,
    dismiss,
    dismissAll,
  };
};

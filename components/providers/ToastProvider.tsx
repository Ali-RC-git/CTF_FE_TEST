'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#1f2937', // bg-gray-800
          color: '#f9fafb', // text-gray-50
          border: '1px solid #374151', // border-gray-700
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        // Success toast styling
        success: {
          duration: 3000,
          style: {
            background: '#065f46', // bg-green-800
            color: '#d1fae5', // text-green-100
            border: '1px solid #059669', // border-green-600
          },
          iconTheme: {
            primary: '#10b981', // text-green-500
            secondary: '#d1fae5', // text-green-100
          },
        },
        // Error toast styling
        error: {
          duration: 5000,
          style: {
            background: '#7f1d1d', // bg-red-900
            color: '#fecaca', // text-red-200
            border: '1px solid #dc2626', // border-red-600
          },
          iconTheme: {
            primary: '#ef4444', // text-red-500
            secondary: '#fecaca', // text-red-200
          },
        },
        // Loading toast styling
        loading: {
          style: {
            background: '#1e3a8a', // bg-blue-900
            color: '#dbeafe', // text-blue-100
            border: '1px solid #2563eb', // border-blue-600
          },
        },
      }}
    />
  );
}

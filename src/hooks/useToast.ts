import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    addToast({ type, title, message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    toast,
    success: (title: string, message?: string, duration?: number) => toast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) => toast('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) => toast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) => toast('info', title, message, duration),
  };
}
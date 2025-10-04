import { createContext, useContext } from 'react';
import { useToast } from './useToast';
import { Toast } from './Toast';

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
        {toast.toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            toast={toastItem}
            onRemove={toast.removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
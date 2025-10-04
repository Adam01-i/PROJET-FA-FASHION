import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const Icon = icons[toast.type];

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        flex items-start p-4 mb-2 border rounded-lg shadow-lg transform transition-all duration-300 max-w-md
        ${styles[toast.type]}
        ${isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
        toast.type === 'success' ? 'text-green-500' :
        toast.type === 'error' ? 'text-red-500' :
        toast.type === 'warning' ? 'text-yellow-500' :
        'text-blue-500'
      }`} />
      
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="ml-4 flex-shrink-0 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
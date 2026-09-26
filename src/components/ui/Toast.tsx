import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

interface Props {
  toast: ToastData;
  onClose: (id: string) => void;
}

const config = {
  success: { icon: CheckCircle2, color: 'text-status-available', bg: 'bg-status-available-bg', border: 'border-status-available-border' },
  error: { icon: AlertCircle, color: 'text-status-cancelled', bg: 'bg-status-cancelled-bg', border: 'border-status-cancelled-border' },
  info: { icon: Info, color: 'text-status-ready', bg: 'bg-status-ready-bg', border: 'border-status-ready-border' },
};

export function Toast({ toast, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const c = config[toast.type];
  const Icon = c.icon;

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(toast.id), 200);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-elevated
        bg-white ${c.border} animate-slide-down transition-opacity duration-200
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.color}`} />
      <p className="text-sm text-neutral-700 flex-1">{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className="touch-target w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastData[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => <Toast key={t.id} toast={t} onClose={onClose} />)}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, closeToast };
}

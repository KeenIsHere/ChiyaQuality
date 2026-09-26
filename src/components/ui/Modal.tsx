import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: Props) {
  if (!open) return null;

  const sizeClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`
        relative bg-white rounded-2xl shadow-elevated w-full ${sizeClass}
        animate-slide-up flex flex-col max-h-[90vh]
      `}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-section-header text-neutral-800">{title}</h2>
          <button
            onClick={onClose}
            className="touch-target w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

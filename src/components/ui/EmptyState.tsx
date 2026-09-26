import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Props {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, message, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-700 mb-1">{title}</h3>
      {message && <p className="text-sm text-neutral-500 max-w-xs mb-4">{message}</p>}
      {action}
    </div>
  );
}

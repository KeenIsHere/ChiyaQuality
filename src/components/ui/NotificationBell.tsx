import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Clock, XCircle, PackageX } from 'lucide-react';
import type { Notification } from '@/types';

interface Props {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClickTable?: (tableNumber: number) => void;
}

const iconMap = {
  ready: { icon: CheckCircle2, color: 'text-status-ready', bg: 'bg-status-ready-bg' },
  cart_submitted: { icon: Bell, color: 'text-status-occupied', bg: 'bg-status-occupied-bg' },
  bill_requested: { icon: AlertCircle, color: 'text-status-cancelled', bg: 'bg-status-cancelled-bg' },
  item_soldout: { icon: PackageX, color: 'text-neutral-500', bg: 'bg-neutral-100' },
};

export function NotificationBell({ notifications, onDismiss, onClickTable }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const visible = filter === 'all' ? notifications : notifications.filter(n => !n.read);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="touch-target relative w-10 h-10 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-status-cancelled text-white text-[10px] font-semibold rounded-full flex items-center justify-center animate-pulse-ring">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-elevated border border-neutral-200 animate-slide-down overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${filter === 'all' ? 'bg-brand-100 text-brand-700' : 'text-neutral-500 hover:bg-neutral-100'}`}
              >All</button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${filter === 'unread' ? 'bg-brand-100 text-brand-700' : 'text-neutral-500 hover:bg-neutral-100'}`}
              >Unread ({unreadCount})</button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {visible.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No notifications</p>
              </div>
            ) : (
              visible.map(n => {
                const cfg = iconMap[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-neutral-100 last:border-0 flex items-start gap-3 hover:bg-neutral-50 transition-colors cursor-pointer ${!n.read ? 'bg-brand-50/40' : ''}`}
                    onClick={() => onClickTable && n.tableNumber && onClickTable(n.tableNumber)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-800 truncate">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-status-cancelled flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{n.message}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />
                        {n.time}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                      className="touch-target w-7 h-7 flex items-center justify-center rounded-lg text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 flex-shrink-0"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

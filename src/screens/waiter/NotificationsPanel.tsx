import { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, PackageX, Bell, Trash2 } from 'lucide-react';
import { notifications as initialNotifs } from '@/data';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  onGoToTable: (tableNumber: number) => void;
}

const iconMap = {
  ready: { icon: CheckCircle2, color: 'text-status-ready', bg: 'bg-status-ready-bg', border: 'border-status-ready-border' },
  cart_submitted: { icon: Bell, color: 'text-status-occupied', bg: 'bg-status-occupied-bg', border: 'border-status-occupied-border' },
  bill_requested: { icon: AlertCircle, color: 'text-status-cancelled', bg: 'bg-status-cancelled-bg', border: 'border-status-cancelled-border' },
  item_soldout: { icon: PackageX, color: 'text-neutral-500', bg: 'bg-neutral-100', border: 'border-neutral-300' },
};

export function NotificationsPanel({ onGoToTable }: Props) {
  const [notifs, setNotifs] = useState(initialNotifs);

  const dismiss = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifs([]);

  const unread = notifs.filter(n => !n.read);
  const read = notifs.filter(n => n.read);

  return (
    <div className="px-4 lg:px-6 py-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-page-title text-neutral-800">Notifications</h1>
        {notifs.length > 0 && (
          <button onClick={clearAll} className="touch-target flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-status-cancelled hover:bg-status-cancelled-bg rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-500 mb-5">{unread.length} new · {notifs.length} total</p>

      {notifs.length === 0 ? (
        <EmptyState
          title="All caught up"
          message="No notifications right now. New alerts from the kitchen and customer carts will appear here."
          icon={<Bell className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-5 animate-fade-in">
          {unread.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">New</h2>
              <div className="space-y-2">
                {unread.map(n => {
                  const cfg = iconMap[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 ${cfg.border} ${cfg.bg} animate-slide-up cursor-pointer hover:shadow-card transition-all`}
                      onClick={() => n.tableNumber && onGoToTable(n.tableNumber)}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800">{n.title}</p>
                        <p className="text-sm text-neutral-600 mt-0.5">{n.message}</p>
                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {n.time}</p>
                      </div>
                      {n.type === 'ready' && <span className="w-3 h-3 rounded-full bg-status-ready animate-pulse flex-shrink-0 mt-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Earlier</h2>
              <div className="space-y-2">
                {read.map(n => {
                  const cfg = iconMap[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200 bg-white opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700">{n.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {n.time}</p>
                      </div>
                      <button onClick={() => dismiss(n.id)} className="touch-target w-7 h-7 flex items-center justify-center rounded-lg text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

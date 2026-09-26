import { type ReactNode } from 'react';
import { Coffee, ArrowLeft, LogOut } from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';
import type { Role, Notification } from '@/types';
import { useToast, ToastContainer } from '@/components/ui/Toast';

export interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface Props {
  role: Role;
  roleName: string;
  staffName: string;
  navItems: NavItem[];
  activeNav: string;
  onNavClick: (key: string) => void;
  onLogout: () => void;
  notifications?: Notification[];
  onNotificationDismiss?: (id: string) => void;
  showBack?: boolean;
  onBack?: () => void;
  children: ReactNode;
}

const roleColors: Record<Role, string> = {
  waiter: 'bg-brand-600',
  kitchen: 'bg-orange-600',
  billing: 'bg-blue-600',
  admin: 'bg-neutral-800',
  customer: 'bg-brand-600',
};

export function AppShell({
  role,
  roleName,
  staffName,
  navItems,
  activeNav,
  onNavClick,
  onLogout,
  notifications = [],
  onNotificationDismiss,
  showBack,
  onBack,
  children,
}: Props) {
  const { toasts, showToast, closeToast } = useToast();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={onBack}
                className="touch-target w-9 h-9 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className={`w-9 h-9 rounded-lg ${roleColors[role]} flex items-center justify-center text-white`}>
              <Coffee className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-neutral-800 leading-tight">ChiyaQuality</p>
              <p className="text-xs text-neutral-500 leading-tight">{roleName}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => onNavClick(item.key)}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeNav === item.key
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'}
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && onNotificationDismiss && (
              <NotificationBell notifications={notifications} onDismiss={onNotificationDismiss} />
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100">
              <div className={`w-7 h-7 rounded-full ${roleColors[role]} flex items-center justify-center text-white text-xs font-semibold`}>
                {staffName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-neutral-700 font-medium">{staffName}</span>
            </div>
            <button
              onClick={onLogout}
              className="touch-target w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 px-2 py-2 border-t border-neutral-100 overflow-x-auto no-scrollbar">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => onNavClick(item.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0
                ${activeNav === item.key ? 'bg-brand-50 text-brand-700' : 'text-neutral-500'}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </main>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

import {
  TrendingUp, Receipt, Utensils, Users, DollarSign,
  ArrowRight, Clock, AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/status';
import type { NavItem } from '@/components/ui/AppShell';

interface Props {
  onQuickLink: (key: string) => void;
}

const summaryCards = [
  { label: "Today's Revenue", value: 'Rs. 24,850', change: '+12.5%', icon: TrendingUp, color: 'text-status-available', bg: 'bg-status-available-bg' },
  { label: 'Orders Today', value: '87', change: '+8', icon: Receipt, color: 'text-status-ready', bg: 'bg-status-ready-bg' },
  { label: 'Active Tables', value: '9 / 12', change: '75%', icon: Users, color: 'text-status-occupied', bg: 'bg-status-occupied-bg' },
  { label: 'Avg Prep Time', value: '14 min', change: '-2 min', icon: Clock, color: 'text-neutral-600', bg: 'bg-neutral-100' },
];

const topItems = [
  { name: 'Steamed Momo', count: 34, revenue: 4760 },
  { name: 'Milk Tea', count: 52, revenue: 2340 },
  { name: 'Chicken Chowmein', count: 18, revenue: 2160 },
  { name: 'Chilli Momo', count: 12, revenue: 2160 },
  { name: 'Dal Bhat Tarkari', count: 14, revenue: 2100 },
];

const quickLinks: { key: string; label: string; icon: typeof Utensils; desc: string }[] = [
  { key: 'menu', label: 'Menu Management', icon: Utensils, desc: 'Add, edit, or remove items' },
  { key: 'tables', label: 'Table Management', icon: Users, desc: 'Manage tables and QR codes' },
  { key: 'staff', label: 'Staff Management', icon: Users, desc: 'Manage staff accounts' },
  { key: 'payment-qr', label: 'Payment QR', icon: DollarSign, desc: 'Upload business QR image' },
  { key: 'reports', label: 'Reports & Analytics', icon: TrendingUp, desc: 'Sales and performance' },
  { key: 'tax', label: 'Tax & Service Charge', icon: Receipt, desc: 'Configure rates' },
];

export function AdminDashboard({ onQuickLink }: Props) {
  return (
    <div className="px-4 lg:px-6 py-4 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-page-title text-neutral-800">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Wednesday, September 26, 2026</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
                <span className={`text-xs font-semibold ${card.color}`}>{card.change}</span>
              </div>
              <p className="text-xl font-bold text-neutral-800">{card.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-section-header text-neutral-800">Sales This Week</h2>
            <span className="text-xs text-neutral-400">Last 7 days</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {[
              { day: 'Sun', val: 60 },
              { day: 'Mon', val: 45 },
              { day: 'Tue', val: 70 },
              { day: 'Wed', val: 55 },
              { day: 'Thu', val: 80 },
              { day: 'Fri', val: 95 },
              { day: 'Sat', val: 100 },
            ].map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-32">
                  <div
                    className={`w-full max-w-[2.5rem] rounded-t-lg transition-all hover:opacity-80 ${d.day === 'Sat' ? 'bg-brand-600' : 'bg-brand-300'}`}
                    style={{ height: `${d.val}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
            <div>
              <p className="text-xs text-neutral-400">Total this week</p>
              <p className="text-lg font-bold text-neutral-800">{formatCurrency(148200)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400">Best day</p>
              <p className="text-sm font-semibold text-brand-600">Saturday · {formatCurrency(28500)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-section-header text-neutral-800 mb-4">Top Items Today</h2>
          <div className="space-y-3">
            {topItems.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.count} orders</p>
                </div>
                <p className="text-sm font-semibold text-neutral-700">{formatCurrency(item.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-section-header text-neutral-800 mb-3">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.key}
                onClick={() => onQuickLink(link.key)}
                className="touch-target flex items-center gap-3 px-4 py-3.5 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 hover:shadow-card transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">{link.label}</p>
                  <p className="text-xs text-neutral-500">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 px-4 py-3.5 bg-status-ready-bg rounded-xl border border-status-ready-border">
        <AlertCircle className="w-5 h-5 text-status-ready flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-neutral-800">1 item sold out today</p>
          <p className="text-xs text-neutral-500 mt-0.5">Chicken Momo was marked sold out by the kitchen. Consider restocking or adjusting prep volume.</p>
        </div>
      </div>
    </div>
  );
}

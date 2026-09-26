import { useState } from 'react';
import { Download, Calendar, TrendingUp, Utensils, Clock, XCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';

const salesData = [
  { day: 'Mon', val: 55 }, { day: 'Tue', val: 70 }, { day: 'Wed', val: 65 },
  { day: 'Thu', val: 80 }, { day: 'Fri', val: 95 }, { day: 'Sat', val: 100 }, { day: 'Sun', val: 60 },
];

const itemBreakdown = [
  { name: 'Steamed Momo', count: 156, revenue: 21840, pct: 100 },
  { name: 'Milk Tea', count: 240, revenue: 10800, pct: 49 },
  { name: 'Chicken Chowmein', count: 82, revenue: 9840, pct: 45 },
  { name: 'Chilli Momo', count: 56, revenue: 10080, pct: 46 },
  { name: 'Dal Bhat Tarkari', count: 64, revenue: 9600, pct: 44 },
  { name: 'Cappuccino', count: 48, revenue: 4320, pct: 20 },
];

export function Reports() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <div className="px-4 lg:px-6 py-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Reports & Analytics</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Performance insights for your restaurant</p>
        </div>
        <Button variant="secondary" size="sm"><Download className="w-4 h-4" /> Export</Button>
      </div>

      <div className="flex items-center gap-2 mb-5">
        {(['7d', '30d', '90d'] as const).map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`touch-target px-4 py-2 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-brand-600 text-white' : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}>
            {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Revenue', value: formatCurrency(148200), change: '+12.5%', icon: DollarSign, color: 'text-status-available', bg: 'bg-status-available-bg' },
          { label: 'Total Orders', value: '542', change: '+38', icon: TrendingUp, color: 'text-status-ready', bg: 'bg-status-ready-bg' },
          { label: 'Avg Order Value', value: formatCurrency(274), change: '+Rs. 12', icon: Utensils, color: 'text-status-occupied', bg: 'bg-status-occupied-bg' },
          { label: 'Cancellations', value: '8', change: '1.5%', icon: XCircle, color: 'text-status-cancelled', bg: 'bg-status-cancelled-bg' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <p className="text-lg font-bold text-neutral-800">{card.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{card.label}</p>
              <p className={`text-xs font-semibold mt-1 ${card.color}`}>{card.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-section-header text-neutral-800">Daily Sales</h2>
            <span className="text-xs text-neutral-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {range}</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {salesData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-32">
                  <div className="w-full max-w-[2.5rem] rounded-t-lg bg-brand-400 hover:bg-brand-500 transition-colors" style={{ height: `${d.val}%` }} />
                </div>
                <span className="text-xs text-neutral-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h2 className="text-section-header text-neutral-800 mb-4">Item Performance</h2>
          <div className="space-y-3">
            {itemBreakdown.slice(0, 5).map(item => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-700">{item.name}</span>
                  <span className="text-sm font-semibold text-neutral-800">{formatCurrency(item.revenue)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-xs text-neutral-400 w-20 text-right">{item.count} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-status-occupied" />
            <h2 className="text-sm font-semibold text-neutral-800">Average Prep Time</h2>
          </div>
          <p className="text-3xl font-bold text-neutral-800">14<span className="text-lg text-neutral-500"> min</span></p>
          <p className="text-xs text-status-available font-medium mt-1">2 min faster than last week</p>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Momo</span><span className="text-neutral-700">12 min</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Chowmein</span><span className="text-neutral-700">10 min</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Dal Bhat</span><span className="text-neutral-700">18 min</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Beverages</span><span className="text-neutral-700">4 min</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-status-cancelled" />
            <h2 className="text-sm font-semibold text-neutral-800">Cancellations</h2>
          </div>
          <p className="text-3xl font-bold text-neutral-800">8<span className="text-lg text-neutral-500"> orders</span></p>
          <p className="text-xs text-neutral-500 mt-1">1.5% of total orders</p>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Item sold out</span><span className="text-neutral-700">3</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Customer left</span><span className="text-neutral-700">2</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Wrong order</span><span className="text-neutral-700">2</span></div>
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Kitchen error</span><span className="text-neutral-700">1</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

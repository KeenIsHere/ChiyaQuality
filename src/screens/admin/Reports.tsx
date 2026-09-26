import { useEffect, useState } from 'react';
import { Download, Calendar, TrendingUp, Utensils, Clock, XCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function Reports() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, average: 0, cancellations: 0, prepMinutes: 0 });
  const [itemBreakdown, setItemBreakdown] = useState<{ name: string; count: number; revenue: number; pct: number }[]>([]);
  const [salesData, setSalesData] = useState<{ day: string; val: number }[]>([]);

  const exportReport = () => {
    const rows = [['Metric', 'Value'], ['Revenue', String(metrics.revenue)], ['Orders', String(metrics.orders)], ['Average order value', String(metrics.average)], ['Cancellations', String(metrics.cancellations)], ['Average prep minutes', String(metrics.prepMinutes)], ...itemBreakdown.map(item => [`Item: ${item.name}`, `${item.count} portions, ${item.revenue}`])];
    const csv = rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const link = document.createElement('a'); link.href = url; link.download = `chiyaquality-report-${range}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const load = async () => {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const from = new Date(); from.setDate(from.getDate() - days);
      const [{ data: bills }, { data: orders }, { data: orderItems }] = await Promise.all([
        supabase.from('bills').select('total, paid_at').eq('status', 'paid').gte('paid_at', from.toISOString()),
        supabase.from('orders').select('status, confirmed_at, ready_at, placed_at').gte('placed_at', from.toISOString()),
        supabase.from('order_items').select('quantity, menu_items(name, price), orders!inner(status, placed_at)').gte('orders.placed_at', from.toISOString()).in('orders.status', ['confirmed', 'preparing', 'ready', 'served']),
      ]);
      const revenue = (bills || []).reduce((sum, bill) => sum + Number(bill.total), 0);
      const completed = (orders || []).filter(order => ['confirmed', 'preparing', 'ready', 'served'].includes(order.status));
      const prepOrders = (orders || []).filter(order => order.confirmed_at && order.ready_at);
      const prepMinutes = prepOrders.length ? Math.round(prepOrders.reduce((sum, order) => sum + (new Date(order.ready_at).getTime() - new Date(order.confirmed_at).getTime()) / 60000, 0) / prepOrders.length) : 0;
      setMetrics({ revenue, orders: completed.length, average: completed.length ? Math.round(revenue / completed.length) : 0, cancellations: (orders || []).filter(order => ['cancelled', 'rejected'].includes(order.status)).length, prepMinutes });
      const grouped = new Map<string, { count: number; revenue: number }>();
      (orderItems || []).forEach(item => { const menu = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items; if (!menu) return; const current = grouped.get(menu.name) || { count: 0, revenue: 0 }; current.count += item.quantity; current.revenue += item.quantity * Number(menu.price); grouped.set(menu.name, current); });
      const top = [...grouped.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6);
      const max = top[0]?.[1].revenue || 1;
      setItemBreakdown(top.map(([name, value]) => ({ name, ...value, pct: Math.round(value.revenue / max * 100) })));
      const daily = Array.from({ length: Math.min(days, 7) }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (Math.min(days, 7) - 1 - index)); return { day: date.toLocaleDateString([], { weekday: 'short' }), val: 0, date: date.toDateString() }; });
      (bills || []).forEach(bill => { const day = daily.find(entry => entry.date === new Date(bill.paid_at).toDateString()); if (day) day.val += Number(bill.total); });
      const maxDaily = Math.max(...daily.map(day => day.val), 1); setSalesData(daily.map(({ day, val }) => ({ day, val: Math.round(val / maxDaily * 100) })));
    };
    void load();
  }, [range]);

  return (
    <div className="px-4 lg:px-6 py-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Reports & Analytics</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Performance insights for your restaurant</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportReport}><Download className="w-4 h-4" /> Export</Button>
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
          { label: 'Total Revenue', value: formatCurrency(metrics.revenue), change: '', icon: DollarSign, color: 'text-status-available', bg: 'bg-status-available-bg' },
          { label: 'Total Orders', value: String(metrics.orders), change: '', icon: TrendingUp, color: 'text-status-ready', bg: 'bg-status-ready-bg' },
          { label: 'Avg Order Value', value: formatCurrency(metrics.average), change: '', icon: Utensils, color: 'text-status-occupied', bg: 'bg-status-occupied-bg' },
          { label: 'Cancellations', value: String(metrics.cancellations), change: '', icon: XCircle, color: 'text-status-cancelled', bg: 'bg-status-cancelled-bg' },
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
          <p className="text-3xl font-bold text-neutral-800">{metrics.prepMinutes}<span className="text-lg text-neutral-500"> min</span></p>
          <p className="text-xs text-neutral-500 font-medium mt-1">Average confirmed-to-ready time</p>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs"><span className="text-neutral-500">Based on ready orders</span><span className="text-neutral-700">{metrics.prepMinutes} min</span></div>
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

import { useEffect, useState } from 'react';
import { Clock, ChefHat, CheckCircle2, Utensils, AlertTriangle } from 'lucide-react';
import type { KitchenOrder } from '@/types';
import { orderStatusConfig } from '@/lib/status';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/components/ui/useToast';
import { supabase } from '@/lib/supabase';

export function KOTQueue() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const { toasts, showToast, closeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('orders').select('id, status, confirmed_at, table_sessions(tables(table_code)), order_items(quantity, notes, menu_items(name))').in('status', ['confirmed', 'preparing', 'ready', 'served']).order('confirmed_at');
      setOrders((data || []).map(order => {
        const session = Array.isArray(order.table_sessions) ? order.table_sessions[0] : order.table_sessions;
        const table = session && (Array.isArray(session.tables) ? session.tables[0] : session.tables);
        return {
          id: order.id,
          tableNumber: Number.parseInt(table?.table_code || '0', 10),
          items: (order.order_items || []).map(item => { const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items; return { name: menuItem?.name || 'Menu item', quantity: item.quantity, notes: item.notes || '' }; }),
          status: order.status === 'confirmed' ? 'received' : order.status,
          receivedAt: order.confirmed_at ? new Date(order.confirmed_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
          elapsedMin: order.confirmed_at ? Math.max(0, Math.floor((Date.now() - new Date(order.confirmed_at).getTime()) / 60000)) : 0,
        };
      }));
    };
    void load();
    const channel = supabase.channel('kitchen-kot-queue').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { void load(); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const advanceStatus = async (id: string) => {
    const order = orders.find(item => item.id === id);
    if (!order) return;
    if (order.status === 'received') {
      const { error } = await Promise.all([
        supabase.from('orders').update({ status: 'preparing' }).eq('id', id),
        supabase.from('order_items').update({ item_status: 'preparing' }).eq('order_id', id),
      ]).then(results => ({ error: results.find(result => result.error)?.error }));
      if (error) { showToast('error', error.message); return; }
    } else if (order.status === 'preparing') {
      const { error } = await supabase.from('order_items').update({ item_status: 'ready' }).eq('order_id', id);
      if (error) { showToast('error', error.message); return; }
      showToast('success', `Table ${order.tableNumber} order is ready to serve!`);
    } else if (order.status === 'ready') {
      const { error } = await supabase.from('orders').update({ status: 'served', served_at: new Date().toISOString() }).eq('id', id);
      if (error) { showToast('error', error.message); return; }
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');
  const sorted = [...activeOrders].sort((a, b) => {
    const order = { received: 0, preparing: 1, ready: 2 };
    return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
  });

  const counts = {
    received: orders.filter(o => o.status === 'received').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Kitchen Orders</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Live KOT queue · {activeOrders.length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-status-occupied-bg rounded-lg border border-status-occupied-border">
            <Clock className="w-4 h-4 text-status-occupied" />
            <span className="text-sm font-semibold text-status-occupied">{counts.received}</span>
            <span className="text-xs text-status-occupied/70">New</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-status-occupied-bg rounded-lg border border-status-occupied-border">
            <ChefHat className="w-4 h-4 text-status-occupied" />
            <span className="text-sm font-semibold text-status-occupied">{counts.preparing}</span>
            <span className="text-xs text-status-occupied/70">Cooking</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-status-ready-bg rounded-lg border border-status-ready-border">
            <CheckCircle2 className="w-4 h-4 text-status-ready" />
            <span className="text-sm font-semibold text-status-ready">{counts.ready}</span>
            <span className="text-xs text-status-ready/70">Ready</span>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No active orders"
          message="All orders have been served. New orders from the waiter will appear here automatically."
          icon={<Utensils className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
          {sorted.map(order => {
            const cfg = orderStatusConfig[order.status];
            const isReady = order.status === 'ready';
            const isOverdue = order.elapsedMin > 20 && order.status !== 'ready';

            return (
              <div
                key={order.id}
                className={`
                  bg-white rounded-xl border-2 overflow-hidden transition-all
                  ${isReady ? 'border-status-ready-border shadow-card' : isOverdue ? 'border-status-cancelled-border' : 'border-neutral-200'}
                  ${isReady ? 'animate-pulse-ring' : ''}
                `}
              >
                <div className={`flex items-center justify-between px-4 py-3 ${cfg.bgColor} border-b ${cfg.borderColor}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center font-bold text-sm ${cfg.color}`}>
                      T{order.tableNumber}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Table {order.tableNumber}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {order.receivedAt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isOverdue && (
                      <p className="text-xs text-status-cancelled font-semibold flex items-center gap-1 mb-0.5">
                        <AlertTriangle className="w-3 h-3" /> {order.elapsedMin}m
                      </p>
                    )}
                    {!isOverdue && (
                      <p className={`text-lg font-bold ${isOverdue ? 'text-status-cancelled' : order.elapsedMin > 15 ? 'text-status-occupied' : 'text-neutral-700'}`}>
                        {order.elapsedMin}m
                      </p>
                    )}
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>

                <div className="px-4 py-3 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-md bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {item.quantity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-status-occupied bg-status-occupied-bg/50 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 pb-4">
                  <button
                    onClick={() => advanceStatus(order.id)}
                    className={`
                      touch-target w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isReady
                        ? 'bg-status-available text-white hover:bg-green-700'
                        : 'bg-brand-600 text-white hover:bg-brand-700'}
                    `}
                  >
                    {order.status === 'received' && <><ChefHat className="w-4 h-4" /> Start Preparing</>}
                    {order.status === 'preparing' && <><CheckCircle2 className="w-4 h-4" /> Mark as Ready</>}
                    {order.status === 'ready' && <><Utensils className="w-4 h-4" /> Mark as Served</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

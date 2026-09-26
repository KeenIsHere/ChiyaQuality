import { useEffect, useState } from 'react';
import { ArrowLeft, Receipt, Printer } from 'lucide-react';
import type { Table } from '@/types';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface Props {
  table: Table;
  onRecordPayment: () => void;
  onBack: () => void;
}

export function BillDetail({ table, onRecordPayment, onBack }: Props) {
  const [items, setItems] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [bill, setBill] = useState({ subtotal: 0, tax: 0, service: 0, total: 0 });
  useEffect(() => {
    if (!table.currentSessionId) return;
    const load = async () => {
      const [{ data: billRow }, { data: itemRows }] = await Promise.all([
        supabase.from('bills').select('subtotal, tax, service_charge, total').eq('table_session_id', table.currentSessionId).maybeSingle(),
        supabase.from('order_items').select('quantity, notes, menu_items(name, price), orders!inner(table_session_id, status)').eq('orders.table_session_id', table.currentSessionId).in('orders.status', ['confirmed', 'preparing', 'ready', 'served']).neq('item_status', 'unavailable'),
      ]);
      if (billRow) setBill({ subtotal: Number(billRow.subtotal), tax: Number(billRow.tax), service: Number(billRow.service_charge), total: Number(billRow.total) });
      setItems((itemRows || []).map(item => { const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items; return { name: menuItem?.name || 'Menu item', qty: item.quantity, price: Number(menuItem?.price || 0) }; }));
    };
    void load();
  }, [table.currentSessionId]);

  return (
    <div className="px-4 lg:px-6 py-4 max-w-lg mx-auto">
      <button onClick={onBack} className="touch-target flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-slide-up">
        <div className="px-6 py-5 text-center border-b border-neutral-200">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white mx-auto mb-2">
            <Receipt className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-semibold text-neutral-800">ChiyaQuality</h1>
          <p className="text-xs text-neutral-500">Table {table.number} · {table.guests} guests</p>
          <p className="text-xs text-neutral-400 mt-0.5">Table session invoice · {new Date().toLocaleDateString()}</p>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-2.5 mb-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-neutral-100 text-neutral-600 text-xs font-medium flex items-center justify-center">
                    {item.qty}
                  </span>
                  <span className="text-neutral-700">{item.name}</span>
                </div>
                <span className="text-neutral-800 font-medium">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-neutral-200">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="text-neutral-800">{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Tax (13%)</span>
              <span className="text-neutral-800">{formatCurrency(bill.tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Service Charge (10%)</span>
              <span className="text-neutral-800">{formatCurrency(bill.service)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="text-base font-semibold text-neutral-800">Total</span>
              <span className="text-xl font-bold text-brand-600">{formatCurrency(bill.total)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex items-center gap-3">
          <Button variant="secondary" size="lg" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={onRecordPayment}>
            Record Payment
          </Button>
        </div>
      </div>
    </div>
  );
}

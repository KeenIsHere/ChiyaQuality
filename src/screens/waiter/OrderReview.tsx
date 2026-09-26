import { useState } from 'react';
import { Check, Trash2, StickyNote, Send, ShoppingCart, ArrowLeft } from 'lucide-react';
import type { OrderItem, Table } from '@/types';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';

interface Props {
  table: Table;
  items: OrderItem[];
  onConfirm: () => void;
  onBack: () => void;
}

export function OrderReview({ table, items, onConfirm, onBack }: Props) {
  const [localItems, setLocalItems] = useState<OrderItem[]>(items);
  const [notesModalId, setNotesModalId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const subtotal = localItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.1);
  const total = subtotal + serviceCharge;

  const removeItem = (id: string) => setLocalItems(prev => prev.filter(i => i.id !== id));
  const updateNotes = (id: string, notes: string) => setLocalItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i));

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      onConfirm();
    }, 800);
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-2xl mx-auto">
      <button onClick={onBack} className="touch-target flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to menu
      </button>

      <h1 className="text-page-title text-neutral-800 mb-1">Review Order</h1>
      <p className="text-sm text-neutral-500 mb-5">Table {table.number} · {localItems.length} items · {localItems.reduce((s, i) => s + i.quantity, 0)} portions</p>

      {localItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-neutral-200">
          <ShoppingCart className="w-12 h-12 text-neutral-300 mb-3" />
          <p className="text-sm text-neutral-500">No items in this order</p>
          <Button variant="secondary" className="mt-3" onClick={onBack}>Back to menu</Button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 mb-4 animate-fade-in">
            {localItems.map(item => (
              <div key={item.id} className="px-4 py-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {item.quantity}
                    </span>
                    <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 ml-8">{formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}</p>
                  {item.notes && (
                    <p className="text-xs text-brand-600 bg-brand-50 rounded-md px-2 py-1 mt-1.5 ml-8">Note: {item.notes}</p>
                  )}
                  {notesModalId === item.id && (
                    <div className="mt-2 ml-8 animate-slide-down">
                      <textarea
                        value={item.notes}
                        onChange={e => updateNotes(item.id, e.target.value)}
                        placeholder="Special instructions..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end mt-1">
                        <Button size="sm" onClick={() => setNotesModalId(null)}>Done</Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setNotesModalId(notesModalId === item.id ? null : item.id)}
                    className="touch-target w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="touch-target w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-status-cancelled hover:bg-status-cancelled-bg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="text-neutral-800 font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Service Charge (10%)</span>
              <span className="text-neutral-800 font-medium">{formatCurrency(serviceCharge)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <span className="text-base font-semibold text-neutral-800">Total</span>
              <span className="text-lg font-bold text-brand-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button fullWidth size="lg" variant="success" onClick={handleConfirm} disabled={confirming || localItems.length === 0}>
            {confirming ? (
              <>Sending to kitchen...</>
            ) : (
              <><Send className="w-5 h-5" /> Confirm & Send to Kitchen</>
            )}
          </Button>
        </>
      )}
    </div>
  );
}

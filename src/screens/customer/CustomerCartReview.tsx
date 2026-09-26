import { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, Send, ShoppingCart, StickyNote, Coffee } from 'lucide-react';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';
import type { MenuItem } from '@/types';

interface CartEntry {
  item: MenuItem;
  qty: number;
  notes?: string;
}

interface Props {
  tableNumber: number;
  cart: CartEntry[];
  onSubmit: (cart: CartEntry[]) => Promise<void>;
  onBack: () => void;
}

export function CustomerCartReview({ tableNumber, cart: initialCart, onSubmit, onBack }: Props) {
  const [cart, setCart] = useState<CartEntry[]>(initialCart);
  const [notesId, setNotesId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((s, e) => s + e.item.price * e.qty, 0);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(e => e.item.id === itemId ? { ...e, qty: Math.max(0, e.qty + delta) } : e).filter(e => e.qty > 0));
  };

  const removeItem = (itemId: string) => setCart(prev => prev.filter(e => e.item.id !== itemId));

  const updateNotes = (itemId: string, notes: string) => setCart(prev => prev.map(e => e.item.id === itemId ? { ...e, notes } : e));

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center max-w-md mx-auto px-4 text-center">
        <ShoppingCart className="w-16 h-16 text-neutral-300 mb-4" />
        <h1 className="text-lg font-semibold text-neutral-800 mb-1">Your cart is empty</h1>
        <p className="text-sm text-neutral-500 mb-4">Add some items from the menu to get started.</p>
        <Button onClick={onBack}><ArrowLeft className="w-4 h-4" /> Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="touch-target w-9 h-9 flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Your Cart</p>
            <p className="text-xs text-neutral-500">Table {tableNumber}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        <div className="space-y-2.5 mb-4 animate-fade-in">
          {cart.map(entry => (
            <div key={entry.item.id} className="bg-white rounded-xl border border-neutral-200 p-3.5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">{entry.item.name}</p>
                  <p className="text-xs text-neutral-500">{formatCurrency(entry.item.price)} each</p>
                </div>
                <button onClick={() => removeItem(entry.item.id)}
                  className="touch-target w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 hover:text-status-cancelled hover:bg-status-cancelled-bg transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <button onClick={() => updateQty(entry.item.id, -1)}
                    className="touch-target w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 active:bg-neutral-100">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold text-neutral-800 min-w-[1.5rem] text-center">{entry.qty}</span>
                  <button onClick={() => updateQty(entry.item.id, 1)}
                    className="touch-target w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 text-white active:bg-brand-800">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNotesId(notesId === entry.item.id ? null : entry.item.id)}
                    className={`touch-target w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${entry.notes ? 'text-brand-600 bg-brand-50' : 'text-neutral-300 hover:text-brand-600 hover:bg-brand-50'}`}>
                    <StickyNote className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-neutral-800">{formatCurrency(entry.item.price * entry.qty)}</span>
                </div>
              </div>
              {entry.notes && notesId !== entry.item.id && (
                <p className="text-xs text-brand-600 bg-brand-50 rounded-md px-2 py-1 mt-2">Note: {entry.notes}</p>
              )}
              {notesId === entry.item.id && (
                <div className="mt-2 animate-slide-down">
                  <textarea value={entry.notes || ''} onChange={e => updateNotes(entry.item.id, e.target.value)}
                    placeholder="Special requests (e.g. less spicy, no onion)..."
                    rows={2} className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none" autoFocus />
                  <div className="flex justify-end mt-1">
                    <Button size="sm" onClick={() => setNotesId(null)}>Done</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm"><span className="text-neutral-600">Subtotal</span><span className="text-neutral-800">{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-600">Service (10%)</span><span className="text-neutral-800">{formatCurrency(service)}</span></div>
          <div className="flex justify-between pt-2 border-t border-neutral-100">
            <span className="text-base font-semibold text-neutral-800">Total</span>
            <span className="text-lg font-bold text-brand-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 px-3 py-2.5 bg-brand-50 rounded-lg mb-4">
          <Coffee className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-600">Your order will be sent to our waiter for confirmation. You'll see the status update here once reviewed.</p>
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white p-4">
        {error && <p className="text-sm text-status-cancelled mb-3">{error}</p>}
        <Button fullWidth size="lg" disabled={submitting} onClick={async () => {
          setSubmitting(true);
          setError('');
          try {
            await onSubmit(cart);
          } catch (submitError) {
            const message = submitError instanceof Error
              ? submitError.message
              : typeof submitError === 'object' && submitError !== null && 'message' in submitError
                ? String(submitError.message)
                : 'Unable to submit this order.';
            setError(message);
            setSubmitting(false);
          }
        }}>
          <Send className="w-5 h-5" /> {submitting ? 'Submitting...' : 'Submit Order'}
        </Button>
      </div>
    </div>
  );
}

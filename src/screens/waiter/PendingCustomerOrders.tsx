import { useState } from 'react';
import { Check, X, Edit, Clock, ShoppingCart, AlertCircle } from 'lucide-react';
import type { CustomerCart } from '@/types';
import { customerCarts as initialCarts } from '@/data';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast, ToastContainer } from '@/components/ui/Toast';

export function PendingCustomerOrders() {
  const [carts, setCarts] = useState<CustomerCart[]>(initialCarts);
  const [rejectModal, setRejectModal] = useState<CustomerCart | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { toasts, showToast, closeToast } = useToast();

  const pending = carts.filter(c => c.status === 'pending');

  const handleAccept = (cart: CustomerCart) => {
    setCarts(prev => prev.map(c => c.id === cart.id ? { ...c, status: 'confirmed' } : c));
    showToast('success', `Table ${cart.tableNumber} order accepted and sent to kitchen.`);
  };

  const handleReject = () => {
    if (!rejectModal) return;
    setCarts(prev => prev.map(c => c.id === rejectModal.id ? { ...c, status: 'rejected', rejectReason } : c));
    showToast('info', `Table ${rejectModal.tableNumber} order rejected.`);
    setRejectModal(null);
    setRejectReason('');
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-page-title text-neutral-800">Customer Orders</h1>
        {pending.length > 0 && (
          <span className="px-2.5 py-1 bg-status-occupied-bg text-status-occupied text-xs font-semibold rounded-full border border-status-occupied-border animate-pulse">
            {pending.length} pending
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-500 mb-5">Self-placed orders from customer QR scanning</p>

      {pending.length === 0 ? (
        <EmptyState
          title="No pending customer orders"
          message="When customers scan the table QR and submit their cart, it will appear here for your review."
          icon={<ShoppingCart className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-3 animate-fade-in">
          {pending.map(cart => (
            <div key={cart.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-status-occupied-bg/40 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-status-occupied-bg text-status-occupied font-bold flex items-center justify-center text-sm">
                    T{cart.tableNumber}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Table {cart.tableNumber}</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {cart.submittedAt}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-status-occupied-bg text-status-occupied text-xs font-semibold rounded-full border border-status-occupied-border">
                  Pending Review
                </span>
              </div>

              <div className="px-4 py-3">
                <div className="space-y-1.5 mb-3">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700"><span className="font-medium text-neutral-800">{item.quantity}×</span> {item.name}</span>
                      <span className="text-neutral-600">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mb-3">
                  <span className="text-sm font-medium text-neutral-600">Total</span>
                  <span className="text-base font-bold text-brand-600">{formatCurrency(cart.total)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="success" size="md" fullWidth onClick={() => handleAccept(cart)}>
                    <Check className="w-4 h-4" /> Accept
                  </Button>
                  <Button variant="secondary" size="md" onClick={() => showToast('info', 'Edit feature would open the order screen')}>
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                  <Button variant="danger" size="md" onClick={() => setRejectModal(cart)}>
                    <X className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject Customer Order"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}>Reject Order</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 px-3 py-2.5 bg-status-cancelled-bg rounded-lg border border-status-cancelled-border">
            <AlertCircle className="w-5 h-5 text-status-cancelled flex-shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-700">
              The customer at Table {rejectModal?.tableNumber} will be notified and can modify their order.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Item out of stock, kitchen closing..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
            />
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { QrCode, RotateCw } from 'lucide-react';
import type { Table } from '@/types';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface Props {
  table: Table;
  onBack: () => void;
  onMarkPaid: () => Promise<void>;
}

export function PaymentQRScreen({ table, onBack, onMarkPaid }: Props) {
  const [bill, setBill] = useState({ subtotal: 0, tax: 0, service_charge: 0, total: 0 });
  const [paymentQrUrl, setPaymentQrUrl] = useState('');
  const [markingPaid, setMarkingPaid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!table.currentSessionId) return;
    const load = async () => {
      const [{ data: billRow }, { data: settings }] = await Promise.all([
        supabase.from('bills').select('subtotal, tax, service_charge, total').eq('table_session_id', table.currentSessionId).maybeSingle(),
        supabase.from('settings').select('payment_qr_url').eq('id', 1).single(),
      ]);
      if (billRow) setBill({ subtotal: Number(billRow.subtotal), tax: Number(billRow.tax), service_charge: Number(billRow.service_charge), total: Number(billRow.total) });
      setPaymentQrUrl(settings?.payment_qr_url || '');
    };
    void load();
    const channel = supabase.channel(`waiter-bill-${table.currentSessionId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bills', filter: `table_session_id=eq.${table.currentSessionId}` }, payload => {
      setBill({ subtotal: Number(payload.new.subtotal), tax: Number(payload.new.tax), service_charge: Number(payload.new.service_charge), total: Number(payload.new.total) });
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [table.currentSessionId]);

  const markPaid = async () => {
    setMarkingPaid(true); setError('');
    try { await onMarkPaid(); } catch (markError) { setError(markError instanceof Error ? markError.message : 'Unable to mark bill paid.'); setMarkingPaid(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-8 bg-neutral-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-elevated p-6 animate-slide-up">
        <div className="text-center mb-5">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Table {table.number}</p>
          <h1 className="text-2xl font-bold text-neutral-800 mt-1">Payment Due</h1>
        </div>

        <div className="flex items-center justify-center mb-5">
          <div className="w-64 h-64 bg-white border-4 border-neutral-200 rounded-2xl flex items-center justify-center relative">
            {paymentQrUrl ? <img src={paymentQrUrl} alt="Business payment QR" className="w-48 h-48 object-contain" /> : <QrCode className="w-48 h-48 text-neutral-800" strokeWidth={1.5} />}
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-brand-600 rounded-tl-lg" />
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-brand-600 rounded-tr-lg" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-brand-600 rounded-bl-lg" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-brand-600 rounded-br-lg" />
          </div>
        </div>

        <div className="text-center mb-5">
          <p className="text-xs text-neutral-400 mb-1">Scan to pay</p>
          <p className="text-3xl font-bold text-brand-600">{formatCurrency(bill.total)}</p>
        </div>

        <div className="space-y-1.5 px-3 py-3 bg-neutral-50 rounded-xl mb-5">
          <div className="flex justify-between text-xs text-neutral-600"><span>Subtotal</span><span>{formatCurrency(bill.subtotal)}</span></div>
          <div className="flex justify-between text-xs text-neutral-600"><span>Tax</span><span>{formatCurrency(bill.tax)}</span></div>
          <div className="flex justify-between text-xs text-neutral-600"><span>Service</span><span>{formatCurrency(bill.service_charge)}</span></div>
          <div className="flex justify-between text-sm font-semibold text-neutral-800 pt-1.5 border-t border-neutral-200"><span>Total</span><span>{formatCurrency(bill.total)}</span></div>
        </div>

        {error && <p className="text-sm text-status-cancelled mb-3">{error}</p>}
        <div className="space-y-2">
        <Button fullWidth variant="success" disabled={markingPaid || bill.total <= 0} onClick={markPaid}>
          {markingPaid ? 'Updating...' : 'Mark Paid by QR'}
        </Button>
        <Button fullWidth variant="secondary" onClick={onBack}>
          <RotateCw className="w-4 h-4" /> Back to Tables
        </Button>
        </div>
      </div>

      <p className="text-xs text-neutral-400 mt-4 text-center max-w-xs">
        Show this QR to the customer. The large text is readable from any angle across the table.
      </p>
    </div>
  );
}

import { QrCode, RotateCw } from 'lucide-react';
import type { Table } from '@/types';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';

interface Props {
  table: Table;
  onBack: () => void;
}

export function PaymentQRScreen({ table, onBack }: Props) {
  const subtotal = 645;
  const tax = Math.round(subtotal * 0.13);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + tax + service;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-8 bg-neutral-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-elevated p-6 animate-slide-up">
        <div className="text-center mb-5">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Table {table.number}</p>
          <h1 className="text-2xl font-bold text-neutral-800 mt-1">Payment Due</h1>
        </div>

        <div className="flex items-center justify-center mb-5">
          <div className="w-64 h-64 bg-white border-4 border-neutral-200 rounded-2xl flex items-center justify-center relative">
            <QrCode className="w-48 h-48 text-neutral-800" strokeWidth={1.5} />
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-brand-600 rounded-tl-lg" />
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-brand-600 rounded-tr-lg" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-brand-600 rounded-bl-lg" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-brand-600 rounded-br-lg" />
          </div>
        </div>

        <div className="text-center mb-5">
          <p className="text-xs text-neutral-400 mb-1">Scan to pay</p>
          <p className="text-3xl font-bold text-brand-600">{formatCurrency(total)}</p>
        </div>

        <div className="space-y-1.5 px-3 py-3 bg-neutral-50 rounded-xl mb-5">
          <div className="flex justify-between text-xs text-neutral-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-xs text-neutral-600"><span>Tax (13%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between text-xs text-neutral-600"><span>Service (10%)</span><span>{formatCurrency(service)}</span></div>
          <div className="flex justify-between text-sm font-semibold text-neutral-800 pt-1.5 border-t border-neutral-200"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>

        <Button fullWidth variant="secondary" onClick={onBack}>
          <RotateCw className="w-4 h-4" /> Back to Tables
        </Button>
      </div>

      <p className="text-xs text-neutral-400 mt-4 text-center max-w-xs">
        Show this QR to the customer. The large text is readable from any angle across the table.
      </p>
    </div>
  );
}

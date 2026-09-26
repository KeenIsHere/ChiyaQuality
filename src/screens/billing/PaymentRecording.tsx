import { useState } from 'react';
import { ArrowLeft, Banknote, QrCode, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/status';
import { Button } from '@/components/ui/Button';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import type { PaymentMethod } from '@/types';

interface Props {
  total: number;
  onBack: () => void;
  onComplete: () => void;
}

const methods: { value: PaymentMethod; label: string; icon: typeof Banknote; desc: string }[] = [
  { value: 'cash', label: 'Cash', icon: Banknote, desc: 'Record cash payment' },
  { value: 'qr', label: 'QR Payment', icon: QrCode, desc: 'eSewa / Khalti / IME Pay' },
  { value: 'card', label: 'Card', icon: CreditCard, desc: 'Debit or credit card' },
];

export function PaymentRecording({ total, onBack, onComplete }: Props) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toasts, showToast, closeToast } = useToast();

  const handleConfirm = () => {
    if (!selected) return;
    setProcessing(true);
    setTimeout(() => {
      showToast('success', `Payment of ${formatCurrency(total)} recorded successfully.`);
      setProcessing(false);
      onComplete();
    }, 1000);
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-md mx-auto">
      <button onClick={onBack} className="touch-target flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to bill
      </button>

      <h1 className="text-page-title text-neutral-800 mb-1">Record Payment</h1>
      <p className="text-sm text-neutral-500 mb-5">Select payment method to close this session</p>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4 text-center animate-slide-up">
        <p className="text-xs text-neutral-400 uppercase tracking-wide font-medium">Amount Due</p>
        <p className="text-3xl font-bold text-brand-600 mt-1">{formatCurrency(total)}</p>
      </div>

      <div className="space-y-2.5 mb-5">
        {methods.map(method => {
          const Icon = method.icon;
          const isSelected = selected === method.value;
          return (
            <button
              key={method.value}
              onClick={() => setSelected(method.value)}
              className={`
                touch-target w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 bg-white transition-all text-left
                ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-neutral-200 hover:border-neutral-300'}
              `}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-800">{method.label}</p>
                <p className="text-xs text-neutral-500">{method.desc}</p>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
            </button>
          );
        })}
      </div>

      <Button fullWidth size="lg" variant="success" disabled={!selected || processing} onClick={handleConfirm}>
        {processing ? 'Processing...' : <><CheckCircle2 className="w-5 h-5" /> Confirm & Close Session</>}
      </Button>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

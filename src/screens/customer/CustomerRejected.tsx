import { ArrowLeft, RefreshCw, AlertCircle, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  tableNumber: number;
  reason?: string;
  onBackToMenu: () => void;
}

export function CustomerRejected({ tableNumber, reason, onBackToMenu }: Props) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b border-neutral-200">
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-neutral-800">Order Status</p>
          <p className="text-xs text-neutral-500">Table {tableNumber}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="relative w-24 h-24 mb-5">
          <div className="absolute inset-0 rounded-full bg-status-cancelled-bg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <XCircleIcon className="w-12 h-12 text-status-cancelled" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-neutral-800 mb-2 text-center">Order Not Accepted</h1>
        <p className="text-sm text-neutral-500 text-center max-w-xs mb-4">
          Unfortunately, your order couldn't be accepted at this time.
        </p>

        {reason && (
          <div className="w-full bg-status-cancelled-bg rounded-xl border border-status-cancelled-border p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-status-cancelled flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-status-cancelled uppercase tracking-wide mb-1">Reason</p>
                <p className="text-sm text-neutral-700">{reason}</p>
              </div>
            </div>
          </div>
        )}

        <div className="w-full bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="flex items-start gap-2">
            <Coffee className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">What you can do</p>
              <p className="text-sm text-neutral-600">Go back to the menu, adjust your items, and submit again. The waiter will review your new order promptly.</p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          <Button fullWidth size="lg" onClick={onBackToMenu}>
            <RefreshCw className="w-5 h-5" /> Back to Menu
          </Button>
          <Button variant="ghost" fullWidth onClick={onBackToMenu}>
            <ArrowLeft className="w-4 h-4" /> Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return <AlertCircle className={className} />;
}

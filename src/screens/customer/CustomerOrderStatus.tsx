import { useEffect, useState } from 'react';
import { Clock, ChefHat, CheckCircle2, XCircle, Coffee, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface Props {
  tableNumber: number;
  orderId?: string;
  onResubmit: () => void;
}

export function CustomerOrderStatus({ tableNumber, orderId, onResubmit }: Props) {
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');

  useEffect(() => {
    if (isSupabaseConfigured && orderId) {
      let active = true;
      const loadOrder = async () => {
        const { data } = await supabase.from('orders').select('status').eq('id', orderId).maybeSingle();
        if (active && (data?.status === 'confirmed' || data?.status === 'preparing' || data?.status === 'ready' || data?.status === 'served')) {
          setStatus('confirmed');
        }
      };
      void loadOrder();
      const channel = supabase
        .channel(`customer-order-${orderId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, payload => {
          if (payload.new.status === 'confirmed' || payload.new.status === 'preparing' || payload.new.status === 'ready' || payload.new.status === 'served') setStatus('confirmed');
        })
        .subscribe();
      return () => { active = false; void supabase.removeChannel(channel); };
    }
    const timer = setTimeout(() => setStatus('confirmed'), 4000);
    return () => clearTimeout(timer);
  }, [orderId]);

  const steps = [
    { key: 'submitted', label: 'Order Submitted', desc: 'Your order has been sent to the waiter', icon: Coffee },
    { key: 'pending', label: 'Awaiting Confirmation', desc: 'The waiter is reviewing your order', icon: Clock },
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Your order has been accepted and sent to the kitchen', icon: CheckCircle2 },
  ];

  const currentStepIdx = status === 'pending' ? 1 : 2;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b border-neutral-200">
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-neutral-800">Order Status</p>
          <p className="text-xs text-neutral-500">Table {tableNumber}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        {status === 'pending' ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="relative w-24 h-24 mb-5">
              <div className="absolute inset-0 rounded-full bg-status-occupied-bg" />
              <div className="absolute inset-0 rounded-full border-4 border-status-occupied-border animate-ping opacity-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="w-10 h-10 text-status-occupied animate-bounce-subtle" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-neutral-800 mb-1">Waiting for confirmation...</h1>
            <p className="text-sm text-neutral-500 text-center max-w-xs">Our waiter is reviewing your order. This usually takes less than a minute.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="relative w-24 h-24 mb-5">
              <div className="absolute inset-0 rounded-full bg-status-available-bg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-status-available" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-neutral-800 mb-1">Order Confirmed!</h1>
            <p className="text-sm text-neutral-500 text-center max-w-xs">Your order has been accepted and sent to the kitchen. Sit back and relax — we'll bring it to your table.</p>
          </div>
        )}

        <div className="mt-8 space-y-0">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const isPending = idx > currentStepIdx;
            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDone ? 'bg-status-available text-white' : isCurrent ? 'bg-status-occupied-bg text-status-occupied' : 'bg-neutral-100 text-neutral-300'
                  } ${isCurrent && status === 'pending' ? 'animate-pulse' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-0.5 h-8 ${isDone ? 'bg-status-available' : 'bg-neutral-200'}`} />
                  )}
                </div>
                <div className="pt-1.5 pb-6">
                  <p className={`text-sm font-medium ${isPending ? 'text-neutral-400' : 'text-neutral-800'}`}>{step.label}</p>
                  <p className={`text-xs mt-0.5 ${isPending ? 'text-neutral-300' : 'text-neutral-500'}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status === 'confirmed' ? 'bg-neutral-100 text-neutral-300' : 'bg-neutral-100 text-neutral-300'}`}>
                <ChefHat className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1.5">
              <p className="text-sm font-medium text-neutral-400">Preparing</p>
              <p className="text-xs text-neutral-300 mt-0.5">Our kitchen is preparing your food</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white p-4">
        <Button variant="secondary" fullWidth onClick={onResubmit}>
          <RefreshCw className="w-4 h-4" /> Start a New Order
        </Button>
      </div>
    </div>
  );
}

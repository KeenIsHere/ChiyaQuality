import { useEffect, useState } from 'react';
import { Percent, Save, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

export function TaxSettings() {
  const [taxRate, setTaxRate] = useState('13');
  const [serviceRate, setServiceRate] = useState('10');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [serviceEnabled, setServiceEnabled] = useState(true);
  const { toasts, showToast, closeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('settings').select('tax_percent, service_charge_percent').eq('id', 1).single();
      if (error) { showToast('error', error.message); return; }
      setTaxRate(String(data.tax_percent));
      setServiceRate(String(data.service_charge_percent));
      setTaxEnabled(Number(data.tax_percent) > 0);
      setServiceEnabled(Number(data.service_charge_percent) > 0);
    };
    void load();
  }, [showToast]);

  const handleSave = async () => {
    const { error } = await supabase.from('settings').upsert({ id: 1, tax_percent: taxEnabled ? Number(taxRate) || 0 : 0, service_charge_percent: serviceEnabled ? Number(serviceRate) || 0 : 0 });
    if (error) { showToast('error', error.message); return; }
    showToast('success', 'Tax and service charge settings saved.');
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-lg mx-auto">
      <h1 className="text-page-title text-neutral-800 mb-1">Tax & Service Charge</h1>
      <p className="text-sm text-neutral-500 mb-5">Configure rates applied to all bills automatically</p>

      <div className="space-y-4 animate-slide-up">
        <div className={`bg-white rounded-xl border-2 p-5 transition-all ${taxEnabled ? 'border-neutral-200' : 'border-neutral-200 opacity-60'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-ready-bg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-status-ready" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">VAT / Tax</p>
                <p className="text-xs text-neutral-500">Applied to subtotal on every bill</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={taxEnabled} onChange={() => setTaxEnabled(t => !t)} className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-status-available transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
          {taxEnabled && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} min="0" max="100" step="0.5"
                  className="touch-target w-full pr-10 pl-4 py-3 rounded-xl border border-neutral-300 text-lg font-semibold text-neutral-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <span className="text-sm text-neutral-500">%</span>
            </div>
          )}
        </div>

        <div className={`bg-white rounded-xl border-2 p-5 transition-all ${serviceEnabled ? 'border-neutral-200' : 'border-neutral-200 opacity-60'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-occupied-bg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-status-occupied" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">Service Charge</p>
                <p className="text-xs text-neutral-500">Optional gratuity added to every bill</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={serviceEnabled} onChange={() => setServiceEnabled(s => !s)} className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-status-available transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
          {serviceEnabled && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="number" value={serviceRate} onChange={e => setServiceRate(e.target.value)} min="0" max="100" step="0.5"
                  className="touch-target w-full pr-10 pl-4 py-3 rounded-xl border border-neutral-300 text-lg font-semibold text-neutral-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <span className="text-sm text-neutral-500">%</span>
            </div>
          )}
        </div>

        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Example Calculation</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-neutral-600">Subtotal</span><span className="text-neutral-800">Rs. 500</span></div>
            {taxEnabled && <div className="flex justify-between text-sm"><span className="text-neutral-600">Tax ({taxRate}%)</span><span className="text-neutral-800">Rs. {Math.round(500 * parseFloat(taxRate || '0') / 100)}</span></div>}
            {serviceEnabled && <div className="flex justify-between text-sm"><span className="text-neutral-600">Service ({serviceRate}%)</span><span className="text-neutral-800">Rs. {Math.round(500 * parseFloat(serviceRate || '0') / 100)}</span></div>}
            <div className="flex justify-between pt-1.5 border-t border-neutral-200"><span className="text-sm font-semibold text-neutral-800">Total</span><span className="text-base font-bold text-brand-600">Rs. {500 + (taxEnabled ? Math.round(500 * parseFloat(taxRate || '0') / 100) : 0) + (serviceEnabled ? Math.round(500 * parseFloat(serviceRate || '0') / 100) : 0)}</span></div>
          </div>
        </div>

        <Button fullWidth size="lg" onClick={handleSave}><Save className="w-4 h-4" /> Save Settings</Button>
      </div>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

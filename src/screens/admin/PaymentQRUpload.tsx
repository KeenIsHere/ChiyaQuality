import { useEffect, useRef, useState } from 'react';
import { Upload, QrCode, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/components/ui/useToast';
import { supabase } from '@/lib/supabase';

export function PaymentQRUpload() {
  const { toasts, showToast, closeToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase.from('settings').select('payment_qr_url').eq('id', 1).single().then(({ data }) => setCurrentUrl(data?.payment_qr_url || ''));
  }, []);

  const save = async () => {
    if (!file) { showToast('error', 'Choose a QR image first.'); return; }
    if (file.size > 2 * 1024 * 1024) { showToast('error', 'The QR image must be smaller than 2MB.'); return; }
    setSaving(true);
    const path = `payment-qr-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
    const { error: uploadError } = await supabase.storage.from('payment-qr').upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { showToast('error', uploadError.message); setSaving(false); return; }
    const { data } = supabase.storage.from('payment-qr').getPublicUrl(path);
    const { error } = await supabase.from('settings').upsert({ id: 1, payment_qr_url: data.publicUrl });
    if (error) { showToast('error', error.message); setSaving(false); return; }
    setCurrentUrl(data.publicUrl); setFile(null); setSaving(false); showToast('success', 'Payment QR updated successfully.');
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-lg mx-auto">
      <h1 className="text-page-title text-neutral-800 mb-1">Payment QR Code</h1>
      <p className="text-sm text-neutral-500 mb-5">Upload your business payment QR shown to customers on the waiter's tablet</p>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4 animate-slide-up">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-lg bg-status-available-bg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-status-available" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Current QR is active</p>
            <p className="text-xs text-neutral-500">Last updated: Sep 20, 2026</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-6">
          <div className="w-40 h-40 bg-white border-4 border-neutral-200 rounded-2xl flex items-center justify-center mb-3">
            {currentUrl ? <img src={currentUrl} alt="Current payment QR" className="w-32 h-32 object-contain" /> : <QrCode className="w-32 h-32 text-neutral-800" strokeWidth={1.5} />}
          </div>
          <p className="text-xs text-neutral-400">Current QR code preview</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-brand-400 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => setFile(event.target.files?.[0] || null)} />
        <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
          <ImageIcon className="w-7 h-7" />
        </div>
        <p className="text-sm font-medium text-neutral-700">{file ? file.name : 'Tap to upload new QR image'}</p>
        <p className="text-xs text-neutral-400 mt-1">PNG or JPG, max 2MB · Recommended 400×400px</p>
        <Button variant="secondary" size="sm" className="mt-3">
          <Upload className="w-3.5 h-3.5" /> Choose File
        </Button>
      </div>

      <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
        <ImageIcon className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-500">
          This QR image is shown on the waiter's Payment QR screen. Use a high-contrast image of your eSewa, Khalti, or IME Pay QR code for best scanning results.
        </p>
      </div>

      <Button fullWidth size="lg" className="mt-4" disabled={saving} onClick={save}>
        {saving ? 'Uploading...' : 'Save Changes'}
      </Button>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

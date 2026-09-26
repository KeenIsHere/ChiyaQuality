import { Upload, QrCode, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast, ToastContainer } from '@/components/ui/Toast';

export function PaymentQRUpload() {
  const { toasts, showToast, closeToast } = useToast();

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
            <QrCode className="w-32 h-32 text-neutral-800" strokeWidth={1.5} />
          </div>
          <p className="text-xs text-neutral-400">Current QR code preview</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-brand-400 transition-colors cursor-pointer"
        onClick={() => showToast('info', 'File picker would open here.')}
      >
        <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
          <ImageIcon className="w-7 h-7" />
        </div>
        <p className="text-sm font-medium text-neutral-700">Tap to upload new QR image</p>
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

      <Button fullWidth size="lg" className="mt-4" onClick={() => showToast('success', 'Payment QR updated successfully.')}>
        Save Changes
      </Button>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

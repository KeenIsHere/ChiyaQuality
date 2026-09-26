import { useState } from 'react';
import { Coffee, Eye, EyeOff, ChevronRight } from 'lucide-react';
import type { Role } from '@/types';
import { staffAccounts } from '@/data';
import { Button } from '@/components/ui/Button';

interface Props {
  onLogin: (role: Role, name: string) => void;
}

const roleOptions: { value: Role; label: string; desc: string }[] = [
  { value: 'waiter', label: 'Waiter', desc: 'Take orders, manage tables' },
  { value: 'kitchen', label: 'Kitchen', desc: 'View and prepare KOTs' },
  { value: 'billing', label: 'Billing', desc: 'Process payments, invoices' },
  { value: 'admin', label: 'Admin', desc: 'Manage everything' },
];

export function LoginScreen({ onLogin }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError('');
    const sample = staffAccounts.find(s => s.role === role && s.active);
    if (sample) {
      setUsername(sample.username);
      setPin(sample.pin);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError('');
    setLoading(true);

    setTimeout(() => {
      const account = staffAccounts.find(
        s => s.username === username.trim().toLowerCase() && s.pin === pin && s.role === selectedRole && s.active
      );
      if (account) {
        onLogin(account.role, account.name);
      } else {
        setError('Invalid credentials. Check the role and try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-neutral-50 to-brand-100/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg mb-3">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-800">ChiyaQuality</h1>
          <p className="text-sm text-neutral-500 mt-1">Restaurant Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-elevated p-6 animate-slide-up">
          {!selectedRole ? (
            <div>
              <h2 className="text-section-header text-neutral-800 mb-1">Select your role</h2>
              <p className="text-sm text-neutral-500 mb-4">Choose how you want to sign in</p>
              <div className="space-y-2.5">
                {roleOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleRoleSelect(opt.value)}
                    className="touch-target w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-neutral-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-neutral-800">{opt.label}</p>
                      <p className="text-xs text-neutral-500">{opt.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-brand-500 transition-colors" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => onLogin('customer', 'Guest')}
                className="touch-target w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium"
              >
                Customer QR Menu
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => { setSelectedRole(null); setError(''); }}
                  className="touch-target w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors text-sm"
                >
                  ←
                </button>
                <div>
                  <h2 className="text-section-header text-neutral-800 capitalize">{selectedRole} Login</h2>
                  <p className="text-xs text-neutral-500">Enter your credentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. ramesh"
                    className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">PIN</label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      placeholder="4-digit PIN"
                      maxLength={4}
                      className="touch-target w-full px-4 py-3 pr-11 rounded-xl border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 px-3 py-2.5 bg-status-cancelled-bg text-status-cancelled text-sm rounded-lg border border-status-cancelled-border animate-fade-in">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" disabled={loading} className="mt-5">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="text-xs text-neutral-400 text-center mt-3">
                Demo: credentials are pre-filled. Just press Sign In.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">ChiyaQuality RMS · v1.0</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Search, Calendar, Download, Banknote, QrCode, CreditCard, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/status';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import type { Invoice } from '@/types';

const paymentIcons: Record<string, typeof Banknote> = {
  cash: Banknote,
  qr: QrCode,
  card: CreditCard,
};

export function BillingHistory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'paid' | 'void'>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    void supabase.from('bills').select('id, total, payment_method, paid_at, table_sessions(tables(table_code))').eq('status', 'paid').order('paid_at', { ascending: false }).then(({ data }) => {
      setInvoices((data || []).map((bill, index) => { const session = Array.isArray(bill.table_sessions) ? bill.table_sessions[0] : bill.table_sessions; const table = session && (Array.isArray(session.tables) ? session.tables[0] : session.tables); return { id: bill.id, invoiceNo: `INV-${new Date(bill.paid_at).getFullYear()}-${String(index + 1).padStart(4, '0')}`, tableNumber: Number.parseInt(table?.table_code || '0', 10), date: new Date(bill.paid_at).toLocaleString(), total: Number(bill.total), status: 'paid', paymentMethod: bill.payment_method || undefined }; }));
    });
  }, []);

  const filtered = invoices.filter(inv => {
    if (search) {
      const q = search.toLowerCase();
      if (!inv.invoiceNo.toLowerCase().includes(q) && !String(inv.tableNumber).includes(q)) return false;
    }
    if (filter === 'paid' && inv.status !== 'paid') return false;
    if (filter === 'void') return false;
    return true;
  });

  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="px-4 lg:px-6 py-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Billing History</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{invoices.length} invoices · {formatCurrency(totalRevenue)} total collected</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => {}}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by invoice no. or table..."
            className="touch-target w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'today', 'paid', 'void'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                touch-target px-3.5 py-2 rounded-lg text-sm font-medium capitalize transition-all
                ${filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No invoices found"
          message="No invoices match your search. Try different keywords or filters."
          icon={<FileText className="w-8 h-8" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Table</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Method</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Amount</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(inv => {
                const Icon = inv.paymentMethod ? paymentIcons[inv.paymentMethod] : null;
                return (
                  <tr key={inv.id} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-800">{inv.invoiceNo}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">T{inv.tableNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {inv.date}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {Icon ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
                          <Icon className="w-3.5 h-3.5" /> <span className="capitalize">{inv.paymentMethod}</span>
                        </span>
                      ) : <span className="text-xs text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-800 text-right">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === 'paid'
                          ? 'bg-status-available-bg text-status-available border border-status-available-border'
                          : 'bg-status-cancelled-bg text-status-cancelled border border-status-cancelled-border'
                      }`}>
                        {inv.status === 'paid' ? 'Paid' : 'Void'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

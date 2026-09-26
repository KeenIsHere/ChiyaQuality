import { useEffect, useState } from 'react';
import { Receipt, Clock, Users, ArrowRight, TrendingUp } from 'lucide-react';
import type { Table } from '@/types';
import { tableStatusConfig, formatCurrency } from '@/lib/status';
import { TableStatusBadge } from '@/components/ui/TableStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { supabase } from '@/lib/supabase';

interface Props {
  onSelectTable: (table: Table) => void;
}

interface BillingSession extends Table {
  runningTotal: number;
  items: number;
  startTime: string;
}

export function BillingDashboard({ onSelectTable }: Props) {
  const [tables, setTables] = useState<BillingSession[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('tables').select('id, table_code, seats, status, current_session_id, table_sessions(started_at, bills(subtotal, total))').neq('status', 'available').order('table_code');
      setTables((data || []).map(table => {
        const session = Array.isArray(table.table_sessions) ? table.table_sessions[0] : table.table_sessions;
        const bill = session && (Array.isArray(session.bills) ? session.bills[0] : session.bills);
        return { id: table.id, number: Number.parseInt(table.table_code, 10), seats: table.seats, status: table.status, currentSessionId: table.current_session_id, guests: 0, serverName: '', runningTotal: Number(bill?.total || 0), items: 0, startTime: session?.started_at ? new Date(session.started_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '' } as BillingSession;
      }));
    };
    void load();
    const channel = supabase.channel('billing-dashboard').on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => { void load(); }).on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => { void load(); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const activeSessions = tables.filter(t => t.status !== 'available');

  const totalRevenue = activeSessions.reduce((sum, s) => sum + s.runningTotal, 0);
  const billRequested = activeSessions.filter(s => s.status === 'bill_requested').length;

  return (
    <div className="px-4 lg:px-6 py-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Billing Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{activeSessions.length} active sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 text-neutral-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Running Total</span>
          </div>
          <p className="text-xl font-bold text-neutral-800">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 text-neutral-400 mb-1">
            <Receipt className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Active</span>
          </div>
          <p className="text-xl font-bold text-neutral-800">{activeSessions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 text-neutral-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Bill Requested</span>
          </div>
          <p className="text-xl font-bold text-status-cancelled">{billRequested}</p>
        </div>
      </div>

      {activeSessions.length === 0 ? (
        <EmptyState
          title="No active table sessions"
          message="When waiters open tables and place orders, they will appear here for billing."
          icon={<Receipt className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-2.5 animate-fade-in">
          {activeSessions.map(session => {
            const cfg = tableStatusConfig[session.status];
            const isBillRequested = session.status === 'bill_requested';
            return (
              <button
                key={session.id}
                onClick={() => onSelectTable(session)}
                className={`
                  touch-target w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 bg-white
                  transition-all hover:shadow-card-hover hover:-translate-y-0.5 text-left
                  ${isBillRequested ? 'border-status-cancelled-border' : cfg.borderColor}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${cfg.bgColor} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${cfg.color}`}>{session.number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Table {session.number}</p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.guests || 0} guests</span>
                      <span className="flex items-center gap-1"><Receipt className="w-3 h-3" /> {session.items} items</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.startTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-800">{formatCurrency(session.runningTotal)}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <TableStatusBadge status={session.status} />
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-neutral-300" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

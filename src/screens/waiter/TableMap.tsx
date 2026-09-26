import { useEffect, useState } from 'react';
import { Users, Search, Grid3x3 } from 'lucide-react';
import type { Table, TableStatus } from '@/types';
import { tableStatusConfig } from '@/lib/status';
import { TableStatusBadge } from '@/components/ui/TableStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { supabase } from '@/lib/supabase';

interface Props {
  onSelectTable: (table: Table) => void;
}

const statusFilters: { value: TableStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'bill_requested', label: 'Bill' },
];

export function TableMap({ onSelectTable }: Props) {
  const [tables, setTables] = useState<Table[]>([]);
  const [filter, setFilter] = useState<TableStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const mapTable = (table: { id: string; table_code: string; seats: number; status: TableStatus; current_session_id?: string }): Table => ({
      id: table.id,
      number: Number.parseInt(table.table_code, 10) || 0,
      seats: table.seats,
      status: table.status,
      currentSessionId: table.current_session_id,
    });
    const load = async () => {
      const { data } = await supabase.from('tables').select('id, table_code, seats, status, current_session_id').order('table_code');
      if (data) setTables(data.map(mapTable));
    };
    void load();
    const channel = supabase.channel('waiter-table-map').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tables' }, payload => {
      setTables(prev => prev.map(table => table.id === payload.new.id ? mapTable(payload.new as typeof payload.new & { id: string; table_code: string; seats: number; status: TableStatus; current_session_id?: string }) : table));
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const filtered = tables.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !String(t.number).includes(search)) return false;
    return true;
  });

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => ['occupied', 'order_placed', 'preparing', 'served'].includes(t.status)).length,
    ready: tables.filter(t => t.status === 'ready').length,
    bill: tables.filter(t => t.status === 'bill_requested').length,
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Table Map</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{stats.available} available · {stats.occupied} in service · {stats.ready} ready · {stats.bill} bill requested</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Table #"
            className="touch-target w-24 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {statusFilters.map(f => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
            className={`
              touch-target px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0
              ${filter === f.value ? 'bg-brand-600 text-white' : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Updating tables..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tables found"
          message="No tables match the current filter. Try changing the filter or search."
          icon={<Grid3x3 className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-fade-in">
          {filtered.map(table => {
            const cfg = tableStatusConfig[table.status];
            return (
              <button
                key={table.id}
                onClick={() => onSelectTable(table)}
                className={`
                  touch-target relative p-4 rounded-xl border-2 bg-white text-left
                  transition-all hover:shadow-card-hover hover:-translate-y-0.5
                  ${cfg.borderColor}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${cfg.bgColor} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${cfg.color}`}>{table.number}</span>
                  </div>
                  {table.status !== 'available' && (
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor} ${table.status === 'ready' || table.status === 'bill_requested' ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <p className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {table.seats} seats
                </p>
                <TableStatusBadge status={table.status} />
                {table.guests && (
                  <p className="text-xs text-neutral-400 mt-2">{table.guests} guests · {table.serverName}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

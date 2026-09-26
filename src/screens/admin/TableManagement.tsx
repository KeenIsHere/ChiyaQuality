import { useEffect, useState } from 'react';
import { Plus, QrCode, Trash2, Download, Printer, Users } from 'lucide-react';
import { tableStatusConfig } from '@/lib/status';
import { TableStatusBadge } from '@/components/ui/TableStatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import type { Table } from '@/types';
import { supabase } from '@/lib/supabase';

export function TableManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrModal, setQrModal] = useState<Table | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Table | null>(null);
  const [newSeats, setNewSeats] = useState('4');
  const { toasts, showToast, closeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('tables').select('id, table_code, seats, status, qr_token').order('table_code');
      if (error) showToast('error', error.message);
      setTables((data || []).map(table => ({ id: table.id, number: Number.parseInt(table.table_code, 10) || 0, seats: table.seats, status: table.status, qrToken: table.qr_token })));
    };
    void load();
  }, [showToast]);

  const handleAdd = async () => {
    const nextNum = Math.max(0, ...tables.map(t => t.number)) + 1;
    const { data, error } = await supabase.from('tables').insert({ table_code: String(nextNum), seats: parseInt(newSeats, 10) || 4 }).select('id, table_code, seats, status, qr_token').single();
    if (error) { showToast('error', error.message); return; }
    const newTable: Table = { id: data.id, number: Number.parseInt(data.table_code, 10), seats: data.seats, status: data.status, qrToken: data.qr_token };
    setTables(prev => [...prev, newTable].sort((a, b) => a.number - b.number));
    showToast('success', `Table ${nextNum} added.`);
    setAddModal(false);
    setNewSeats('4');
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const { error } = await supabase.from('tables').delete().eq('id', deleteModal.id);
    if (error) { showToast('error', error.message); return; }
    setTables(prev => prev.filter(t => t.id !== deleteModal.id));
    showToast('info', `Table ${deleteModal.number} removed.`);
    setDeleteModal(null);
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Table Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{tables.length} tables configured</p>
        </div>
        <Button onClick={() => setAddModal(true)}><Plus className="w-4 h-4" /> Add Table</Button>
      </div>

      {tables.length === 0 ? (
        <EmptyState
          title="No tables configured"
          message="Add your first table to get started. Each table gets its own QR code for customer ordering."
          icon={<QrCode className="w-8 h-8" />}
          action={<Button onClick={() => setAddModal(true)}><Plus className="w-4 h-4" /> Add Table</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
          {tables.map(table => {
            const cfg = tableStatusConfig[table.status];
            return (
              <div key={table.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl ${cfg.bgColor} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${cfg.color}`}>{table.number}</span>
                  </div>
                  <button
                    onClick={() => setDeleteModal(table)}
                    className="touch-target w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 hover:text-status-cancelled hover:bg-status-cancelled-bg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-neutral-800 mb-1">Table {table.number}</p>
                <p className="text-xs text-neutral-500 flex items-center gap-1 mb-2"><Users className="w-3 h-3" /> {table.seats} seats</p>
                <div className="mb-3"><TableStatusBadge status={table.status} /></div>
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <Button variant="secondary" size="sm" fullWidth onClick={() => setQrModal(table)}>
                    <QrCode className="w-3.5 h-3.5" /> View QR
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!qrModal} onClose={() => setQrModal(null)} title={`Table ${qrModal?.number} — QR Code`} size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => showToast('info', 'Printing...')}><Printer className="w-4 h-4" /> Print</Button>
            <Button onClick={() => showToast('success', 'QR code downloaded.')}> <Download className="w-4 h-4" /> Download</Button>
          </>
        }
      >
        <div className="flex flex-col items-center py-4">
          <div className="w-48 h-48 bg-white border-4 border-neutral-200 rounded-2xl flex items-center justify-center">
            <QrCode className="w-36 h-36 text-neutral-800" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-neutral-800 mt-4">Table {qrModal?.number}</p>
          <p className="text-xs text-neutral-500 mt-1">Scan to view menu and place order</p>
          <p className="text-xs text-neutral-400 mt-2 font-mono break-all">{window.location.origin}/menu/{qrModal?.qrToken}</p>
        </div>
      </Modal>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add New Table" size="sm"
        footer={<><Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button><Button onClick={handleAdd}>Add Table</Button></>}
      >
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Number of Seats</label>
          <input type="number" value={newSeats} onChange={e => setNewSeats(e.target.value)} min="1" max="20"
            className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          <p className="text-xs text-neutral-400 mt-2">Table number is assigned automatically.</p>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Remove Table" size="sm"
        footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}>Remove</Button></>}
      >
        <p className="text-sm text-neutral-600">Remove <span className="font-semibold text-neutral-800">Table {deleteModal?.number}</span>? The associated QR code will stop working.</p>
      </Modal>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

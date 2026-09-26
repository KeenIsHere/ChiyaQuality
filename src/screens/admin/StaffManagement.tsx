import { useEffect, useState } from 'react';
import { Plus, Trash2, UserCog, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/components/ui/useToast';
import type { Role, StaffAccount } from '@/types';
import { supabase } from '@/lib/supabase';

const roleLabels: Record<Role, string> = {
  waiter: 'Waiter', kitchen: 'Kitchen', billing: 'Billing', admin: 'Admin', customer: 'Customer',
};

const roleColors: Record<Role, string> = {
  waiter: 'bg-brand-100 text-brand-700',
  kitchen: 'bg-orange-100 text-orange-700',
  billing: 'bg-blue-100 text-blue-700',
  admin: 'bg-neutral-800 text-white',
  customer: 'bg-neutral-100 text-neutral-600',
};

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState<StaffAccount | null>(null);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<Role>('waiter');
  const [newPin, setNewPin] = useState('');
  const { toasts, showToast, closeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, role, active').order('full_name');
      if (error) { showToast('error', error.message); return; }
      setStaff((data || []).map(profile => ({ id: profile.id, name: profile.full_name, username: profile.full_name, role: profile.role, pin: '', active: profile.active })));
    };
    void load();
  }, [showToast]);

  const handleAdd = async () => {
    if (!newName.trim() || !newUsername.trim() || !newPin.trim()) {
      showToast('error', 'Please fill in all fields.');
      return;
    }
    const { data, error } = await supabase.functions.invoke('create-staff-user', {
      body: { fullName: newName.trim(), email: newUsername.trim().toLowerCase(), password: newPin, role: newRole },
    });
    if (error) { showToast('error', error.message); return; }
    const newStaff: StaffAccount = { id: data.id, name: newName, username: newUsername.toLowerCase(), role: newRole, pin: '', active: true };
    setStaff(prev => [...prev, newStaff]);
    showToast('success', `${newName} added as ${roleLabels[newRole]}.`);
    setAddModal(false);
    setNewName(''); setNewUsername(''); setNewPin(''); setNewRole('waiter');
  };

  const handleToggleActive = async (account: StaffAccount) => {
    const { error } = await supabase.from('profiles').update({ active: !account.active }).eq('id', account.id);
    if (error) { showToast('error', error.message); return; }
    setStaff(prev => prev.map(s => s.id === account.id ? { ...s, active: !s.active } : s));
    showToast('info', `${account.name} ${account.active ? 'deactivated' : 'reactivated'}.`);
    setDeactivateModal(null);
  };

  const grouped = staff.reduce<Record<string, StaffAccount[]>>((acc, s) => {
    (acc[s.role] = acc[s.role] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="px-4 lg:px-6 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Staff Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{staff.filter(s => s.active).length} active · {staff.filter(s => !s.active).length} inactive</p>
        </div>
        <Button onClick={() => setAddModal(true)}><Plus className="w-4 h-4" /> Add Staff</Button>
      </div>

      {staff.length === 0 ? (
        <EmptyState title="No staff accounts" message="Add staff members to give them access to the system." icon={<UserCog className="w-8 h-8" />} />
      ) : (
        <div className="space-y-5 animate-fade-in">
          {(['admin', 'waiter', 'kitchen', 'billing'] as Role[]).map(role => {
            const members = grouped[role];
            if (!members || members.length === 0) return null;
            return (
              <div key={role}>
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  {role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                  {roleLabels[role]} ({members.length})
                </h2>
                <div className="space-y-2">
                  {members.map(member => (
                    <div key={member.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white ${!member.active ? 'opacity-60' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${roleColors[member.role]}`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${member.active ? 'text-neutral-800' : 'text-neutral-500'}`}>{member.name}</p>
                        <p className="text-xs text-neutral-400">@{member.username}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${member.active ? 'bg-status-available-bg text-status-available' : 'bg-neutral-100 text-neutral-500'}`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => setDeactivateModal(member)}
                        className="touch-target w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 hover:text-status-cancelled hover:bg-status-cancelled-bg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Staff Member"
        footer={<><Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button><Button onClick={handleAdd}>Add Staff</Button></>}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Full Name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Hari Bhandari"
              className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email</label>
              <input type="email" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="hari@example.com"
                className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Password</label>
              <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="At least 6 characters"
                className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 tracking-widest" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Role</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value as Role)}
              className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white">
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
              <option value="billing">Billing</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={!!deactivateModal} onClose={() => setDeactivateModal(null)} title={deactivateModal?.active ? 'Deactivate Staff' : 'Reactivate Staff'} size="sm"
        footer={<><Button variant="secondary" onClick={() => setDeactivateModal(null)}>Cancel</Button><Button variant={deactivateModal?.active ? 'danger' : 'success'} onClick={() => deactivateModal && handleToggleActive(deactivateModal)}>{deactivateModal?.active ? 'Deactivate' : 'Reactivate'}</Button></>}
      >
        <p className="text-sm text-neutral-600">{deactivateModal?.active ? 'Deactivate' : 'Reactivate'} <span className="font-semibold text-neutral-800">{deactivateModal?.name}</span>? {deactivateModal?.active ? 'They will lose access immediately.' : 'They will be able to log in again.'}</p>
      </Modal>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

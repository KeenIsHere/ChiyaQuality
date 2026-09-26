import { useState } from 'react';
import { Search, Plus, Edit, Trash2, PackageX } from 'lucide-react';
import { menuItems as initialItems, menuCategories } from '@/data';
import { formatCurrency } from '@/lib/status';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface Props {
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
}

export function MenuManagement({ onAddItem, onEditItem }: Props) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<typeof items[0] | null>(null);
  const { toasts, showToast, closeToast } = useToast();

  const categories = ['all', ...menuCategories];

  const filtered = items.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    return true;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
    showToast('success', `${deleteTarget.name} removed from menu.`);
    setDeleteTarget(null);
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Menu Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{items.length} items across {menuCategories.length} categories</p>
        </div>
        <Button onClick={onAddItem}><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="touch-target w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`touch-target px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No menu items"
          message="No items match your search. Try adding a new item."
          icon={<PackageX className="w-8 h-8" />}
          action={<Button onClick={onAddItem}><Plus className="w-4 h-4" /> Add Item</Button>}
        />
      ) : (
        <div className="space-y-1.5 animate-fade-in">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:shadow-card transition-all">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.available ? 'bg-brand-50 text-brand-600' : 'bg-status-cancelled-bg text-status-cancelled'}`}>
                {item.available ? <span className="text-sm font-bold">{item.name.charAt(0)}</span> : <PackageX className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.available ? 'text-neutral-800' : 'text-neutral-500'}`}>{item.name}</p>
                <p className="text-xs text-neutral-400">{item.category} · {formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditItem(item.id)}
                  className="touch-target w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="touch-target w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-status-cancelled hover:bg-status-cancelled-bg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Menu Item"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          Are you sure you want to remove <span className="font-semibold text-neutral-800">{deleteTarget?.name}</span> from the menu? This cannot be undone.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

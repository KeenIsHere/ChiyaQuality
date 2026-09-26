import { useEffect, useState } from 'react';
import { Search, PackageX, UtensilsCrossed } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import type { MenuItem } from '@/types';

export function ItemAvailability() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toasts, showToast, closeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const [{ data: categories }, { data: rows }] = await Promise.all([
        supabase.from('categories').select('name').order('display_order'),
        supabase.from('menu_items').select('id, name, description, price, image_url, is_available, categories(name)').order('name'),
      ]);
      setMenuCategories((categories || []).map(category => category.name));
      setItems((rows || []).map(item => ({ id: item.id, name: item.name, description: item.description || '', price: Number(item.price), category: Array.isArray(item.categories) && item.categories[0] ? (item.categories[0] as { name?: string }).name || '' : '', image: item.image_url || '', available: item.is_available })));
    };
    void load();
    const channel = supabase.channel('kitchen-menu-availability').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, payload => {
      setItems(prev => prev.map(item => item.id === payload.new.id ? { ...item, available: payload.new.is_available } : item));
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const categories = ['all', ...menuCategories];

  const filtered = items.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    return true;
  });

  const toggleAvailability = async (id: string) => {
    const item = items.find(entry => entry.id === id);
    if (!item) return;
    const { error } = await supabase.from('menu_items').update({ is_available: !item.available }).eq('id', id);
    if (error) { showToast('error', error.message); return; }
    showToast(!item.available ? 'success' : 'info', `${item.name} ${!item.available ? 'available' : 'marked sold out'}`);
  };

  const soldOutCount = items.filter(i => !i.available).length;

  return (
    <div className="px-4 lg:px-6 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-page-title text-neutral-800">Item Availability</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{items.length} items · {soldOutCount} sold out</p>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          className="touch-target w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              touch-target px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
              ${activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}
            `}
          >
            {cat === 'all' ? 'All Items' : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No items found"
          message="No menu items match your search."
          icon={<UtensilsCrossed className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-1.5 animate-fade-in">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border bg-white transition-all ${
                item.available ? 'border-neutral-200' : 'border-status-cancelled-border bg-status-cancelled-bg/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {!item.available && (
                  <div className="w-8 h-8 rounded-lg bg-status-cancelled-bg flex items-center justify-center flex-shrink-0">
                    <PackageX className="w-4 h-4 text-status-cancelled" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${item.available ? 'text-neutral-800' : 'text-neutral-500 line-through'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-400">{item.category}</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={item.available}
                  onChange={() => toggleAvailability(item.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-status-available transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

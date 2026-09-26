import { useEffect, useState } from 'react';
import { Search, Plus, StickyNote, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import type { MenuItem, OrderItem, Table } from '@/types';
import { formatCurrency } from '@/lib/status';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface Props {
  table: Table;
  onProceedToReview: (items: OrderItem[]) => void;
}

export function OrderScreen({ table, onProceedToReview }: Props) {
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [notesModalItem, setNotesModalItem] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: categories }, { data: items }] = await Promise.all([
        supabase.from('categories').select('name').order('display_order'),
        supabase.from('menu_items').select('id, name, description, price, image_url, is_available, categories(name)').eq('is_available', true).order('name'),
      ]);
      const names = (categories || []).map(category => category.name);
      setMenuCategories(names);
      setActiveCategory(current => current || names[0] || '');
      setMenuItems((items || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        category: Array.isArray(item.categories) && item.categories[0] ? (item.categories[0] as { name?: string }).name || '' : '',
        image: item.image_url || '',
        available: item.is_available,
      })));
    };
    void load();
  }, []);

  const items = menuItems.filter(m => {
    if (!m.available) return false;
    if (search) return m.name.toLowerCase().includes(search.toLowerCase());
    return m.category === activeCategory;
  });

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: Date.now().toString(), menuItemId: item.id, name: item.name, price: item.price, quantity: 1, notes: '' }];
    });
  };

  const updateQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== itemId));
    } else {
      setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
    }
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, notes } : i));
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 lg:px-6 py-3 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-page-title text-neutral-800">Table {table.number}</h1>
              <p className="text-sm text-neutral-500">{table.guests || 0} guests · {table.seats} seats</p>
            </div>
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
          {!search && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {menuCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    touch-target px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 lg:px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-neutral-500">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3.5 rounded-xl border border-neutral-200 bg-white hover:shadow-card transition-all"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-semibold text-neutral-800">{item.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{item.description}</p>
                    <p className="text-sm font-medium text-brand-600 mt-1.5">{formatCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="touch-target w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-72 lg:w-80 border-l border-neutral-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Current Order
            </h2>
            <span className="text-xs text-neutral-500">{cartCount} items</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <ShoppingCart className="w-10 h-10 text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-500">Cart is empty</p>
              <p className="text-xs text-neutral-400 mt-1">Tap + on menu items to add</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {cart.map(item => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                      <p className="text-xs text-neutral-500">{formatCurrency(item.price)} each</p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-800">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantityStepper value={item.quantity} onChange={v => updateQty(item.id, v)} size="sm" />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setNotesModalItem(item.id)}
                        className="touch-target w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateQty(item.id, 0)}
                        className="touch-target w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-status-cancelled hover:bg-status-cancelled-bg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-brand-600 bg-brand-50 rounded-md px-2 py-1 mt-2">Note: {item.notes}</p>
                  )}
                  {notesModalItem === item.id && (
                    <div className="mt-2 animate-slide-down">
                      <textarea
                        value={item.notes}
                        onChange={e => updateNotes(item.id, e.target.value)}
                        placeholder="Special instructions..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end mt-1">
                        <Button size="sm" onClick={() => setNotesModalItem(null)}>Done</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Total</span>
            <span className="text-lg font-semibold text-neutral-800">{formatCurrency(cartTotal)}</span>
          </div>
          <Button
            fullWidth
            size="lg"
            disabled={cart.length === 0}
            onClick={() => onProceedToReview(cart)}
          >
            Review Order <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

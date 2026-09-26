import { useEffect, useState } from 'react';
import { Coffee, Search, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/status';
import type { MenuItem } from '@/types';
import { supabase } from '@/lib/supabase';

interface CartEntry {
  item: MenuItem;
  qty: number;
}

interface Props {
  tableNumber: number;
  onCheckout: (cart: CartEntry[]) => void;
}

export function CustomerMenuBrowse({ tableNumber, onCheckout }: Props) {
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: categories }, { data: items }] = await Promise.all([
        supabase.from('categories').select('name').order('display_order'),
        supabase.from('menu_items').select('id, name, description, price, image_url, is_available, categories(name)').eq('is_available', true).order('name'),
      ]);
      const categoryNames = (categories || []).map(category => category.name);
      setMenuCategories(categoryNames);
      setActiveCategory(current => current || categoryNames[0] || '');
      setMenuItems((items || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        category: Array.isArray(item.categories) && item.categories[0]
          ? (item.categories[0] as { name?: string }).name || ''
          : '',
        image: item.image_url || '',
        available: item.is_available,
      })));
      setLoading(false);
    };
    void load();
  }, []);

  const availableItems = menuItems.filter(m => m.available);
  const items = availableItems.filter(m => {
    if (search) return m.name.toLowerCase().includes(search.toLowerCase());
    return m.category === activeCategory;
  });

  const cartCount = cart.reduce((s, e) => s + e.qty, 0);
  const cartTotal = cart.reduce((s, e) => s + e.item.price * e.qty, 0);

  const addToCart = (item: MenuItem) => setCart(prev => {
    const existing = prev.find(e => e.item.id === item.id);
    if (existing) return prev.map(e => e.item.id === item.id ? { ...e, qty: e.qty + 1 } : e);
    return [...prev, { item, qty: 1 }];
  });

  const removeFromCart = (itemId: string) => setCart(prev => prev.map(e => e.item.id === itemId ? { ...e, qty: Math.max(0, e.qty - 1) } : e).filter(e => e.qty > 0));

  const getQty = (itemId: string) => cart.find(e => e.item.id === itemId)?.qty || 0;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col max-w-md mx-auto">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">ChiyaQuality</p>
              <p className="text-xs text-neutral-500">Table {tableNumber}</p>
            </div>
          </div>
          {cartCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">{cartCount}</span>
            </div>
          )}
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the menu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
        </div>
        {!search && (
          <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
            {menuCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-24">
        {loading ? (
          <p className="py-16 text-center text-sm text-neutral-500">Loading menu...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Coffee className="w-12 h-12 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500">No items found</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {items.map(item => {
              const qty = getQty(item.id);
              return (
                <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-3.5 flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-brand-300">{item.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800">{item.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                      <span className="text-sm font-bold text-brand-600 flex-shrink-0">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-0.5 text-xs text-neutral-400">
                        <Star className="w-3 h-3 text-brand-400 fill-brand-400" /> Popular
                      </div>
                      {qty === 0 ? (
                        <button onClick={() => addToCart(item)}
                          className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => removeFromCart(item.id)}
                            className="touch-target w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 active:bg-neutral-100">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-semibold text-neutral-800 min-w-[1.5rem] text-center">{qty}</span>
                          <button onClick={() => addToCart(item)}
                            className="touch-target w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 text-white active:bg-brand-800">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 z-40 animate-slide-up">
          <button onClick={() => onCheckout(cart)}
            className="touch-target w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-brand-600 text-white shadow-elevated hover:bg-brand-700 transition-colors">
            <span className="flex items-center gap-2 text-sm font-medium">
              <ShoppingCart className="w-5 h-5" /> {cartCount} items in cart
            </span>
            <span className="text-base font-bold">{formatCurrency(cartTotal)} →</span>
          </button>
        </div>
      )}
    </div>
  );
}

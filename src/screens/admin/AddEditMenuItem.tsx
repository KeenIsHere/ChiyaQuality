import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/components/ui/useToast';
import { supabase } from '@/lib/supabase';

interface Props {
  itemId?: string;
  onBack: () => void;
}

export function AddEditMenuItem({ itemId, onBack }: Props) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toasts, showToast, closeToast } = useToast();

  const isEdit = !!itemId;

  useEffect(() => {
    const load = async () => {
      const { data: categoryRows, error: categoryError } = await supabase.from('categories').select('id, name').order('display_order');
      if (categoryError) { showToast('error', categoryError.message); return; }
      setCategories(categoryRows || []);
      if (categoryRows?.[0]) setCategory(current => current || categoryRows[0].id);
      if (itemId) {
        const { data: item, error } = await supabase.from('menu_items').select('name, description, price, category_id, is_available, image_url').eq('id', itemId).single();
        if (error) { showToast('error', error.message); return; }
        setName(item.name); setDescription(item.description || ''); setPrice(String(item.price)); setCategory(item.category_id || ''); setAvailable(item.is_available); setImageUrl(item.image_url || '');
      }
    };
    void load();
  }, [itemId, showToast]);

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      showToast('error', 'Please fill in the item name and price.');
      return;
    }
    let nextImageUrl = imageUrl;
    if (imageFile) {
      const path = `menu-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('menu-images').upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      if (uploadError) { showToast('error', uploadError.message); return; }
      nextImageUrl = supabase.storage.from('menu-images').getPublicUrl(path).data.publicUrl;
    }
    const payload = { name: name.trim(), description: description.trim() || null, price: Number(price), category_id: category || null, is_available: available, image_url: nextImageUrl || null };
    const result = itemId
      ? await supabase.from('menu_items').update(payload).eq('id', itemId)
      : await supabase.from('menu_items').insert(payload);
    if (result.error) { showToast('error', result.error.message); return; }
    showToast('success', `${name} ${isEdit ? 'updated' : 'added'} successfully.`);
    onBack();
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-lg mx-auto">
      <button onClick={onBack} className="touch-target flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to menu
      </button>

      <h1 className="text-page-title text-neutral-800 mb-1">{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h1>
      <p className="text-sm text-neutral-500 mb-5">{isEdit ? 'Update item details and availability' : 'Create a new item for your menu'}</p>

      <div className="space-y-4 animate-slide-up">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Item Image</label>
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-brand-400 transition-colors cursor-pointer" onClick={() => imageInputRef.current?.click()}>
            <input ref={imageInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => setImageFile(event.target.files?.[0] || null)} />
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-neutral-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm text-neutral-500">{imageFile?.name || (imageUrl ? 'Current image selected' : 'Tap to upload an image')}</p>
            <p className="text-xs text-neutral-400 mt-0.5">PNG or JPG, max 2MB</p>
            <Button variant="secondary" size="sm" className="mt-3">
              <Upload className="w-3.5 h-3.5" /> Choose File
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Veg Momo"
            className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of the dish..."
            rows={2}
            className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Price (Rs.)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="touch-target w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
            >
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-neutral-200 bg-white">
          <div>
            <p className="text-sm font-medium text-neutral-800">Available for ordering</p>
            <p className="text-xs text-neutral-500">If off, item shows as sold out</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={available} onChange={() => setAvailable(a => !a)} className="sr-only peer" />
            <div className="w-11 h-6 bg-neutral-300 rounded-full peer peer-checked:bg-status-available transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="secondary" size="lg" onClick={onBack}>Cancel</Button>
          <Button size="lg" fullWidth onClick={handleSave}>{isEdit ? 'Save Changes' : 'Add Item'}</Button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

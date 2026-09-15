import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Upload, Loader2, Save, Image as ImageIcon, Pencil } from 'lucide-react';
import { supabase, uploadFile, STORAGE_BUCKETS } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { GalleryItem } from '@/types';
import { EmptyState } from '@/components/ui';

const CATEGORIES = ['Construction', 'Materials', 'Projects', 'Business', 'Products', 'Other'];

export default function AdminGalleryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Construction', image_url: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('gallery').select('*').order('sort_order', { ascending: true });
    setItems((data as GalleryItem[]) || []);
    setLoading(false);
  }

  function openAdd() { setEditing(null); setForm({ title: '', description: '', category: 'Construction', image_url: '' }); setShowForm(true); }
  function openEdit(item: GalleryItem) { setEditing(item); setForm({ title: item.title, description: item.description || '', category: item.category, image_url: item.image_url }); setShowForm(true); }

  async function handleUpload(file: File) {
    setUploading(true);
    const { url, error } = await uploadFile(STORAGE_BUCKETS.GALLERY_IMAGES, file);
    setUploading(false);
    if (error) { showToast('Upload failed.', 'error'); return; }
    if (url) { setForm((p) => ({ ...p, image_url: url })); showToast('Image uploaded.', 'success'); }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.image_url) { showToast('Title and image are required.', 'error'); return; }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('gallery').update({ title: form.title, description: form.description, category: form.category, image_url: form.image_url }).eq('id', editing.id);
      if (error) { showToast('Update failed.', 'error'); setSaving(false); return; }
      showToast('Gallery item updated.', 'success');
    } else {
      const { error } = await supabase.from('gallery').insert({ title: form.title, description: form.description, category: form.category, image_url: form.image_url });
      if (error) { showToast('Failed to add.', 'error'); setSaving(false); return; }
      showToast('Gallery item added.', 'success');
    }
    setSaving(false); setShowForm(false); load();
  }

  async function handleDelete(item: GalleryItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from('gallery').delete().eq('id', item.id);
    if (error) { showToast('Delete failed.', 'error'); return; }
    showToast('Deleted.', 'success'); load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Gallery</h1><p className="text-slate-400 text-sm">Manage your photo gallery</p></div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-gold text-black font-semibold rounded-xl hover:shadow-gold-lg flex items-center gap-2"><Plus className="w-5 h-5" /> Add Image</button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No Gallery Images" message="Upload your first gallery image." action={<button onClick={openAdd} className="px-6 py-3 bg-gradient-gold text-black font-semibold rounded-lg">Add Image</button>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 transition-all">
              <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-gold text-sm font-semibold">{item.title}</p>
                <p className="text-slate-400 text-xs">{item.category}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(item)} className="flex-1 px-2 py-1.5 bg-gold/20 border border-gold/30 text-gold text-xs rounded flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                  <button onClick={() => handleDelete(item)} className="px-2 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-gradient-charcoal border border-gold/20 shadow-dark-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-gold font-bold text-lg">{editing ? 'Edit Image' : 'Add Image'}</h2><button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-gold"><X className="w-6 h-6" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Image title" className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" /></div>
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 resize-none" /></div>
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Image *</label>
                {form.image_url ? (
                  <div className="relative inline-block"><img src={form.image_url} alt="Preview" className="w-32 h-32 rounded-lg object-cover border border-gold/20" /><button onClick={() => setForm({ ...form, image_url: '' })} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"><X className="w-4 h-4" /></button></div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gold/20 hover:border-gold/40 cursor-pointer transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                    {uploading ? <Loader2 className="w-6 h-6 text-gold animate-spin" /> : <><Upload className="w-6 h-6 text-gold mb-2" /><span className="text-slate-400 text-sm">Upload image</span></>}
                  </label>
                )}
              </div>
              <div className="flex gap-3"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10">CANCEL</button><button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

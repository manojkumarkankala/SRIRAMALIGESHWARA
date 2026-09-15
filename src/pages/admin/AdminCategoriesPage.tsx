import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, FolderTree } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Category } from '@/types';
import { EmptyState } from '@/components/ui';

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    setCategories((data as Category[]) || []);
    setLoading(false);
  }

  function openAdd() { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true); }
  function openEdit(cat: Category) { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); setShowForm(true); }

  async function handleSave() {
    if (!form.name.trim()) { showToast('Please enter category name.', 'error'); return; }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('categories').update({ name: form.name, description: form.description }).eq('id', editing.id);
      if (error) { showToast('Failed to update category.', 'error'); setSaving(false); return; }
      await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'update_category', entity_type: 'category', entity_id: editing.id, details: `Updated: ${form.name}` });
      showToast('Category updated.', 'success');
    } else {
      const { error } = await supabase.from('categories').insert({ name: form.name, description: form.description });
      if (error) { showToast('Failed to add category.', 'error'); setSaving(false); return; }
      await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'create_category', entity_type: 'category', details: `Created: ${form.name}` });
      showToast('Category added.', 'success');
    }
    setSaving(false); setShowForm(false); load();
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? Materials in this category will be uncategorized.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) { showToast('Failed to delete category.', 'error'); return; }
    await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'delete_category', entity_type: 'category', entity_id: cat.id, details: `Deleted: ${cat.name}` });
    showToast('Category deleted.', 'success'); load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Categories</h1><p className="text-slate-400 text-sm">Manage material categories</p></div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-gold text-black font-semibold rounded-xl hover:shadow-gold-lg transition-all flex items-center gap-2"><Plus className="w-5 h-5" /> Add Category</button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No Categories" message="Add your first category." action={<button onClick={openAdd} className="px-6 py-3 bg-gradient-gold text-black font-semibold rounded-lg">Add Category</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl bg-gradient-charcoal border border-gold/10 p-5 hover:border-gold/30 transition-all">
              <h3 className="text-gold font-bold text-base mb-1">{cat.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-3">{cat.description || 'No description'}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="flex-1 px-3 py-2 border border-gold/30 text-gold text-sm font-medium rounded-lg hover:bg-gold/10 flex items-center justify-center gap-1.5"><Pencil className="w-4 h-4" /> Edit</button>
                <button onClick={() => handleDelete(cat)} className="px-3 py-2 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-gradient-charcoal border border-gold/20 shadow-dark-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-gold font-bold text-lg">{editing ? 'Edit Category' : 'Add Category'}</h2><button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-gold"><X className="w-6 h-6" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sand" className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" /></div>
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Category description" className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 resize-none" /></div>
              <div className="flex gap-3"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10">CANCEL</button><button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

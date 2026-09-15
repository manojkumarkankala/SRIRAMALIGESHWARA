import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Package, Save } from 'lucide-react';
import { supabase, uploadFile, STORAGE_BUCKETS } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Material, Category, Availability } from '@/types';
import { getAvailabilityLabel, getAvailabilityColor, getAvailabilityDot, parseFeatures } from '@/lib/utils';
import { EmptyState } from '@/components/ui';

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'limited_stock', label: 'Limited Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export default function AdminMaterialsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: 'Contact for Price',
    unit: 'Ton',
    minimum_quantity: '1',
    availability: 'available' as Availability,
    image_url: '',
    features: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [matRes, catRes] = await Promise.all([
      supabase.from('materials').select('*, category:categories(*)').order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    ]);
    setMaterials((matRes.data as Material[]) || []);
    setCategories((catRes.data as Category[]) || []);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', category_id: '', description: '', price: 'Contact for Price', unit: 'Ton', minimum_quantity: '1', availability: 'available', image_url: '', features: '' });
    setShowForm(true);
  }

  function openEdit(mat: Material) {
    setEditing(mat);
    setForm({
      name: mat.name,
      category_id: mat.category_id || '',
      description: mat.description || '',
      price: mat.price || 'Contact for Price',
      unit: mat.unit || 'Ton',
      minimum_quantity: mat.minimum_quantity || '1',
      availability: mat.availability,
      image_url: mat.image_url || '',
      features: mat.features || '',
    });
    setShowForm(true);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    const { url, error } = await uploadFile(STORAGE_BUCKETS.MATERIAL_IMAGES, file);
    setUploading(false);
    if (error) {
      showToast('Failed to upload image.', 'error');
    } else if (url) {
      setForm((prev) => ({ ...prev, image_url: url }));
      showToast('Image uploaded.', 'success');
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('Please enter material name.', 'error');
      return;
    }
    setSaving(true);
    const data = {
      name: form.name,
      category_id: form.category_id || null,
      description: form.description || null,
      price: form.price,
      unit: form.unit,
      minimum_quantity: form.minimum_quantity,
      availability: form.availability,
      image_url: form.image_url || null,
      features: form.features || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from('materials').update(data).eq('id', editing.id);
      if (error) {
        showToast('Failed to update material.', 'error');
        setSaving(false);
        return;
      }
      await supabase.from('admin_audit').insert({
        admin_id: user?.id, action: 'update_material', entity_type: 'material', entity_id: editing.id,
        details: `Updated material: ${form.name}`,
      });
      showToast('Material updated successfully.', 'success');
    } else {
      const { error } = await supabase.from('materials').insert(data);
      if (error) {
        showToast('Failed to add material.', 'error');
        setSaving(false);
        return;
      }
      await supabase.from('admin_audit').insert({
        admin_id: user?.id, action: 'create_material', entity_type: 'material',
        details: `Created material: ${form.name}`,
      });
      showToast('Material added successfully.', 'success');
    }

    setSaving(false);
    setShowForm(false);
    loadData();
  }

  async function handleDelete(mat: Material) {
    if (!confirm(`Delete "${mat.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('materials').delete().eq('id', mat.id);
    if (error) {
      showToast('Failed to delete material.', 'error');
      return;
    }
    await supabase.from('admin_audit').insert({
      admin_id: user?.id, action: 'delete_material', entity_type: 'material', entity_id: mat.id,
      details: `Deleted material: ${mat.name}`,
    });
    showToast('Material deleted.', 'success');
    loadData();
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient-gold mb-2">Material Management</h1>
          <p className="text-slate-400 text-sm">Add, edit, and manage your building materials</p>
        </div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-gold text-black font-semibold rounded-xl hover:shadow-gold-lg transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Material
        </button>
      </div>

      {materials.length === 0 ? (
        <EmptyState icon={Package} title="No Materials" message="Add your first building material to get started." action={<button onClick={openAdd} className="px-6 py-3 bg-gradient-gold text-black font-semibold rounded-lg">Add Material</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <div key={mat.id} className="rounded-2xl bg-gradient-charcoal border border-gold/10 overflow-hidden hover:border-gold/30 transition-all">
              <div className="relative h-40 overflow-hidden">
                {mat.image_url ? (
                  <img src={mat.image_url} alt={mat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Package className="w-12 h-12 text-slate-600" /></div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-gold/20">
                  <span className={`w-2 h-2 rounded-full ${getAvailabilityDot(mat.availability)}`} />
                  <span className={`text-xs font-medium ${getAvailabilityColor(mat.availability)}`}>{getAvailabilityLabel(mat.availability)}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-gold font-bold text-base mb-1">{mat.name}</h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-2">{mat.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span>{mat.price}</span><span>|</span><span>{mat.unit}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(mat)} className="flex-1 px-3 py-2 border border-gold/30 text-gold text-sm font-medium rounded-lg hover:bg-gold/10 transition-colors flex items-center justify-center gap-1.5">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(mat)} className="px-3 py-2 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-gradient-charcoal border border-gold/20 shadow-dark-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gold font-bold text-lg">{editing ? 'Edit Material' : 'Add Material'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-gold"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Material Name *">
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sand" className="form-input" />
                </FormField>
                <FormField label="Category">
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="form-input">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Material description" className="form-input resize-none" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Price">
                  <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Contact for Price" className="form-input" />
                </FormField>
                <FormField label="Unit">
                  <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Ton" className="form-input" />
                </FormField>
                <FormField label="Min. Quantity">
                  <input type="text" value={form.minimum_quantity} onChange={(e) => setForm({ ...form, minimum_quantity: e.target.value })} placeholder="1" className="form-input" />
                </FormField>
              </div>

              <FormField label="Availability">
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value as Availability })} className="form-input">
                  {AVAILABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FormField>

              <FormField label="Features (pipe-separated)">
                <input type="text" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Quality material|Bulk orders|Fast delivery" className="form-input" />
              </FormField>

              <FormField label="Main Image">
                {form.image_url ? (
                  <div className="relative inline-block">
                    <img src={form.image_url} alt="Preview" className="w-32 h-32 rounded-lg object-cover border border-gold/20" />
                    <button onClick={() => setForm({ ...form, image_url: '' })} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gold/20 hover:border-gold/40 cursor-pointer transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                    {uploading ? <Loader2 className="w-6 h-6 text-gold animate-spin" /> : <><Upload className="w-6 h-6 text-gold mb-2" /><span className="text-slate-400 text-sm">Upload image</span></>}
                  </label>
                )}
              </FormField>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10 transition-colors">CANCEL</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE MATERIAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; background: #0f0f0f; border: 1px solid rgba(212,175,55,0.15); color: #e2e8f0; font-size: 0.875rem; transition: border-color 0.2s; }
        .form-input:focus { border-color: rgba(212,175,55,0.5); }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}

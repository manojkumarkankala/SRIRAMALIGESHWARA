import { useEffect, useState } from 'react';
import { Save, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { SiteContent } from '@/types';

export default function AdminSEOPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    seo_title: 'Sri Ramligeshwara Building Materials | Quality Construction Materials',
    seo_description: 'Sri Ramligeshwara Building Materials provides quality sand, iron, rock, cement, bricks, aggregates, tiles and other building materials.',
    seo_keywords: 'Sri Ramligeshwara Building Materials, building materials, sand, cement, bricks, iron, aggregates, tiles, construction materials, sand suppliers, cement suppliers, building materials Telangana, building materials near me',
  });

  useEffect(() => {
    supabase.from('site_content').select('*').eq('section', 'seo').maybeSingle().then(({ data }) => {
      if (data) {
        const d = (data as SiteContent).data as Record<string, string>;
        setForm({
          seo_title: d.seo_title || form.seo_title,
          seo_description: d.seo_description || form.seo_description,
          seo_keywords: d.seo_keywords || form.seo_keywords,
        });
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const existing = await supabase.from('site_content').select('id').eq('section', 'seo').maybeSingle();
    if (existing.data) {
      const { error } = await supabase.from('site_content').update({ data: form, updated_at: new Date().toISOString() }).eq('id', existing.data.id);
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('site_content').insert({ section: 'seo', data: form });
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    }
    await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'update_seo', entity_type: 'site_content', details: 'Updated SEO settings' });
    showToast('SEO settings saved.', 'success');
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">SEO Settings</h1><p className="text-slate-400 text-sm">Optimize your website for search engines</p></div>

      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2"><Search className="w-5 h-5 text-gold" /><h2 className="text-gold font-semibold text-lg">Search Engine Optimization</h2></div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">SEO Title</label>
          <input type="text" value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" />
          <p className="text-slate-500 text-xs mt-1">{form.seo_title.length} characters (recommended: 50-60)</p>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Meta Description</label>
          <textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 resize-none" />
          <p className="text-slate-500 text-xs mt-1">{form.seo_description.length} characters (recommended: 150-160)</p>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Keywords (comma-separated)</label>
          <textarea value={form.seo_keywords} onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 resize-none" />
        </div>

        <div className="rounded-lg bg-[#0f0f0f] border border-gold/10 p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Search Preview</p>
          <p className="text-blue-400 text-base truncate">{form.seo_title}</p>
          <p className="text-emerald-400 text-sm truncate">https://sriramligeshwara.com</p>
          <p className="text-slate-300 text-sm line-clamp-2 mt-1">{form.seo_description}</p>
        </div>

        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE SEO SETTINGS
        </button>
      </div>
    </div>
  );
}

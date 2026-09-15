import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, Loader2, Video as VideoIcon, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getYouTubeThumb } from '@/lib/utils';
import type { Video } from '@/types';
import { EmptyState } from '@/components/ui';

const CATEGORIES = ['Construction', 'Materials', 'Projects', 'Business', 'Other'];

export default function AdminVideosPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'Construction' });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('videos').select('*').order('sort_order', { ascending: true });
    setVideos((data as Video[]) || []);
    setLoading(false);
  }

  function openAdd() { setEditing(null); setForm({ title: '', description: '', video_url: '', thumbnail_url: '', category: 'Construction' }); setShowForm(true); }
  function openEdit(v: Video) { setEditing(v); setForm({ title: v.title, description: v.description || '', video_url: v.video_url, thumbnail_url: v.thumbnail_url || '', category: v.category }); setShowForm(true); }

  async function handleSave() {
    if (!form.title.trim() || !form.video_url.trim()) { showToast('Title and video URL are required.', 'error'); return; }
    const thumb = form.thumbnail_url || getYouTubeThumb(form.video_url);
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('videos').update({ title: form.title, description: form.description, video_url: form.video_url, thumbnail_url: thumb, category: form.category }).eq('id', editing.id);
      if (error) { showToast('Update failed.', 'error'); setSaving(false); return; }
      showToast('Video updated.', 'success');
    } else {
      const { error } = await supabase.from('videos').insert({ title: form.title, description: form.description, video_url: form.video_url, thumbnail_url: thumb, category: form.category });
      if (error) { showToast('Failed to add.', 'error'); setSaving(false); return; }
      showToast('Video added.', 'success');
    }
    setSaving(false); setShowForm(false); load();
  }

  async function handleDelete(v: Video) {
    if (!confirm(`Delete "${v.title}"?`)) return;
    const { error } = await supabase.from('videos').delete().eq('id', v.id);
    if (error) { showToast('Delete failed.', 'error'); return; }
    showToast('Deleted.', 'success'); load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Videos</h1><p className="text-slate-400 text-sm">Manage your video gallery</p></div>
        <button onClick={openAdd} className="px-5 py-3 bg-gradient-gold text-black font-semibold rounded-xl hover:shadow-gold-lg flex items-center gap-2"><Plus className="w-5 h-5" /> Add Video</button>
      </div>

      {videos.length === 0 ? (
        <EmptyState icon={VideoIcon} title="No Videos" message="Add your first video." action={<button onClick={openAdd} className="px-6 py-3 bg-gradient-gold text-black font-semibold rounded-lg">Add Video</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <div key={v.id} className="rounded-xl bg-gradient-charcoal border border-gold/10 overflow-hidden hover:border-gold/30 transition-all">
              <div className="relative h-40 overflow-hidden">
                {v.thumbnail_url ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><VideoIcon className="w-12 h-12 text-slate-600" /></div>}
              </div>
              <div className="p-4">
                <h3 className="text-gold font-bold text-sm mb-1">{v.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-1 mb-3">{v.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(v)} className="flex-1 px-3 py-2 border border-gold/30 text-gold text-sm rounded-lg hover:bg-gold/10 flex items-center justify-center gap-1.5"><Pencil className="w-4 h-4" /> Edit</button>
                  <button onClick={() => handleDelete(v)} className="px-3 py-2 border border-red-500/30 text-red-400 text-sm rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-gradient-charcoal border border-gold/20 shadow-dark-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-gold font-bold text-lg">{editing ? 'Edit Video' : 'Add Video'}</h2><button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-gold"><X className="w-6 h-6" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" /></div>
              <div><label className="block text-slate-300 text-sm font-medium mb-2">YouTube URL *</label><input type="text" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" /></div>
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 resize-none" /></div>
              <div><label className="block text-slate-300 text-sm font-medium mb-2">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="flex gap-3"><button onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10">CANCEL</button><button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

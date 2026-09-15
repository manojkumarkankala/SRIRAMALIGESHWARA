import { useEffect, useState } from 'react';
import { Save, Loader2, FileText, Upload, X } from 'lucide-react';
import { supabase, uploadFile, STORAGE_BUCKETS } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import type { SiteContent } from '@/types';

export default function AdminContentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { content, refresh } = useSettings();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '', tagline: '' });
  const [aboutForm, setAboutForm] = useState({ title: '', content: '', image_url: '' });
  const [footerForm, setFooterForm] = useState({ content: '' });
  const [announcementForm, setAnnouncementForm] = useState({ content: '', active: true });

  useEffect(() => {
    const hero = content['hero'];
    if (hero) {
      setHeroForm({
        title: hero.title || '',
        subtitle: (hero.data as Record<string, string>)?.subtitle || '',
        tagline: hero.content || '',
      });
    }
    const about = content['about'];
    if (about) {
      setAboutForm({
        title: about.title || '',
        content: about.content || '',
        image_url: (about.data as Record<string, string>)?.image_url || '',
      });
    }
    const footer = content['footer'];
    if (footer) setFooterForm({ content: footer.content || '' });
    const announcement = content['announcement'];
    if (announcement) {
      setAnnouncementForm({ content: announcement.content || '', active: (announcement.data as Record<string, boolean>)?.active ?? true });
    }
  }, [content]);

  async function saveSection(section: string, data: Record<string, unknown>, title?: string, contentText?: string, image_url?: string) {
    setSaving(true);
    const existing = content[section];
    if (existing) {
      const { error } = await supabase.from('site_content').update({
        ...(title !== undefined && { title }),
        ...(contentText !== undefined && { content: contentText }),
        ...(image_url !== undefined && { image_url }),
        data,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('site_content').insert({
        section, title: title || null, content: contentText || null, image_url: image_url || null, data,
      });
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    }
    await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'update_content', entity_type: 'site_content', details: `Updated section: ${section}` });
    showToast('Content saved successfully.', 'success');
    setSaving(false);
    refresh();
  }

  async function handleAboutImageUpload(file: File) {
    setUploading(true);
    const { url, error } = await uploadFile(STORAGE_BUCKETS.BUSINESS_IMAGES, file);
    setUploading(false);
    if (error) { showToast('Upload failed.', 'error'); return; }
    if (url) { setAboutForm((p) => ({ ...p, image_url: url })); showToast('Image uploaded.', 'success'); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Website Content</h1><p className="text-slate-400 text-sm">Edit your website content without touching code</p></div>

      {/* Hero Section */}
      <SectionCard title="Hero Section" icon={FileText}>
        <div className="space-y-4">
          <FormField label="Hero Title"><input type="text" value={heroForm.title} onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })} className="form-input" /></FormField>
          <FormField label="Hero Subtitle"><input type="text" value={heroForm.subtitle} onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })} className="form-input" /></FormField>
          <FormField label="Tagline"><input type="text" value={heroForm.tagline} onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })} className="form-input" /></FormField>
          <SaveButton onClick={() => saveSection('hero', { subtitle: heroForm.subtitle }, heroForm.title, heroForm.tagline)} saving={saving} />
        </div>
      </SectionCard>

      {/* About Section */}
      <SectionCard title="About Section" icon={FileText}>
        <div className="space-y-4">
          <FormField label="About Title"><input type="text" value={aboutForm.title} onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })} className="form-input" /></FormField>
          <FormField label="About Content"><textarea value={aboutForm.content} onChange={(e) => setAboutForm({ ...aboutForm, content: e.target.value })} rows={6} className="form-input resize-none" /></FormField>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">About Image</label>
            {aboutForm.image_url ? (
              <div className="relative inline-block"><img src={aboutForm.image_url} alt="About" className="w-40 h-32 rounded-lg object-cover border border-gold/20" /><button onClick={() => setAboutForm({ ...aboutForm, image_url: '' })} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"><X className="w-4 h-4" /></button></div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gold/20 hover:border-gold/40 cursor-pointer transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAboutImageUpload(f); }} />
                {uploading ? <Loader2 className="w-6 h-6 text-gold animate-spin" /> : <><Upload className="w-6 h-6 text-gold mb-2" /><span className="text-slate-400 text-sm">Upload image</span></>}
              </label>
            )}
          </div>
          <SaveButton onClick={() => saveSection('about', { image_url: aboutForm.image_url }, aboutForm.title, aboutForm.content)} saving={saving} />
        </div>
      </SectionCard>

      {/* Announcement */}
      <SectionCard title="Announcement Bar" icon={FileText}>
        <div className="space-y-4">
          <FormField label="Announcement Text"><input type="text" value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} className="form-input" /></FormField>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={announcementForm.active} onChange={(e) => setAnnouncementForm({ ...announcementForm, active: e.target.checked })} className="w-5 h-5 accent-amber-500" />
              <span className="text-slate-300 text-sm">Show announcement bar on homepage</span>
            </label>
          </div>
          <SaveButton onClick={() => saveSection('announcement', { active: announcementForm.active }, undefined, announcementForm.content)} saving={saving} />
        </div>
      </SectionCard>

      {/* Footer */}
      <SectionCard title="Footer Content" icon={FileText}>
        <div className="space-y-4">
          <FormField label="Footer Tagline"><input type="text" value={footerForm.content} onChange={(e) => setFooterForm({ ...footerForm, content: e.target.value })} className="form-input" /></FormField>
          <SaveButton onClick={() => saveSection('footer', {}, undefined, footerForm.content)} saving={saving} />
        </div>
      </SectionCard>

      <style>{`.form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; background: #0f0f0f; border: 1px solid rgba(212,175,55,0.15); color: #e2e8f0; font-size: 0.875rem; } .form-input:focus { border-color: rgba(212,175,55,0.5); }`}</style>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6">
      <div className="flex items-center gap-3 mb-5"><Icon className="w-5 h-5 text-gold" /><h2 className="text-gold font-semibold text-lg">{title}</h2></div>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>{children}</div>;
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return <button onClick={onClick} disabled={saving} className="px-6 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE CHANGES</button>;
}

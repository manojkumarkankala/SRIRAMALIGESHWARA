import { useEffect, useState } from 'react';
import { Save, Loader2, Lock, Instagram, Facebook, Youtube, Upload, X } from 'lucide-react';
import { supabase, uploadFile, STORAGE_BUCKETS } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { contact, refresh } = useSettings();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ new: '', confirm: '' });
  const [changingPwd, setChangingPwd] = useState(false);

  const [form, setForm] = useState({
    instagram: '',
    facebook: '',
    youtube: '',
    logo_url: '',
    hero_image_url: '',
  });

  useEffect(() => {
    if (contact) {
      setForm({
        instagram: contact.instagram || '',
        facebook: contact.facebook || '',
        youtube: contact.youtube || '',
        logo_url: contact.logo_url || '',
        hero_image_url: contact.hero_image_url || '',
      });
    }
  }, [contact]);

  async function handleSave() {
    setSaving(true);
    if (contact) {
      const { error } = await supabase.from('contact_settings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', contact.id);
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    }
    await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'update_settings', entity_type: 'contact_settings', details: 'Updated social media and image settings' });
    showToast('Settings saved.', 'success');
    setSaving(false);
    refresh();
  }

  async function handleImageUpload(field: 'logo_url' | 'hero_image_url', file: File) {
    setUploading(true);
    const { url, error } = await uploadFile(STORAGE_BUCKETS.BUSINESS_IMAGES, file);
    setUploading(false);
    if (error) { showToast('Upload failed.', 'error'); return; }
    if (url) { setForm((p) => ({ ...p, [field]: url })); showToast('Image uploaded.', 'success'); }
  }

  async function handleChangePassword() {
    if (!pwdForm.new || pwdForm.new.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }
    if (pwdForm.new !== pwdForm.confirm) { showToast('Passwords do not match.', 'error'); return; }
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwdForm.new });
    setChangingPwd(false);
    if (error) { showToast('Failed to change password.', 'error'); return; }
    showToast('Password changed successfully.', 'success');
    setPwdForm({ new: '', confirm: '' });
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Settings</h1><p className="text-slate-400 text-sm">Manage social media, images, and password</p></div>

      {/* Social Media */}
      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6 space-y-4">
        <h2 className="text-gold font-semibold text-lg">Social Media</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Instagram URL</label>
            <div className="relative"><Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" /></div>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Facebook URL</label>
            <div className="relative"><Facebook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="text" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" /></div>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">YouTube URL</label>
            <div className="relative"><Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="text" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="https://youtube.com/..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" /></div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6 space-y-4">
        <h2 className="text-gold font-semibold text-lg">Business Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Logo Image</label>
            {form.logo_url ? (
              <div className="relative inline-block"><img src={form.logo_url} alt="Logo" className="w-32 h-32 rounded-lg object-cover border border-gold/20" /><button onClick={() => setForm({ ...form, logo_url: '' })} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"><X className="w-4 h-4" /></button></div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gold/20 hover:border-gold/40 cursor-pointer transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload('logo_url', f); }} />
                {uploading ? <Loader2 className="w-6 h-6 text-gold animate-spin" /> : <><Upload className="w-6 h-6 text-gold mb-2" /><span className="text-slate-400 text-sm">Upload logo</span></>}
              </label>
            )}
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Hero Image</label>
            {form.hero_image_url ? (
              <div className="relative inline-block"><img src={form.hero_image_url} alt="Hero" className="w-48 h-32 rounded-lg object-cover border border-gold/20" /><button onClick={() => setForm({ ...form, hero_image_url: '' })} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center"><X className="w-4 h-4" /></button></div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gold/20 hover:border-gold/40 cursor-pointer transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload('hero_image_url', f); }} />
                {uploading ? <Loader2 className="w-6 h-6 text-gold animate-spin" /> : <><Upload className="w-6 h-6 text-gold mb-2" /><span className="text-slate-400 text-sm">Upload hero image</span></>}
              </label>
            )}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE SETTINGS
        </button>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6 space-y-4">
        <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-gold" /><h2 className="text-gold font-semibold text-lg">Change Password</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">New Password</label>
            <input type="password" value={pwdForm.new} onChange={(e) => setPwdForm({ ...pwdForm, new: e.target.value })} placeholder="Enter new password" className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
            <input type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} placeholder="Confirm new password" className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" />
          </div>
        </div>
        <button onClick={handleChangePassword} disabled={changingPwd} className="px-6 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {changingPwd ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />} CHANGE PASSWORD
        </button>
      </div>
    </div>
  );
}

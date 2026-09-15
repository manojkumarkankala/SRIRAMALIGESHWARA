import { useEffect, useState } from 'react';
import { Save, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';

export default function AdminLocationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { contact, refresh } = useSettings();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ latitude: '', longitude: '', maps_url: '', address: '' });

  useEffect(() => {
    if (contact) {
      setForm({ latitude: contact.latitude || '', longitude: contact.longitude || '', maps_url: contact.maps_url || '', address: contact.address || '' });
    }
  }, [contact]);

  async function handleSave() {
    setSaving(true);
    if (contact) {
      const { error } = await supabase.from('contact_settings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', contact.id);
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    }
    await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'update_location', entity_type: 'contact_settings', details: 'Updated location settings' });
    showToast('Location saved.', 'success');
    setSaving(false);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Location</h1><p className="text-slate-400 text-sm">Update your business location and map settings</p></div>

      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6 space-y-4">
        <Field label="Address"><textarea className="form-input resize-none" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Latitude"><input className="form-input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. 17.2861" /></Field>
          <Field label="Longitude"><input className="form-input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. 78.9242" /></Field>
        </div>
        <Field label="Google Maps URL"><input className="form-input" value={form.maps_url} onChange={(e) => setForm({ ...form, maps_url: e.target.value })} placeholder="https://www.google.com/maps/..." /></Field>

        {form.latitude && form.longitude && (
          <div className="rounded-xl overflow-hidden border border-gold/20">
            <iframe src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&z=15&output=embed`} className="w-full h-64" title="Location Preview" loading="lazy" />
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE LOCATION
        </button>
      </div>

      <style>{`.form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; background: #0f0f0f; border: 1px solid rgba(212,175,55,0.15); color: #e2e8f0; font-size: 0.875rem; } .form-input:focus { border-color: rgba(212,175,55,0.5); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>{children}</div>;
}

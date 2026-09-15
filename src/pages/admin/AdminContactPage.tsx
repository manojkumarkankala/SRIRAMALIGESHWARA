import { useEffect, useState } from 'react';
import { Save, Loader2, Phone, MessageCircle, Mail, MapPin, Trash2, Eye, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import type { ContactSettings, ContactMessage } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function AdminContactPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { contact, refresh } = useSettings();
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [form, setForm] = useState<Partial<ContactSettings>>({});

  useEffect(() => {
    if (contact) {
      setForm({
        business_name: contact.business_name,
        contact_person_1: contact.contact_person_1,
        phone_1: contact.phone_1,
        contact_person_2: contact.contact_person_2,
        phone_2: contact.phone_2,
        whatsapp: contact.whatsapp,
        email: contact.email,
        address: contact.address,
        village: contact.village,
        mandal: contact.mandal,
        district: contact.district,
        state: contact.state,
        pincode: contact.pincode,
      });
    }
  }, [contact]);

  useEffect(() => {
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setMessages((data as ContactMessage[]) || []);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    if (contact) {
      const { error } = await supabase.from('contact_settings').update({ ...form, updated_at: new Date().toISOString() }).eq('id', contact.id);
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('contact_settings').insert(form);
      if (error) { showToast('Failed to save.', 'error'); setSaving(false); return; }
    }
    await supabase.from('admin_audit').insert({ admin_id: user?.id, action: 'update_contact', entity_type: 'contact_settings', details: 'Updated contact settings' });
    showToast('Contact settings saved.', 'success');
    setSaving(false);
    refresh();
  }

  async function deleteMessage(id: string) {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) { showToast('Failed to delete.', 'error'); return; }
    setMessages(messages.filter((m) => m.id !== id));
    showToast('Message deleted.', 'success');
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Contact Settings</h1><p className="text-slate-400 text-sm">Update your business contact information</p></div>

      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6 space-y-4">
        <h2 className="text-gold font-semibold text-lg">Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name"><input className="form-input" value={form.business_name || ''} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></Field>
          <Field label="Email"><input className="form-input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Person 1"><input className="form-input" value={form.contact_person_1 || ''} onChange={(e) => setForm({ ...form, contact_person_1: e.target.value })} /></Field>
          <Field label="Phone 1"><input className="form-input" value={form.phone_1 || ''} onChange={(e) => setForm({ ...form, phone_1: e.target.value })} /></Field>
          <Field label="Contact Person 2"><input className="form-input" value={form.contact_person_2 || ''} onChange={(e) => setForm({ ...form, contact_person_2: e.target.value })} /></Field>
          <Field label="Phone 2"><input className="form-input" value={form.phone_2 || ''} onChange={(e) => setForm({ ...form, phone_2: e.target.value })} /></Field>
        </div>
        <Field label="WhatsApp Number (with country code, e.g. 919666005044)"><input className="form-input" value={form.whatsapp || ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></Field>
        <h2 className="text-gold font-semibold text-lg pt-4">Address</h2>
        <Field label="Full Address"><textarea className="form-input resize-none" rows={2} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Village"><input className="form-input" value={form.village || ''} onChange={(e) => setForm({ ...form, village: e.target.value })} /></Field>
          <Field label="Mandal"><input className="form-input" value={form.mandal || ''} onChange={(e) => setForm({ ...form, mandal: e.target.value })} /></Field>
          <Field label="District"><input className="form-input" value={form.district || ''} onChange={(e) => setForm({ ...form, district: e.target.value })} /></Field>
          <Field label="State"><input className="form-input" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
        </div>
        <Field label="PIN Code"><input className="form-input" value={form.pincode || ''} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></Field>
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-gradient-gold text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} SAVE CHANGES</button>
      </div>

      {/* Contact enquiries */}
      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6">
        <h2 className="text-gold font-semibold text-lg mb-4">Contact Enquiries ({messages.length})</h2>
        {messages.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No enquiries yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 rounded-lg bg-[#0f0f0f] border border-gold/5">
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-slate-200 font-medium text-sm">{msg.name}</p><p className="text-slate-500 text-xs">{msg.mobile}</p></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${msg.status === 'new' ? 'bg-amber-500/10 text-amber-400' : msg.status === 'read' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{msg.status}</span>
                </div>
                <p className="text-slate-300 text-sm mb-2">{msg.message}</p>
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-xs">{formatDateTime(msg.created_at)}</p>
                  <button onClick={() => deleteMessage(msg.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`.form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; background: #0f0f0f; border: 1px solid rgba(212,175,55,0.15); color: #e2e8f0; font-size: 0.875rem; } .form-input:focus { border-color: rgba(212,175,55,0.5); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>{children}</div>;
}

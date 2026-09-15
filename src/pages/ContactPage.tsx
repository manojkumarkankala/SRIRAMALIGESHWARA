import { useState } from 'react';
import { Phone, MessageCircle, MapPin, Mail, Send, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/context/ToastContext';
import { getWhatsAppUrl, getWhatsAppGenericMessage, validateMobile } from '@/lib/utils';
import { SectionHeading } from '@/components/ui';

export default function ContactPage() {
  const { contact } = useSettings();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const phone1 = contact?.phone_1 || '8185817805';
  const phone2 = contact?.phone_2 || '9666005044';
  const person1 = contact?.contact_person_1 || 'J. Srinkath';
  const person2 = contact?.contact_person_2 || 'B. Manikanta';
  const businessName = contact?.business_name || 'Sri Ramligeshwara Building Materials';

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!form.mobile.trim()) e.mobile = 'Please enter your mobile number.';
    else if (!validateMobile(form.mobile)) e.mobile = 'Please enter a valid 10-digit mobile number.';
    if (!form.message.trim()) e.message = 'Please enter your message.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      showToast('Please fix the errors.', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      mobile: form.mobile,
      message: form.message,
    });
    setSubmitting(false);

    if (error) {
      showToast('Failed to send message. Please try again.', 'error');
      return;
    }

    // Create admin notification
    await supabase.from('notifications').insert({
      title: 'New Contact Enquiry',
      message: `${form.name} (${form.mobile}) sent an enquiry`,
      type: 'contact',
    });

    showToast('Message sent successfully! We will contact you soon.', 'success');
    setForm({ name: '', mobile: '', message: '' });
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <SectionHeading title="CONTACT US" subtitle="Get in touch with us for all your building material needs" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-charcoal border border-gold/20 p-6 sm:p-8">
            <h3 className="text-gold font-bold text-lg mb-6">{businessName}</h3>

            <div className="space-y-6">
              {/* Person 1 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 font-semibold">{person1}</p>
                  <a href={`tel:${phone1}`} className="text-gold hover:underline text-sm">{phone1}</a>
                </div>
                <a href={`tel:${phone1}`} className="w-10 h-10 rounded-lg border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Person 2 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 font-semibold">{person2}</p>
                  <a href={`tel:${phone2}`} className="text-gold hover:underline text-sm">{phone2}</a>
                </div>
                <a href={`tel:${phone2}`} className="w-10 h-10 rounded-lg border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Email */}
              {contact?.email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-gold" />
                  </div>
                  <a href={`mailto:${contact.email}`} className="text-slate-300 hover:text-gold text-sm">{contact.email}</a>
                </div>
              )}

              {/* Address */}
              {contact?.address && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm">{contact.address}</p>
                    {contact.village && <p className="text-slate-400 text-xs">{contact.village}, {contact.district}, {contact.state} - {contact.pincode}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gold/10">
              <a href={`tel:${phone1}`} className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                <Phone className="w-5 h-5" />
                <span className="text-xs font-medium">CALL NOW</span>
              </a>
              <a href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppGenericMessage(contact))} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-medium">WHATSAPP</span>
              </a>
              {contact?.maps_url && (
                <a href={contact.maps_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs font-medium">DIRECTIONS</span>
                </a>
              )}
            </div>
          </div>

          {/* Map */}
          {contact?.latitude && contact?.longitude && (
            <div className="rounded-2xl overflow-hidden border border-gold/20 shadow-dark-lg">
              <iframe
                src={`https://maps.google.com/maps?q=${contact.latitude},${contact.longitude}&z=15&output=embed`}
                className="w-full h-64"
                title="Business Location"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Contact form */}
        <div className="rounded-2xl bg-gradient-charcoal border border-gold/20 p-6 sm:p-8">
          <h3 className="text-gold font-bold text-lg mb-6">Send Us a Message</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors"
              />
              {errors.name && <p className="mt-1.5 text-red-400 text-xs">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Mobile Number *</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors"
              />
              {errors.mobile && <p className="mt-1.5 text-red-400 text-xs">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your message or enquiry"
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors resize-none"
              />
              {errors.message && <p className="mt-1.5 text-red-400 text-xs">{errors.message}</p>}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-6 py-3.5 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> SENDING...</>
              ) : (
                <><Send className="w-5 h-5" /> SEND MESSAGE</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

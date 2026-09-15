import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HardHat, CheckCircle, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl, getWhatsAppGenericMessage } from '@/lib/utils';
import type { SiteContent } from '@/types';
import { SectionHeading } from '@/components/ui';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function AboutPage() {
  const { contact, content } = useSettings();
  const [whyContent, setWhyContent] = useState<SiteContent | null>(null);

  const aboutContent = content['about'];
  const heroReveal = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    supabase.from('site_content').select('*').eq('section', 'why_choose_us').maybeSingle().then(({ data }) => {
      setWhyContent(data as SiteContent | null);
    });
  }, []);

  const aboutImage = (aboutContent?.data as Record<string, string>)?.image_url || 'https://images.pexels.com/photos/32826199/pexels-photo-32826199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
  const whyItems = (whyContent?.data as Record<string, Array<Record<string, string>>>)?.items || [];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <SectionHeading title="ABOUT US" subtitle="Learn more about Sri Ramligeshwara Building Materials" />

      <div ref={heroReveal.ref} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 ${heroReveal.visible ? 'visible' : 'reveal'}`}>
        <div className="relative">
          <div className="rounded-2xl overflow-hidden border-2 border-gold/20 shadow-dark-lg">
            <img src={aboutImage} alt="About" className="w-full h-[400px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold-lg hidden sm:flex">
            <HardHat className="w-16 h-16 text-black" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient-gold mb-6 leading-tight">
            {aboutContent?.title || 'ABOUT SRI RAMLIGESHWARA BUILDING MATERIALS'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {aboutContent?.content}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold shrink-0" />
              <span className="text-slate-300 text-sm">Quality Assured</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold shrink-0" />
              <span className="text-slate-300 text-sm">Bulk Orders</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold shrink-0" />
              <span className="text-slate-300 text-sm">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gold shrink-0" />
              <span className="text-slate-300 text-sm">Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      {whyItems.length > 0 && (
        <div className="mb-16">
          <SectionHeading title="WHY CHOOSE US" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyItems.map((item, idx) => (
              <div key={idx} className="rounded-2xl bg-gradient-dark border border-gold/10 p-6 hover:border-gold/30 transition-all">
                <h3 className="text-gold font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-gradient-charcoal border border-gold/20 p-8 sm:p-12 text-center shadow-dark-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Project?</h2>
        <p className="text-slate-400 mb-8">Get in touch with us for quality building materials at the best prices.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/materials" className="px-8 py-4 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center gap-2">
            VIEW MATERIALS <ArrowRight className="w-5 h-5" />
          </Link>
          <a href={`tel:${contact?.phone_1 || '8185817805'}`} className="px-8 py-4 border-2 border-emerald-500 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10 transition-all flex items-center gap-2">
            <Phone className="w-5 h-5" /> CALL NOW
          </a>
          <a href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppGenericMessage(contact))} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> WHATSAPP
          </a>
        </div>
      </div>
    </div>
  );
}

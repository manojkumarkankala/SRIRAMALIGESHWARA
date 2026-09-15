import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, MessageCircle, Package, ChevronRight, ArrowRight,
  Shield, Truck, IndianRupee, Clock, Headphones, Award,
  HardHat, CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import {
  getWhatsAppUrl, getWhatsAppGenericMessage, getWhatsAppMaterialMessage,
  getAvailabilityLabel, getAvailabilityColor, getAvailabilityDot,
} from '@/lib/utils';
import type { Material } from '@/types';
import { SectionHeading } from '@/components/ui';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function HomePage() {
  const { contact, content } = useSettings();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('materials')
      .select('*, category:categories(*)')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setMaterials((data as Material[]) || []);
        setLoading(false);
      });
  }, []);

  const heroContent = content['hero'];
  const heroTitle = heroContent?.title || 'SRI RAMLIGESHWARA';
  const heroSubtitle = (heroContent?.data as Record<string, string>)?.subtitle || 'BUILDING MATERIALS';
  const tagline = heroContent?.content || 'Build Your Dreams With Quality Materials';
  const aboutContent = content['about'];
  const whyChooseContent = content['why_choose_us'];
  const announcement = content['announcement'];

  const whyChooseItems = (whyChooseContent?.data as Record<string, Array<Record<string, string>>>)?.items || [
    { title: 'Quality Materials', description: 'Only the finest construction materials sourced from trusted suppliers.' },
    { title: 'Reliable Service', description: 'On-time delivery and dependable supply for your projects.' },
    { title: 'Competitive Pricing', description: 'Best market prices with transparent and fair dealings.' },
    { title: 'Fast Response', description: 'Quick response to all your material requests and enquiries.' },
    { title: 'Customer Support', description: 'Dedicated support to guide you through material selection.' },
    { title: 'Trusted Supplier', description: 'Years of experience serving the construction community.' },
  ];

  const whyIcons = [Shield, Truck, IndianRupee, Clock, Headphones, Award];

  const heroReveal = useScrollReveal<HTMLDivElement>();
  const materialsReveal = useScrollReveal<HTMLDivElement>();
  const whyReveal = useScrollReveal<HTMLDivElement>();
  const aboutReveal = useScrollReveal<HTMLDivElement>();

  const phone = contact?.phone_1 || '8185817805';
  const heroImage = contact?.hero_image_url || 'https://images.pexels.com/photos/13758319/pexels-photo-13758319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

  return (
    <div>
      {/* Announcement bar */}
      {announcement && (announcement.data as Record<string, boolean>)?.active && (
        <div className="bg-gradient-gold text-black py-2 px-4 text-center text-sm font-medium">
          {announcement.content}
        </div>
      )}

      {/* Hero */}
      <section
        ref={heroReveal.ref}
        className={`relative min-h-[85vh] flex items-center justify-center overflow-hidden ${heroReveal.visible ? 'visible' : 'reveal'}`}
      >
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Construction site"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold border border-gold/30 mb-6">
            <HardHat className="w-4 h-4 text-gold" />
            <span className="text-gold text-xs sm:text-sm font-medium tracking-wide">
              TRUSTED BUILDING MATERIALS SUPPLIER
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight">
            {heroTitle}
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gradient-gold mt-2 leading-tight">
            {heroSubtitle}
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 font-medium">
            "{tagline}"
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/materials"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-gold text-black font-bold text-sm sm:text-base rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              VIEW MATERIALS
            </Link>
            <Link
              to="/materials"
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gold text-gold font-bold text-sm sm:text-base rounded-xl hover:bg-gold/10 transition-all duration-300 flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              REQUEST MATERIALS
            </Link>
            <a
              href={`tel:${phone}`}
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-emerald-500 text-emerald-400 font-bold text-sm sm:text-base rounded-xl hover:bg-emerald-500/10 transition-all duration-300 flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              CALL NOW
            </a>
            <a
              href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppGenericMessage(contact))}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 text-white font-bold text-sm sm:text-base rounded-xl hover:bg-emerald-500 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WHATSAPP
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      {/* Materials section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          ref={materialsReveal.ref}
          className={materialsReveal.visible ? 'visible' : 'reveal'}
        >
          <SectionHeading
            title="ALL BUILDING MATERIALS ARE AVAILABLE"
            subtitle="Quality construction materials for every project need"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-2xl h-72" />
                ))
              : materials.map((material, idx) => (
                  <MaterialCircleCard key={material.id} material={material} contact={contact} index={idx} />
                ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/materials"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gold text-gold font-semibold rounded-xl hover:bg-gold/10 transition-all duration-300"
            >
              VIEW ALL MATERIALS
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-dark border-y border-gold/10">
        <div
          ref={whyReveal.ref}
          className={`max-w-7xl mx-auto ${whyReveal.visible ? 'visible' : 'reveal'}`}
        >
          <SectionHeading
            title="WHY CHOOSE SRI RAMLIGESHWARA?"
            subtitle="We are committed to delivering the best building materials with exceptional service"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseItems.map((item, idx) => {
              const Icon = whyIcons[idx % whyIcons.length];
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl bg-gradient-charcoal border border-gold/10 p-6 hover:border-gold/30 transition-all duration-300 hover:shadow-gold"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-gold font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          ref={aboutReveal.ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${aboutReveal.visible ? 'visible' : 'reveal'}`}
        >
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border-2 border-gold/20 shadow-dark-lg">
              <img
                src={(aboutContent?.data as Record<string, string>)?.image_url || 'https://images.pexels.com/photos/32826199/pexels-photo-32826199.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'}
                alt="About us"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold-lg hidden sm:flex">
              <HardHat className="w-16 h-16 text-black" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-gold" />
              <span className="text-gold text-sm font-semibold tracking-wider">ABOUT US</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-gold mb-6 leading-tight">
              {aboutContent?.title || 'ABOUT SRI RAMLIGESHWARA BUILDING MATERIALS'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              {aboutContent?.content}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
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
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gold text-gold font-semibold rounded-xl hover:bg-gold/10 transition-all duration-300"
            >
              READ MORE
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-charcoal border border-gold/20 p-8 sm:p-12 text-center shadow-dark-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Need Building Materials?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Send us your requirement now. Our team will get back to you with the best price and delivery options.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/materials"
                className="px-8 py-4 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:scale-105"
              >
                REQUEST MATERIAL
              </Link>
              <a
                href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppGenericMessage(contact))}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WHATSAPP US
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MaterialCircleCard({
  material,
  contact,
  index,
}: {
  material: Material;
  contact: ReturnType<typeof useSettings>['contact'];
  index: number;
}) {
  return (
    <div
      className="group relative rounded-2xl bg-gradient-dark border border-gold/10 overflow-hidden hover:border-gold/40 transition-all duration-300 hover:shadow-gold animate-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={material.image_url || 'https://images.pexels.com/photos/36003985/pexels-photo-36003985.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'}
          alt={material.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-gold/20">
          <span className={`w-2 h-2 rounded-full ${getAvailabilityDot(material.availability)}`} />
          <span className={`text-xs font-medium ${getAvailabilityColor(material.availability)}`}>
            {getAvailabilityLabel(material.availability)}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-gold font-bold text-base sm:text-lg mb-1">{material.name}</h3>
        <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 mb-4">
          {material.description}
        </p>

        <div className="flex gap-2">
          <Link
            to={`/materials/${material.id}`}
            className="flex-1 px-3 py-2 text-center border border-gold/30 text-gold text-xs sm:text-sm font-medium rounded-lg hover:bg-gold/10 transition-colors"
          >
            View Details
          </Link>
          {material.availability !== 'out_of_stock' ? (
            <Link
              to={`/request/${material.id}`}
              className="flex-1 px-3 py-2 text-center bg-gradient-gold text-black text-xs sm:text-sm font-semibold rounded-lg hover:shadow-gold transition-all"
            >
              Deal Now
            </Link>
          ) : (
            <span className="flex-1 px-3 py-2 text-center text-slate-500 text-xs sm:text-sm font-medium rounded-lg bg-slate-800/50">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

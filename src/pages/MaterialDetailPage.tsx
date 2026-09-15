import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Phone, MessageCircle, ArrowLeft, CheckCircle, Package,
  MapPin, IndianRupee, Ruler, Box,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import {
  getWhatsAppUrl, getWhatsAppMaterialMessage,
  getAvailabilityLabel, getAvailabilityColor, getAvailabilityDot,
  parseFeatures,
} from '@/lib/utils';
import type { Material, MaterialImage } from '@/types';
import { LoadingSpinner, EmptyState } from '@/components/ui';

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { contact } = useSettings();
  const [material, setMaterial] = useState<Material | null>(null);
  const [images, setImages] = useState<MaterialImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('materials').select('*, category:categories(*)').eq('id', id).maybeSingle(),
      supabase.from('material_images').select('*').eq('material_id', id).order('sort_order', { ascending: true }),
    ]).then(([matRes, imgRes]) => {
      setMaterial(matRes.data as Material | null);
      setImages((imgRes.data as MaterialImage[]) || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading material details..." />;

  if (!material) {
    return (
      <EmptyState
        icon={Package}
        title="Material Not Found"
        message="The material you're looking for doesn't exist or has been removed."
        action={
          <Link to="/materials" className="px-6 py-3 bg-gradient-gold text-black font-semibold rounded-lg">
            BROWSE MATERIALS
          </Link>
        }
      />
    );
  }

  const allImages = [material.image_url, ...images.map((i) => i.image_url)].filter(Boolean) as string[];
  const features = parseFeatures(material.features);
  const phone = contact?.phone_1 || '8185817805';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <Link
        to="/materials"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Materials
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div>
          <div className="relative rounded-2xl overflow-hidden border-2 border-gold/20 shadow-dark-lg mb-4">
            <img
              src={allImages[activeImage] || ''}
              alt={material.name}
              className="w-full h-80 sm:h-96 object-cover"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-gold/20">
              <span className={`w-2 h-2 rounded-full ${getAvailabilityDot(material.availability)}`} />
              <span className={`text-sm font-medium ${getAvailabilityColor(material.availability)}`}>
                {getAvailabilityLabel(material.availability)}
              </span>
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-gold' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-gold mb-3">{material.name}</h1>
          {material.category && (
            <span className="inline-block px-3 py-1 rounded-full glass-gold border border-gold/20 text-gold text-xs font-medium mb-6">
              {material.category.name}
            </span>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl bg-gradient-charcoal border border-gold/10 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <IndianRupee className="w-3.5 h-3.5" />
                Price
              </div>
              <p className="text-slate-200 font-semibold">{material.price || 'Contact for Price'}</p>
            </div>
            <div className="rounded-xl bg-gradient-charcoal border border-gold/10 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Ruler className="w-3.5 h-3.5" />
                Unit
              </div>
              <p className="text-slate-200 font-semibold">{material.unit || '-'}</p>
            </div>
            <div className="rounded-xl bg-gradient-charcoal border border-gold/10 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Box className="w-3.5 h-3.5" />
                Min. Quantity
              </div>
              <p className="text-slate-200 font-semibold">{material.minimum_quantity || '-'} {material.unit}</p>
            </div>
            <div className="rounded-xl bg-gradient-charcoal border border-gold/10 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Package className="w-3.5 h-3.5" />
                Availability
              </div>
              <p className={`font-semibold ${getAvailabilityColor(material.availability)}`}>
                {getAvailabilityLabel(material.availability)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{material.description}</p>
          </div>

          {features.length > 0 && (
            <div className="mb-8">
              <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-3">Features</h3>
              <ul className="space-y-2">
                {features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {material.availability !== 'out_of_stock' ? (
              <Link
                to={`/request/${material.id}`}
                className="block w-full text-center px-6 py-4 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:scale-[1.02]"
              >
                DEAL THIS MATERIAL
              </Link>
            ) : (
              <div className="w-full text-center px-6 py-4 bg-slate-800/50 text-slate-500 font-bold rounded-xl border border-slate-700">
                CURRENTLY UNAVAILABLE
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-emerald-500 text-emerald-400 font-semibold rounded-xl hover:bg-emerald-500/10 transition-colors"
              >
                <Phone className="w-5 h-5" />
                CALL NOW
              </a>
              <a
                href={getWhatsAppUrl(
                  contact?.whatsapp,
                  getWhatsAppMaterialMessage(contact, material.name)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

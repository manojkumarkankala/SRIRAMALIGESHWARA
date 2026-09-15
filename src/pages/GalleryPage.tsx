import { useEffect, useState, useMemo } from 'react';
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { GalleryItem } from '@/types';
import { SectionHeading, LoadingSpinner, EmptyState } from '@/components/ui';

const CATEGORIES = ['All', 'Construction', 'Materials', 'Projects', 'Business', 'Products', 'Other'];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('gallery').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
      setItems((data as GalleryItem[]) || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  function closeLightbox() { setLightbox(null); }
  function nextImage() {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % filtered.length);
  }
  function prevImage() {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + filtered.length) % filtered.length);
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SectionHeading title="GALLERY" subtitle="View our construction projects and materials" />

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat ? 'bg-gradient-gold text-black' : 'border border-gold/20 text-slate-300 hover:border-gold/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading gallery..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Image} title="Gallery Coming Soon" message="Gallery will be updated soon with our latest projects and materials." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightbox(idx)}
              className="group relative rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 cursor-pointer transition-all duration-300 hover:shadow-gold animate-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <img src={item.image_url} alt={item.title} className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-gold font-semibold text-sm">{item.title}</p>
                {item.category && <p className="text-slate-400 text-xs">{item.category}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white p-2 hover:text-gold" onClick={closeLightbox}>
            <X className="w-8 h-8" />
          </button>
          <button className="absolute left-4 text-white p-2 hover:text-gold" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button className="absolute right-4 text-white p-2 hover:text-gold" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <img src={filtered[lightbox].image_url} alt={filtered[lightbox].title} className="max-w-full max-h-[70vh] rounded-lg object-contain" />
            <div className="text-center mt-4">
              <p className="text-gold font-semibold">{filtered[lightbox].title}</p>
              {filtered[lightbox].description && <p className="text-slate-400 text-sm mt-1">{filtered[lightbox].description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

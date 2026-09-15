import { useEffect, useState, useMemo } from 'react';
import { Video as VideoIcon, Play, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getYouTubeThumb } from '@/lib/utils';
import type { Video } from '@/types';
import { SectionHeading, LoadingSpinner, EmptyState } from '@/components/ui';

const CATEGORIES = ['All', 'Construction', 'Materials', 'Projects', 'Business', 'Other'];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('videos').select('*').order('sort_order', { ascending: true }).then(({ data }) => {
      setVideos((data as Video[]) || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return videos;
    return videos.filter((v) => v.category === activeCategory);
  }, [videos, activeCategory]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <SectionHeading title="VIDEOS" subtitle="Watch our construction videos and project showcases" />

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
        <LoadingSpinner message="Loading videos..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={VideoIcon} title="No Videos Yet" message="Videos will be added soon. Please check back later." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video, idx) => {
            const thumb = video.thumbnail_url || getYouTubeThumb(video.video_url);
            return (
              <div
                key={video.id}
                onClick={() => setPlaying(video.video_url)}
                className="group rounded-2xl bg-gradient-dark border border-gold/10 overflow-hidden hover:border-gold/30 transition-all duration-300 hover:shadow-gold cursor-pointer animate-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <VideoIcon className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-black ml-1" fill="black" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gold font-bold text-base mb-1">{video.title}</h3>
                  {video.description && <p className="text-slate-400 text-sm line-clamp-2">{video.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video modal */}
      {playing && (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:text-gold" onClick={() => setPlaying(null)}>
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-3xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={playing.replace('watch?v=', 'embed/')}
              title="Video player"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

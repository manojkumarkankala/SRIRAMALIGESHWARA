import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const STORAGE_BUCKETS = {
  BUSINESS_IMAGES: 'business-images',
  MATERIAL_IMAGES: 'material-images',
  GALLERY_IMAGES: 'gallery-images',
  VIDEOS: 'videos',
  CUSTOMER_UPLOADS: 'customer-uploads',
} as const;

export async function uploadFile(
  bucket: string,
  file: File,
  pathPrefix: string = ''
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const fileName = `${pathPrefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { url: null, error: error.message };
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { url: urlData.publicUrl, error: null };
}

/*
# Storage Bucket Policies

## Overview
Creates RLS policies for the 5 storage buckets used by the application.

## Policies
1. **business-images** - Public read, admin write only
2. **material-images** - Public read, admin write only
3. **gallery-images** - Public read, admin write only
4. **videos** - Public read, admin write only
5. **customer-uploads** - Public read, anyone can upload (for customer reference images)

## Security
- All buckets are publicly readable (needed for displaying images on the website)
- Only authenticated admins can upload to business-images, material-images, gallery-images, videos
- Anyone can upload to customer-uploads (customers submit reference images without logging in)
*/

-- Public read policies for all buckets
CREATE POLICY "public_read_business_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'business-images');

CREATE POLICY "public_read_material_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'material-images');

CREATE POLICY "public_read_gallery_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "public_read_videos" ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "public_read_customer_uploads" ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-uploads');

-- Admin write policies (insert/update/delete) for managed buckets
CREATE POLICY "admin_write_business_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'business-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_update_business_images" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'business-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_delete_business_images" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'business-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_write_material_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'material-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_update_material_images" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'material-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_delete_material_images" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'material-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_write_gallery_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'gallery-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_update_gallery_images" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'gallery-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_delete_gallery_images" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'gallery-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_write_videos_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'videos' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admin_delete_videos_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'videos' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Customer uploads: anyone can insert (customers don't need to be logged in)
CREATE POLICY "public_upload_customer_uploads" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (
    bucket_id = 'customer-uploads'
  );

CREATE POLICY "anon_delete_customer_uploads" ON storage.objects FOR DELETE
  TO anon, authenticated USING (
    bucket_id = 'customer-uploads'
  );

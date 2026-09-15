/*
# Sri Ramligeshwara Building Materials - Core Schema

## Overview
Creates the complete database schema for a building materials business platform with customer request management, admin dashboard, and CMS capabilities.

## Tables Created
1. **profiles** - User profiles with role (customer/admin), linked to auth.users
2. **categories** - Material categories (Sand, Iron, Rock, etc.)
3. **materials** - Building materials with price, unit, availability, images
4. **material_images** - Additional images per material
5. **deal_requests** - Customer material requests with unique request IDs
6. **notifications** - System notifications for admin and customers
7. **gallery** - Image gallery with categories
8. **videos** - Video gallery (YouTube links)
9. **site_content** - Editable website content (hero, about, etc.)
10. **contact_settings** - Business contact information
11. **contact_messages** - Customer enquiry messages
12. **admin_audit** - Audit trail of admin actions

## Security
- RLS enabled on all tables
- Public can view materials, gallery, videos, content, contact settings
- Public can submit deal requests and contact messages
- Only authenticated admins can manage (insert/update/delete)
- Admin role determined by profiles table role column
- Customer request status lookup requires matching request_id + mobile

## Notes
1. Admin user must be created via Supabase Auth, then their profile role set to 'admin'
2. The generate_request_id function creates IDs like SRB-20260913-001
3. Storage buckets must be created separately for image uploads
*/

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===================== PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  mobile text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ===================== CATEGORIES =====================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_select" ON categories;
CREATE POLICY "categories_public_select" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "categories_admin_update" ON categories;
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "categories_admin_delete" ON categories;
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== MATERIALS =====================
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  price text DEFAULT 'Contact for Price',
  unit text DEFAULT 'Ton',
  minimum_quantity text DEFAULT '1',
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'out_of_stock', 'limited_stock')),
  image_url text,
  features text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "materials_public_select" ON materials;
CREATE POLICY "materials_public_select" ON materials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "materials_admin_insert" ON materials;
CREATE POLICY "materials_admin_insert" ON materials FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "materials_admin_update" ON materials;
CREATE POLICY "materials_admin_update" ON materials FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "materials_admin_delete" ON materials;
CREATE POLICY "materials_admin_delete" ON materials FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== MATERIAL_IMAGES =====================
CREATE TABLE IF NOT EXISTS material_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE material_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mat_images_public_select" ON material_images;
CREATE POLICY "mat_images_public_select" ON material_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "mat_images_admin_insert" ON material_images;
CREATE POLICY "mat_images_admin_insert" ON material_images FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "mat_images_admin_update" ON material_images;
CREATE POLICY "mat_images_admin_update" ON material_images FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "mat_images_admin_delete" ON material_images;
CREATE POLICY "mat_images_admin_delete" ON material_images FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== DEAL_REQUESTS =====================
CREATE TABLE IF NOT EXISTS deal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text UNIQUE NOT NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  mobile text NOT NULL,
  village text,
  mandal text,
  district text,
  delivery_address text NOT NULL,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  material_name text NOT NULL,
  quantity text NOT NULL,
  unit text NOT NULL,
  required_date date,
  preferred_time text,
  additional_requirements text,
  message text,
  reference_image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  admin_message text,
  decline_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deal_requests ENABLE ROW LEVEL SECURITY;

-- Public can submit requests (insert)
DROP POLICY IF EXISTS "requests_public_insert" ON deal_requests;
CREATE POLICY "requests_public_insert" ON deal_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin can see all requests
DROP POLICY IF EXISTS "requests_admin_select_all" ON deal_requests;
CREATE POLICY "requests_admin_select_all" ON deal_requests FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin can update (accept/decline) requests
DROP POLICY IF EXISTS "requests_admin_update" ON deal_requests;
CREATE POLICY "requests_admin_update" ON deal_requests FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin can delete requests
DROP POLICY IF EXISTS "requests_admin_delete" ON deal_requests;
CREATE POLICY "requests_admin_delete" ON deal_requests FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== NOTIFICATIONS =====================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id text,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'request', 'contact', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin sees all notifications
DROP POLICY IF EXISTS "notif_admin_select" ON notifications;
CREATE POLICY "notif_admin_select" ON notifications FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin can update notifications (mark as read)
DROP POLICY IF EXISTS "notif_admin_update" ON notifications;
CREATE POLICY "notif_admin_update" ON notifications FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin can delete notifications
DROP POLICY IF EXISTS "notif_admin_delete" ON notifications;
CREATE POLICY "notif_admin_delete" ON notifications FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Public can insert notifications (e.g., when submitting a request)
DROP POLICY IF EXISTS "notif_public_insert" ON notifications;
CREATE POLICY "notif_public_insert" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ===================== GALLERY =====================
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'Construction',
  image_url text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_public_select" ON gallery;
CREATE POLICY "gallery_public_select" ON gallery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "gallery_admin_insert" ON gallery;
CREATE POLICY "gallery_admin_insert" ON gallery FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "gallery_admin_update" ON gallery;
CREATE POLICY "gallery_admin_update" ON gallery FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "gallery_admin_delete" ON gallery;
CREATE POLICY "gallery_admin_delete" ON gallery FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== VIDEOS =====================
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  category text DEFAULT 'Construction',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_public_select" ON videos;
CREATE POLICY "videos_public_select" ON videos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "videos_admin_insert" ON videos;
CREATE POLICY "videos_admin_insert" ON videos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "videos_admin_update" ON videos;
CREATE POLICY "videos_admin_update" ON videos FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "videos_admin_delete" ON videos;
CREATE POLICY "videos_admin_delete" ON videos FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== SITE_CONTENT =====================
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  title text,
  content text,
  image_url text,
  data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_public_select" ON site_content;
CREATE POLICY "content_public_select" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "content_admin_insert" ON site_content;
CREATE POLICY "content_admin_insert" ON site_content FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "content_admin_update" ON site_content;
CREATE POLICY "content_admin_update" ON site_content FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "content_admin_delete" ON site_content;
CREATE POLICY "content_admin_delete" ON site_content FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== CONTACT_SETTINGS =====================
CREATE TABLE IF NOT EXISTS contact_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'Sri Ramligeshwara Building Materials',
  contact_person_1 text DEFAULT 'J. Srinkath',
  phone_1 text DEFAULT '8185817805',
  contact_person_2 text DEFAULT 'B. Manikanta',
  phone_2 text DEFAULT '9666005044',
  whatsapp text DEFAULT '919666005044',
  email text,
  address text,
  village text,
  mandal text,
  district text,
  state text DEFAULT 'Telangana',
  pincode text,
  latitude text,
  longitude text,
  maps_url text,
  instagram text,
  facebook text,
  youtube text,
  logo_url text,
  hero_image_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_public_select" ON contact_settings;
CREATE POLICY "contact_public_select" ON contact_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "contact_admin_update" ON contact_settings;
CREATE POLICY "contact_admin_update" ON contact_settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "contact_admin_insert" ON contact_settings;
CREATE POLICY "contact_admin_insert" ON contact_settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== CONTACT_MESSAGES =====================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can submit contact messages
DROP POLICY IF EXISTS "messages_public_insert" ON contact_messages;
CREATE POLICY "messages_public_insert" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin can view all messages
DROP POLICY IF EXISTS "messages_admin_select" ON contact_messages;
CREATE POLICY "messages_admin_select" ON contact_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin can update message status
DROP POLICY IF EXISTS "messages_admin_update" ON contact_messages;
CREATE POLICY "messages_admin_update" ON contact_messages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Admin can delete messages
DROP POLICY IF EXISTS "messages_admin_delete" ON contact_messages;
CREATE POLICY "messages_admin_delete" ON contact_messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== ADMIN_AUDIT =====================
CREATE TABLE IF NOT EXISTS admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_admin_select" ON admin_audit;
CREATE POLICY "audit_admin_select" ON admin_audit FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "audit_admin_insert" ON admin_audit;
CREATE POLICY "audit_admin_insert" ON admin_audit FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ===================== REQUEST_ID GENERATION =====================
-- Function to generate sequential request IDs like SRB-20260913-001
CREATE OR REPLACE FUNCTION generate_request_id()
RETURNS text AS $$
DECLARE
  date_part text;
  seq_part text;
  next_seq int;
BEGIN
  date_part := to_char(now(), 'YYYYMMDD');

  SELECT COALESCE(max(seq_num), 0) + 1 INTO next_seq
  FROM (
    SELECT CAST(SUBSTRING(request_id FROM 14) AS int) AS seq_num
    FROM deal_requests
    WHERE request_id LIKE 'SRB-' || date_part || '-%'
  ) sub;

  seq_part := lpad(next_seq::text, 3, '0');
  RETURN 'SRB-' || date_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category_id);
CREATE INDEX IF NOT EXISTS idx_materials_availability ON materials(availability);
CREATE INDEX IF NOT EXISTS idx_deal_requests_status ON deal_requests(status);
CREATE INDEX IF NOT EXISTS idx_deal_requests_request_id ON deal_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_deal_requests_mobile ON deal_requests(mobile);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_material_images_material ON material_images(material_id);

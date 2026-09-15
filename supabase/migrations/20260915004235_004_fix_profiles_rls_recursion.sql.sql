-- =====================================================
-- Fix: Infinite recursion in profiles RLS policies
-- =====================================================
-- The profiles SELECT policy used a subquery against profiles itself,
-- causing infinite recursion. Replace with a simple auth.uid() = id check.
-- Admin access to other profiles is handled via a SECURITY DEFINER function.
-- =====================================================

-- 1) Create a SECURITY DEFINER function to check if the current user is an admin.
--    This bypasses RLS on profiles, avoiding recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2) Drop and recreate profiles policies WITHOUT self-referencing subqueries
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Simple: users can read their own profile. No subquery needed.
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- 3) Replace all admin-check subqueries on other tables to use is_admin()
--    instead of the recursive EXISTS pattern.

-- admin_audit
DROP POLICY IF EXISTS "audit_admin_insert" ON public.admin_audit;
DROP POLICY IF EXISTS "audit_admin_select" ON public.admin_audit;
CREATE POLICY "audit_admin_select" ON public.admin_audit FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "audit_admin_insert" ON public.admin_audit FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

-- categories
DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
CREATE POLICY "categories_admin_insert" ON public.categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "categories_admin_update" ON public.categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "categories_admin_delete" ON public.categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- materials
DROP POLICY IF EXISTS "materials_admin_insert" ON public.materials;
DROP POLICY IF EXISTS "materials_admin_update" ON public.materials;
DROP POLICY IF EXISTS "materials_admin_delete" ON public.materials;
CREATE POLICY "materials_admin_insert" ON public.materials FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "materials_admin_update" ON public.materials FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "materials_admin_delete" ON public.materials FOR DELETE
  TO authenticated USING (public.is_admin());

-- material_images
DROP POLICY IF EXISTS "material_images_admin_insert" ON public.material_images;
DROP POLICY IF EXISTS "material_images_admin_update" ON public.material_images;
DROP POLICY IF EXISTS "material_images_admin_delete" ON public.material_images;
CREATE POLICY "material_images_admin_insert" ON public.material_images FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "material_images_admin_update" ON public.material_images FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "material_images_admin_delete" ON public.material_images FOR DELETE
  TO authenticated USING (public.is_admin());

-- deal_requests
DROP POLICY IF EXISTS "requests_admin_update" ON public.deal_requests;
DROP POLICY IF EXISTS "requests_admin_delete" ON public.deal_requests;
CREATE POLICY "requests_admin_update" ON public.deal_requests FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "requests_admin_delete" ON public.deal_requests FOR DELETE
  TO authenticated USING (public.is_admin());

-- notifications
DROP POLICY IF EXISTS "notifications_admin_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_update" ON public.notifications;
CREATE POLICY "notifications_admin_select" ON public.notifications FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "notifications_admin_update" ON public.notifications FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- gallery
DROP POLICY IF EXISTS "gallery_admin_insert" ON public.gallery;
DROP POLICY IF EXISTS "gallery_admin_update" ON public.gallery;
DROP POLICY IF EXISTS "gallery_admin_delete" ON public.gallery;
CREATE POLICY "gallery_admin_insert" ON public.gallery FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "gallery_admin_update" ON public.gallery FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "gallery_admin_delete" ON public.gallery FOR DELETE
  TO authenticated USING (public.is_admin());

-- videos
DROP POLICY IF EXISTS "videos_admin_insert" ON public.videos;
DROP POLICY IF EXISTS "videos_admin_update" ON public.videos;
DROP POLICY IF EXISTS "videos_admin_delete" ON public.videos;
CREATE POLICY "videos_admin_insert" ON public.videos FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "videos_admin_update" ON public.videos FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "videos_admin_delete" ON public.videos FOR DELETE
  TO authenticated USING (public.is_admin());

-- site_content
DROP POLICY IF EXISTS "content_admin_update" ON public.site_content;
CREATE POLICY "content_admin_update" ON public.site_content FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- contact_settings
DROP POLICY IF EXISTS "contact_admin_update" ON public.contact_settings;
CREATE POLICY "contact_admin_update" ON public.contact_settings FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- contact_messages
DROP POLICY IF EXISTS "messages_admin_select" ON public.contact_messages;
DROP POLICY IF EXISTS "messages_admin_update" ON public.contact_messages;
CREATE POLICY "messages_admin_select" ON public.contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "messages_admin_update" ON public.contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

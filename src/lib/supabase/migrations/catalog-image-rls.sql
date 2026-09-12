-- Create catalog bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalog', 'catalog', true)
ON CONFLICT (id) DO NOTHING;

-- Note: Bucket 'catalog' is PUBLIC, so 
-- direct file URL viewing works automatically for everyone.

-- 1. Allow admins to list/read file metadata
CREATE POLICY "Admins Read Catalog Images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'catalog' AND public.is_admin());

-- 2. Allow admins to upload category images
CREATE POLICY "Admins Upload Catalog Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'catalog' AND public.is_admin());

-- 3. Allow admins to update category images
CREATE POLICY "Admins Update Catalog Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'catalog' AND public.is_admin());

-- 4. Allow admins to delete category images
CREATE POLICY "Admins Delete Catalog Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'catalog' AND public.is_admin());
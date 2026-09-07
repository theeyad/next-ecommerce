-- 1. Allow anyone (public and customers, etc...) to read/view category images
CREATE POLICY "Public Read Categories"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

-- 2. Allow admins to upload category images
CREATE POLICY "Admins Upload Categories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'categories');

-- 3. Allow admins to update category images
CREATE POLICY "Admins Update Categories"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'categories');

-- 4. Allow admins to delete category images
CREATE POLICY "Admins Delete Categories"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'categories');

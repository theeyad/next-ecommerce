-- Create profiles bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Public Read Profiles
CREATE POLICY "Public Read Profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- 2. Users Upload/Manage Their Own Avatar (folder = user_id)
CREATE POLICY "Users Manage Own Profile Image"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

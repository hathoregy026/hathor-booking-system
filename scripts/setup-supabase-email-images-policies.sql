-- Run in Supabase SQL Editor if email image uploads return 403/404 publicly.
-- Dashboard → Storage → email-images → Policies, or paste here.

CREATE POLICY "Public read email-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'email-images');

CREATE POLICY "Service role upload email-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'email-images');

CREATE POLICY "Service role update email-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'email-images')
WITH CHECK (bucket_id = 'email-images');

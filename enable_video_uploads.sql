-- Allow video mime types in the 'avatars' bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
WHERE id = 'avatars';
-- Ensure the bucket is public (just in case)
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';
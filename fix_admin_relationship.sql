-- Establishing the missing relationship for Master Admin Dashboard
-- This allows PostgREST to join 'links' and 'profiles'
-- 1. Ensure profiles table has a primary key on id (already should, but for safety)
-- 2. Update links table to reference profiles(id) directly
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_user_id_fkey;
ALTER TABLE public.links
ADD CONSTRAINT links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
-- Also verify created_at exists (from previous error)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
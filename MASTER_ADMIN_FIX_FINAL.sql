-- MASTER ADMIN COMPREHENSIVE SCHEMA FIX
-- RUN THIS IN SUPABASE SQL EDITOR
-- 1. Ensure all columns exist in profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS masterpiece_enabled BOOLEAN DEFAULT TRUE;
-- 2. Create Platform Settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Enable RLS and setup policies for platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.platform_settings;
CREATE POLICY "Public Read Access" ON public.platform_settings FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Master Admin Write Access" ON public.platform_settings;
CREATE POLICY "Master Admin Write Access" ON public.platform_settings FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND is_master = true
    )
);
-- 4. Setup check_is_master helper function
CREATE OR REPLACE FUNCTION public.check_is_master() RETURNS boolean AS $$
SELECT is_master
FROM public.profiles
WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
-- 5. Universal RLS Policies for profiles (Allow Master Admins full control)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Master admins can view all profiles" ON profiles;
CREATE POLICY "Master admins can view all profiles" ON profiles FOR
SELECT TO authenticated USING (
        (public.check_is_master())
        OR (auth.uid() = id)
    );
DROP POLICY IF EXISTS "Only Master Admins can update profiles" ON profiles;
CREATE POLICY "Only Master Admins can update profiles" ON profiles FOR
UPDATE TO authenticated USING (
        (public.check_is_master())
        OR (auth.uid() = id)
    ) WITH CHECK (
        (public.check_is_master())
        OR (auth.uid() = id)
    );
-- 6. Insert default settings
INSERT INTO public.platform_settings (key, value)
VALUES ('support_email', 'support@sy-links.com'),
    ('cinematic_showcase', 'true'),
    ('masterpiece_frames', 'true'),
    ('auto_verification', 'false') ON CONFLICT (key) DO NOTHING;
-- 7. Grant Master status to your account (REPLACE WITH YOUR ACTUAL ID)
UPDATE profiles
SET is_master = TRUE
WHERE id = '7159d646-2449-4ae6-b0b7-11568ff8788a';
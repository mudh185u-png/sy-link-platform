-- Add is_master column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE;
-- 1. Create a helper function to check master status without recursion
CREATE OR REPLACE FUNCTION public.check_is_master() RETURNS boolean AS $$
SELECT is_master
FROM public.profiles
WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Only Master Admins can update roles" ON profiles;
DROP POLICY IF EXISTS "Master Admins can view all profiles" ON profiles;
-- 3. Create new optimized policies using the helper function
CREATE POLICY "Master admins can view all profiles" ON profiles FOR
SELECT TO authenticated USING (
        (public.check_is_master())
        OR (auth.uid() = id)
    );
CREATE POLICY "Only Master Admins can update profiles" ON profiles FOR
UPDATE TO authenticated USING (public.check_is_master()) WITH CHECK (public.check_is_master());
-- 4. Set your ID (Ensure this runs after the function is created)
UPDATE profiles
SET is_master = TRUE
WHERE id = '7159d646-2449-4ae6-b0b7-11568ff8788a';
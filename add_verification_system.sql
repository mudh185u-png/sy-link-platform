-- Migration to add verification status and admin settings control
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS masterpiece_enabled BOOLEAN DEFAULT TRUE;
-- Comment: You can run this in the Supabase SQL Editor to enable the new verification system.
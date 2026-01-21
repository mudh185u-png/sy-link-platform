-- Add avatar_frame column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_frame TEXT DEFAULT 'none';
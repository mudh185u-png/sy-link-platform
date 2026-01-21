-- Add social link columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS github_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS contact_email TEXT;
-- Add analytics columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE links
ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
-- Function to increment profile views safely
CREATE OR REPLACE FUNCTION increment_profile_views(profile_id UUID) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE profiles
SET views = views + 1
WHERE id = profile_id;
END;
$$;
-- Function to increment link clicks safely
CREATE OR REPLACE FUNCTION increment_link_clicks(link_id UUID) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE links
SET clicks = clicks + 1
WHERE id = link_id;
END;
$$;
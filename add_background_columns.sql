-- Add background customization columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'animated';
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_config JSONB DEFAULT '{"color": "#ff2d55"}';
-- Ensure these columns are accessible via realtime if needed
-- (Already added to publication in previous scripts, but good to be aware)
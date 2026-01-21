-- Add selected_skin column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS selected_skin TEXT DEFAULT 'standard';
COMMENT ON COLUMN profiles.selected_skin IS 'The UI skin/theme selected by the user (standard, neon, space, minimal)';
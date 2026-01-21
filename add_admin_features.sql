-- Add suspension column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
-- Ensure links have a click counter for analytics (if not already present)
ALTER TABLE links
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
-- Update the check_is_master function to also prevent suspended users from regular access if desired
-- (Optional: We can enforce this in the main app's RLS or Auth logic later)
-- Re-run master update just in case
UPDATE profiles
SET is_master = TRUE
WHERE id = '7159d646-2449-4ae6-b0b7-11568ff8788a';
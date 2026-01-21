-- Add opacity control to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS card_opacity FLOAT DEFAULT 0.1;
-- Ensure it stays within reasonable bounds (optional but good practice)
-- 0 is fully transparent, 1 is fully opaque
ALTER TABLE profiles
ADD CONSTRAINT card_opacity_check CHECK (
        card_opacity >= 0
        AND card_opacity <= 1
    );
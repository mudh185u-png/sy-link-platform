-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
-- ---------------------------------------------------------
-- PROFILES POLICIES
-- ---------------------------------------------------------
-- 1. Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);
-- 2. Users can only update their own profile
CREATE POLICY "Users can only update their own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- 3. Users can only insert their own profile
CREATE POLICY "Users can only insert their own profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- ---------------------------------------------------------
-- LINKS POLICIES
-- ---------------------------------------------------------
-- 1. Links are viewable by everyone (needed for public profiles)
CREATE POLICY "Links are viewable by everyone" ON links FOR
SELECT USING (true);
-- 2. Users can only insert their own links
CREATE POLICY "Users can only insert their own links" ON links FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- 3. Users can only update their own links
CREATE POLICY "Users can only update their own links" ON links FOR
UPDATE USING (auth.uid() = user_id);
-- 4. Users can only delete their own links
CREATE POLICY "Users can only delete their own links" ON links FOR DELETE USING (auth.uid() = user_id);
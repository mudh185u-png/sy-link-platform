-- SECURITY HARDENING: Anti-Spam Analytics & Rate Limiting

-- 1. Create a table to track analytics events and prevent duplicate spam
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'view' or 'click'
    target_id UUID NOT NULL, -- profile_id or link_id
    visitor_id TEXT NOT NULL, -- Anonymous identifier passed from frontend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup to ensure database performance remains high
CREATE INDEX IF NOT EXISTS idx_analytics_events_lookup ON public.analytics_events(event_type, target_id, visitor_id);

-- 2. Update increment_profile_views to prevent spam
CREATE OR REPLACE FUNCTION increment_profile_views(profile_id UUID, visitor_hash TEXT DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    recent_event_exists BOOLEAN;
BEGIN
    IF visitor_hash IS NOT NULL THEN
        -- Check if this visitor has viewed this profile in the last 24 hours
        SELECT EXISTS (
            SELECT 1 FROM analytics_events 
            WHERE event_type = 'view' 
              AND target_id = profile_id 
              AND visitor_id = visitor_hash
              AND created_at > (now() - interval '24 hours')
        ) INTO recent_event_exists;

        IF recent_event_exists THEN
            RETURN; -- Silently ignore the spam attempt
        END IF;

        -- Record the event to block future spam for 24 hours
        INSERT INTO analytics_events (event_type, target_id, visitor_id) VALUES ('view', profile_id, visitor_hash);
    END IF;

    -- Increment the actual counter
    UPDATE profiles
    SET views = COALESCE(views, 0) + 1
    WHERE id = profile_id;
END;
$$;

-- 3. Update increment_link_clicks to prevent spam
CREATE OR REPLACE FUNCTION increment_link_clicks(link_id UUID, visitor_hash TEXT DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    recent_event_exists BOOLEAN;
BEGIN
    IF visitor_hash IS NOT NULL THEN
        -- Check if this visitor has clicked this link in the last 24 hours
        SELECT EXISTS (
            SELECT 1 FROM analytics_events 
            WHERE event_type = 'click' 
              AND target_id = link_id 
              AND visitor_id = visitor_hash
              AND created_at > (now() - interval '24 hours')
        ) INTO recent_event_exists;

        IF recent_event_exists THEN
            RETURN; -- Silently ignore the spam attempt
        END IF;

        -- Record the event to block future spam for 24 hours
        INSERT INTO analytics_events (event_type, target_id, visitor_id) VALUES ('click', link_id, visitor_hash);
    END IF;

    -- Increment the actual counter
    UPDATE links
    SET clicks = COALESCE(clicks, 0) + 1
    WHERE id = link_id;
END;
$$;

-- 4. Ensure permissions are correct
GRANT EXECUTE ON FUNCTION increment_profile_views(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_profile_views(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_link_clicks(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_link_clicks(UUID, TEXT) TO authenticated;

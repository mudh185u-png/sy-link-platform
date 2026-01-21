-- Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
-- Policy: Anyone can read (for the suspension notice)
CREATE POLICY "Public Read Access" ON public.platform_settings FOR
SELECT USING (true);
-- Policy: Only Master Admins can update
CREATE POLICY "Master Admin Write Access" ON public.platform_settings FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND is_master = true
    )
);
-- Insert default support email
INSERT INTO public.platform_settings (key, value)
VALUES ('support_email', 'support@sy-links.com') ON CONFLICT (key) DO NOTHING;
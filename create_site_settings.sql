-- Create site_settings table for dynamic theme control
create table if not exists site_settings (
    id bigint primary key generated always as identity,
    config jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS
alter table site_settings enable row level security;
-- Policy: Allow read access to everyone
create policy "Allow public read access" on site_settings for
select using (true);
-- Policy: Allow update access only to authenticated users (admin checks handled in app or via additional roles if needed)
-- For simplicity, assuming authenticated users in master-admin context are authorized.
create policy "Allow authenticated update" on site_settings for
update using (auth.role() = 'authenticated');
-- Insert default row if not exists
insert into site_settings (config)
select '{"container_width": "380px", "input_width": "85%", "glass_panel_width": "100%", "section_order": ["header", "profile", "links", "footer"], "theme_color": "#e94560"}'::jsonb
where not exists (
        select 1
        from site_settings
    );
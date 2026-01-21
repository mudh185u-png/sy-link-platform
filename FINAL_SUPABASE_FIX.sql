-- ==========================================
-- EMERGENCY FIX: TABLES & STORAGE SETUP
-- ==========================================
-- 1. Create 'profiles' table if it doesn't exist
create table if not exists public.profiles (
    id uuid references auth.users not null primary key,
    updated_at timestamp with time zone default now(),
    username text unique,
    full_name text,
    avatar_url text,
    website text
);
-- 2. Create 'links' table if it doesn't exist
create table if not exists public.links (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now() not null,
    title text,
    url text,
    icon text,
    user_id uuid references auth.users not null
);
-- 3. Enable RLS
alter table public.profiles enable row level security;
alter table public.links enable row level security;
-- 4. Re-Apply Policies (Profiles)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for
select using (true);
drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for
insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for
update using (auth.uid() = id);
-- 5. Re-Apply Policies (Links)
drop policy if exists "Public links are viewable by everyone" on links;
create policy "Public links are viewable by everyone" on links for
select using (true);
drop policy if exists "Users can insert their own links" on links;
create policy "Users can insert their own links" on links for
insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own links" on links;
create policy "Users can update their own links" on links for
update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own links" on links;
create policy "Users can delete their own links" on links for delete using (auth.uid() = user_id);
-- 6. Setup Profile Creation Trigger
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$ begin
insert into public.profiles (id, username, full_name, avatar_url)
values (
        new.id,
        coalesce(
            new.raw_user_meta_data->>'username',
            'user_' || substr(new.id::text, 1, 5)
        ),
        coalesce(new.raw_user_meta_data->>'username', 'User'),
        ''
    );
return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- 7. Setup Storage Bucket (Avatars)
-- Note: Buckets must be handled via Supabase Dashboard or API, 
-- but this SQL attempt helps in some environments.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true) on conflict (id) do nothing;
-- 8. Storage Policies
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible." on storage.objects for
select using (bucket_id = 'avatars');
drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar." on storage.objects for
insert with check (bucket_id = 'avatars');
drop policy if exists "Anyone can update their own avatar." on storage.objects;
create policy "Anyone can update their own avatar." on storage.objects for
update using (bucket_id = 'avatars');
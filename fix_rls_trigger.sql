-- 1. First, delete any existing trigger or function to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
-- 2. Create the function that inserts a profile row automatically
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
-- 3. Create the trigger
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- 4. Enable RLS on profiles (already done, but just in case)
alter table profiles enable row level security;
-- 5. Policies for the user to manage their own profile
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for
update using (auth.uid() = id);
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for
select using (true);
-- 6. Important: Allow the trigger (which runs as security definer) to insert
-- No explicit insert policy needed for the trigger itself because it's security definer,
-- but if we ever insert from frontend, we'd need one.
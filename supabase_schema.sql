-- Create the table for links
create table links (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text,
    url text,
    icon text,
    user_id uuid references auth.users not null
);
-- Enable Row Level Security (RLS)
alter table links enable row level security;
-- Create policies
-- Policy 1: Everyone can view links (Public access)
create policy "Public links are viewable by everyone" on links for
select using (true);
-- Policy 2: Users can insert their own links
create policy "Users can insert their own links" on links for
insert with check (auth.uid() = user_id);
-- Policy 3: Users can update their own links
create policy "Users can update their own links" on links for
update using (auth.uid() = user_id);
-- Policy 4: Users can delete their own links
create policy "Users can delete their own links" on links for delete using (auth.uid() = user_id);
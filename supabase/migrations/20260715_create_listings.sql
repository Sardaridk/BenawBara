-- Create public listings table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price bigint not null,
  category text not null,
  location text not null, -- neighborhood
  emoji text default '📦' not null,
  sold boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.listings enable row level security;

-- Setup access policies
create policy "Listings are viewable by everyone" on public.listings
  for select using (true);

create policy "Authenticated users can create listings" on public.listings
  for insert with check (auth.uid() = seller_id);

create policy "Users can update their own listings" on public.listings
  for update using (auth.uid() = seller_id);

create policy "Users can delete their own listings" on public.listings
  for delete using (auth.uid() = seller_id);

-- 20260921_create_reports.sql
-- Create reports table for listing moderation

create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.reports enable row level security;

-- Policies:
-- 1. Any authenticated user can submit a report.
create policy "Authenticated users can submit reports" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- 2. Only admin/service role can view reports (hide from public API).
create policy "Admins can view reports" on public.reports
  for select using (false);

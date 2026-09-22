-- Create public profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  location text, -- neighborhood (e.g. Karrada)
  phone text     -- WhatsApp number
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Setup access policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create profile row trigger when a new user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fill profiles for existing users who already signed up
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- Migration: Add verified column to public.profiles for trusted seller badges
alter table public.profiles
add column if not exists verified boolean default false not null;

comment on column public.profiles.verified is 'Indicates whether the seller has been verified by BenawBara administrators';

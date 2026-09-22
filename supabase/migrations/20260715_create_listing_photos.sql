-- ── Listing photos: schema + storage bucket + RLS ──────────────────────────

-- 1. Store the uploaded photo path on each listing (nullable — photo optional).
--    We store the object PATH (e.g. "{user_id}/{uuid}.webp"), not the full URL,
--    so the app can rebuild public URLs and delete the object on cleanup.
alter table public.listings
  add column if not exists image_path text;

-- 2. Create a PUBLIC storage bucket for listing photos.
--    Public = anyone can read the images (needed for the feed). Writes are
--    still gated by the RLS policies below.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- 3. Storage RLS policies on storage.objects.
--    Read: anyone. Write/update/delete: only the owner, and only inside their
--    own top-level folder named after their auth uid ("{uid}/...").

create policy "Listing photos are publicly readable"
  on storage.objects for select
  using ( bucket_id = 'listing-photos' );

create policy "Users can upload listing photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own listing photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own listing photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

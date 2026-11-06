insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-photos', 'pet-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Потребителите виждат снимки на собствените любимци" on storage.objects;
create policy "Потребителите виждат снимки на собствените любимци"
on storage.objects for select
to authenticated
using (
  bucket_id = 'pet-photos'
  and split_part(name, '/', 1) = (select auth.uid()::text)
  and exists (
    select 1
    from public.pets
    where pets.id::text = split_part(storage.objects.name, '/', 2)
      and pets.user_id = (select auth.uid())
  )
);

drop policy if exists "Потребителите качват снимки на собствените любимци" on storage.objects;
create policy "Потребителите качват снимки на собствените любимци"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-photos'
  and split_part(name, '/', 1) = (select auth.uid()::text)
  and exists (
    select 1
    from public.pets
    where pets.id::text = split_part(storage.objects.name, '/', 2)
      and pets.user_id = (select auth.uid())
  )
);

drop policy if exists "Потребителите променят снимки на собствените любимци" on storage.objects;
create policy "Потребителите променят снимки на собствените любимци"
on storage.objects for update
to authenticated
using (
  bucket_id = 'pet-photos'
  and split_part(name, '/', 1) = (select auth.uid()::text)
  and exists (
    select 1
    from public.pets
    where pets.id::text = split_part(storage.objects.name, '/', 2)
      and pets.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'pet-photos'
  and split_part(name, '/', 1) = (select auth.uid()::text)
  and exists (
    select 1
    from public.pets
    where pets.id::text = split_part(storage.objects.name, '/', 2)
      and pets.user_id = (select auth.uid())
  )
);

drop policy if exists "Потребителите изтриват снимки на собствените любимци" on storage.objects;
create policy "Потребителите изтриват снимки на собствените любимци"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-photos'
  and split_part(name, '/', 1) = (select auth.uid()::text)
  and exists (
    select 1
    from public.pets
    where pets.id::text = split_part(storage.objects.name, '/', 2)
      and pets.user_id = (select auth.uid())
  )
);

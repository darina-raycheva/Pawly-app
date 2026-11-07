-- Article cover image metadata and private Storage policies.
-- Create the article-covers bucket manually before uploading images.

alter table public.articles
  add column if not exists cover_image_path text;

alter table public.articles
  drop constraint if exists articles_cover_image_path_check;

alter table public.articles
  add constraint articles_cover_image_path_check
  check (
    cover_image_path is null
    or cover_image_path ~ '^[0-9a-fA-F-]{36}/[a-zA-Z0-9._-]+$'
  );

create index if not exists articles_cover_image_path_idx
  on public.articles (cover_image_path)
  where cover_image_path is not null;

drop policy if exists "Публикуваните корици са достъпни публично" on storage.objects;
create policy "Публикуваните корици са достъпни публично"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'article-covers'
  and exists (
    select 1
    from public.articles
    where articles.cover_image_path = storage.objects.name
      and (articles.published = true or (select public.is_admin()))
  )
);

drop policy if exists "Администраторите качват корици" on storage.objects;
create policy "Администраторите качват корици"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'article-covers'
  and (select public.is_admin())
  and split_part(name, '/', 1) = (select auth.uid())::text
  and name ~ '^[0-9a-fA-F-]{36}/[a-zA-Z0-9._-]+$'
);

drop policy if exists "Администраторите променят корици" on storage.objects;
create policy "Администраторите променят корици"
on storage.objects for update
to authenticated
using (bucket_id = 'article-covers' and (select public.is_admin()))
with check (bucket_id = 'article-covers' and (select public.is_admin()));

drop policy if exists "Администраторите изтриват корици" on storage.objects;
create policy "Администраторите изтриват корици"
on storage.objects for delete
to authenticated
using (bucket_id = 'article-covers' and (select public.is_admin()));

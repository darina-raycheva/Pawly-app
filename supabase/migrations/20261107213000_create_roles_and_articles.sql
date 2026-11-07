-- Pawly RBAC and informational articles.
-- The first administrator must be assigned manually in the Supabase Dashboard.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_roles_role_idx on public.user_roles (role);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.user_roles enable row level security;

drop policy if exists "Потребителите виждат собствената си роля" on public.user_roles;
create policy "Потребителите виждат собствената си роля"
on public.user_roles for select
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null check (char_length(btrim(excerpt)) between 1 and 500),
  content text not null check (char_length(btrim(content)) between 1 and 50000),
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  author_id uuid not null references auth.users(id) on delete restrict
);

create index if not exists articles_published_created_at_idx
  on public.articles (published, created_at desc);
create index if not exists articles_author_id_idx on public.articles (author_id);

create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row
execute function public.set_articles_updated_at();

create or replace function public.prevent_article_author_change()
returns trigger
language plpgsql
as $$
begin
  if new.author_id is distinct from old.author_id then
    raise exception 'Авторът на статията не може да бъде променян.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_article_author_change on public.articles;
create trigger prevent_article_author_change
before update on public.articles
for each row
execute function public.prevent_article_author_change();

alter table public.articles enable row level security;

drop policy if exists "Всеки вижда публикуваните статии" on public.articles;
create policy "Всеки вижда публикуваните статии"
on public.articles for select
to anon, authenticated
using (published or (select public.is_admin()));

drop policy if exists "Администраторите създават статии" on public.articles;
create policy "Администраторите създават статии"
on public.articles for insert
to authenticated
with check (
  (select public.is_admin())
  and author_id = (select auth.uid())
);

drop policy if exists "Администраторите променят статии" on public.articles;
create policy "Администраторите променят статии"
on public.articles for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Администраторите изтриват статии" on public.articles;
create policy "Администраторите изтриват статии"
on public.articles for delete
to authenticated
using ((select public.is_admin()));

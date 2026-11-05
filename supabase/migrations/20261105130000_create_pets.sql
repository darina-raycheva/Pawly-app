create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  species text not null check (char_length(btrim(species)) between 1 and 50),
  breed text check (breed is null or char_length(btrim(breed)) <= 100),
  sex text check (sex is null or sex in ('male', 'female', 'unknown')),
  birth_date date,
  weight numeric(7, 2) check (weight is null or weight > 0),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pets_user_id_idx on public.pets (user_id);
create index if not exists pets_user_id_created_at_idx on public.pets (user_id, created_at desc);

create or replace function public.set_pets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
before update on public.pets
for each row
execute function public.set_pets_updated_at();

alter table public.pets enable row level security;

drop policy if exists "Потребителите виждат собствените си любимци" on public.pets;
create policy "Потребителите виждат собствените си любимци"
on public.pets for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Потребителите добавят собствени любимци" on public.pets;
create policy "Потребителите добавят собствени любимци"
on public.pets for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Потребителите променят собствените си любимци" on public.pets;
create policy "Потребителите променят собствените си любимци"
on public.pets for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Потребителите изтриват собствените си любимци" on public.pets;
create policy "Потребителите изтриват собствените си любимци"
on public.pets for delete
to authenticated
using ((select auth.uid()) = user_id);

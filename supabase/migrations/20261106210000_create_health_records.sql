create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  record_type text not null check (record_type in ('vaccination', 'checkup', 'treatment', 'test', 'deworming', 'other')),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  record_date date not null,
  veterinarian_clinic text check (veterinarian_clinic is null or char_length(btrim(veterinarian_clinic)) <= 200),
  notes text check (notes is null or char_length(notes) <= 5000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists health_records_user_id_idx on public.health_records (user_id);
create index if not exists health_records_pet_id_record_date_idx on public.health_records (pet_id, record_date desc);

create or replace function public.set_health_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_health_records_updated_at
before update on public.health_records
for each row
execute function public.set_health_records_updated_at();

alter table public.health_records enable row level security;

create policy "Потребителите виждат записи за собствените си любимци"
on public.health_records for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.pets
    where pets.id = health_records.pet_id
      and pets.user_id = (select auth.uid())
  )
);

create policy "Потребителите добавят записи за собствените си любимци"
on public.health_records for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.pets
    where pets.id = health_records.pet_id
      and pets.user_id = (select auth.uid())
  )
);

create policy "Потребителите променят записи за собствените си любимци"
on public.health_records for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.pets
    where pets.id = health_records.pet_id
      and pets.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.pets
    where pets.id = health_records.pet_id
      and pets.user_id = (select auth.uid())
  )
);

create policy "Потребителите изтриват записи за собствените си любимци"
on public.health_records for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.pets
    where pets.id = health_records.pet_id
      and pets.user_id = (select auth.uid())
  )
);

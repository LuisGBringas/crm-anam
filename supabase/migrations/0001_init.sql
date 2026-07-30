-- CRM ANAM — esquema inicial
-- Ejecutar en el SQL editor de Supabase (o vía `supabase db push`)

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- units: unidades de energía y unidades auxiliares
-- ─────────────────────────────────────────────────────────────
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit_type text not null check (unit_type in ('energia', 'auxiliar')),
  category text,
  operator text,
  capacity_mw numeric,
  status text not null default 'correcto'
    check (status in ('correcto', 'mantenimiento_programado', 'mantenimiento_necesario')),
  latitude double precision not null,
  longitude double precision not null,
  address text,
  state text,
  source text not null default 'manual' check (source in ('manual', 'osm')),
  external_ref text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists units_status_idx on public.units (status);
create index if not exists units_unit_type_idx on public.units (unit_type);
create unique index if not exists units_external_ref_idx on public.units (external_ref)
  where external_ref is not null;

-- ─────────────────────────────────────────────────────────────
-- status_history: bitácora/auditoría de cambios de estatus
-- ─────────────────────────────────────────────────────────────
create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id) on delete cascade,
  previous_status text,
  new_status text not null,
  note text,
  changed_by uuid references auth.users (id),
  changed_at timestamptz not null default now()
);

create index if not exists status_history_unit_id_idx on public.status_history (unit_id);

-- ─────────────────────────────────────────────────────────────
-- profiles: perfil ligero de usuarios del CRM
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'editor',
  created_at timestamptz not null default now()
);

-- crea automáticamente un profile al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- mantiene updated_at fresco en units
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists units_set_updated_at on public.units;
create trigger units_set_updated_at
  before update on public.units
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security — solo usuarios autenticados (sin acceso anónimo)
-- ─────────────────────────────────────────────────────────────
alter table public.units enable row level security;
alter table public.status_history enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "units_select_authenticated" on public.units;
create policy "units_select_authenticated" on public.units
  for select to authenticated using (true);

drop policy if exists "units_insert_authenticated" on public.units;
create policy "units_insert_authenticated" on public.units
  for insert to authenticated with check (true);

drop policy if exists "units_update_authenticated" on public.units;
create policy "units_update_authenticated" on public.units
  for update to authenticated using (true) with check (true);

drop policy if exists "units_delete_authenticated" on public.units;
create policy "units_delete_authenticated" on public.units
  for delete to authenticated using (true);

drop policy if exists "status_history_select_authenticated" on public.status_history;
create policy "status_history_select_authenticated" on public.status_history
  for select to authenticated using (true);

drop policy if exists "status_history_insert_authenticated" on public.status_history;
create policy "status_history_insert_authenticated" on public.status_history
  for insert to authenticated with check (true);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

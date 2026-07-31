-- CRM ANAM — inventario real COSISI + módulo de tickets
-- Ejecutar en el SQL editor de Supabase, después de 0001_init.sql

-- ─────────────────────────────────────────────────────────────
-- units: nuevos campos del inventario real (COSISI)
-- ─────────────────────────────────────────────────────────────
alter table public.units
  add column if not exists vpn_code text,
  add column if not exists site_name text,
  add column if not exists hostname text,
  add column if not exists marca text,
  add column if not exists modelo text,
  add column if not exists numero_serie text,
  add column if not exists capacity_label text,
  add column if not exists rack_location text,
  add column if not exists iniciativa text,
  add column if not exists responsable_administracion text,
  add column if not exists criticidad text,
  add column if not exists es_virtual text;

-- No todos los sitios se pueden geocodificar con precisión.
alter table public.units alter column latitude drop not null;
alter table public.units alter column longitude drop not null;

alter table public.units drop constraint if exists units_source_check;
alter table public.units add constraint units_source_check
  check (source in ('manual', 'osm', 'cosisi'));

create index if not exists units_site_name_idx on public.units (site_name);

-- ─────────────────────────────────────────────────────────────
-- tickets: fallas/incidentes (ERNI SEDENA/SEMAR, incidentes COSISI, manuales)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text,
  origen text not null default 'manual'
    check (origen in ('cosisi', 'erni_sedena', 'erni_semar', 'manual')),
  unit_id uuid references public.units (id) on delete set null,
  site_name text,
  area text,
  equipo text,
  numero_serie text,
  problema text,
  ultimo_avance text,
  estatus text not null default 'abierto'
    check (estatus in ('abierto', 'en_proceso', 'resuelto', 'cancelado')),
  fecha_apertura date,
  contacto_aduana text,
  contacto_anam text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_estatus_idx on public.tickets (estatus);
create index if not exists tickets_origen_idx on public.tickets (origen);
create index if not exists tickets_unit_id_idx on public.tickets (unit_id);

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute procedure public.set_updated_at();

create table if not exists public.ticket_status_history (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  previous_status text,
  new_status text not null,
  note text,
  changed_by uuid references auth.users (id),
  changed_at timestamptz not null default now()
);

create index if not exists ticket_status_history_ticket_id_idx
  on public.ticket_status_history (ticket_id);

alter table public.tickets enable row level security;
alter table public.ticket_status_history enable row level security;

drop policy if exists "tickets_select_authenticated" on public.tickets;
create policy "tickets_select_authenticated" on public.tickets
  for select to authenticated using (true);

drop policy if exists "tickets_insert_authenticated" on public.tickets;
create policy "tickets_insert_authenticated" on public.tickets
  for insert to authenticated with check (true);

drop policy if exists "tickets_update_authenticated" on public.tickets;
create policy "tickets_update_authenticated" on public.tickets
  for update to authenticated using (true) with check (true);

drop policy if exists "tickets_delete_authenticated" on public.tickets;
create policy "tickets_delete_authenticated" on public.tickets
  for delete to authenticated using (true);

drop policy if exists "ticket_status_history_select_authenticated" on public.ticket_status_history;
create policy "ticket_status_history_select_authenticated" on public.ticket_status_history
  for select to authenticated using (true);

drop policy if exists "ticket_status_history_insert_authenticated" on public.ticket_status_history;
create policy "ticket_status_history_insert_authenticated" on public.ticket_status_history
  for insert to authenticated with check (true);

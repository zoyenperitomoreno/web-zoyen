create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  tour_key text,
  tour_name text not null,
  departure_date date,
  people_count integer not null check (people_count between 1 and 30),
  seats integer[] not null default '{}',
  deposit_amount numeric(12,2) not null default 0,
  status text not null default 'pending_payment' check (status in ('inquiry','pending_payment','payment_started','confirmed','completed','cancelled')),
  payment_method text not null default 'not_selected' check (payment_method in ('not_selected','mercado_pago','bank_transfer','cash')),
  payment_status text not null default 'pending' check (payment_status in ('pending','proof_received','approved','rejected','refunded')),
  payment_reference text,
  transfer_receipt_url text,
  admin_notes text,
  lead_type text not null default 'reservation',
  inquiry_type text,
  follow_up_at timestamptz,
  source text not null default 'website',
  check (
    status = 'inquiry'
    or (customer_email is not null and departure_date is not null)
  )
);

alter table public.reservations alter column customer_email drop not null;
alter table public.reservations alter column departure_date drop not null;
alter table public.reservations add column if not exists lead_type text not null default 'reservation';
alter table public.reservations add column if not exists inquiry_type text;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reservations_inquiry_or_booking_required_fields'
      and conrelid = 'public.reservations'::regclass
  ) then
    alter table public.reservations
    add constraint reservations_inquiry_or_booking_required_fields
    check (status = 'inquiry' or (customer_email is not null and departure_date is not null));
  end if;
end $$;

create index if not exists reservations_departure_idx on public.reservations (tour_key, departure_date);
create index if not exists reservations_status_idx on public.reservations (status, payment_status);

alter table public.reservations enable row level security;

drop policy if exists "public can create reservations" on public.reservations;
create policy "public can create reservations" on public.reservations
for insert to anon with check (
  status in ('inquiry','pending_payment') and payment_status = 'pending' and source in ('website','zoyi')
);

drop policy if exists "authenticated staff can read reservations" on public.reservations;
create policy "authenticated staff can read reservations" on public.reservations
for select to authenticated using (true);

drop policy if exists "authenticated staff can update reservations" on public.reservations;
create policy "authenticated staff can update reservations" on public.reservations
for update to authenticated using (true) with check (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

create or replace function public.prevent_double_booking()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.reservations r
    where r.tour_key = new.tour_key
      and r.departure_date = new.departure_date
      and r.status not in ('cancelled')
      and r.seats && new.seats
      and r.id <> new.id
  ) then raise exception 'Uno o más asientos ya están reservados para esa salida.';
  end if;
  return new;
end;
$$;
drop trigger if exists reservations_prevent_double_booking on public.reservations;
create trigger reservations_prevent_double_booking before insert or update of seats, status on public.reservations
for each row execute function public.prevent_double_booking();

create table if not exists public.tour_config (
  id text primary key default 'main',
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.tour_config enable row level security;

drop policy if exists "public can read tour config" on public.tour_config;
create policy "public can read tour config" on public.tour_config
for select to anon, authenticated using (true);

drop policy if exists "authenticated staff can manage tour config" on public.tour_config;
create policy "authenticated staff can manage tour config" on public.tour_config
for all to authenticated using (true) with check (true);

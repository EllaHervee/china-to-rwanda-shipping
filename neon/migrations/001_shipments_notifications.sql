create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  tracking_number text not null unique,
  status text not null default 'Booked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  shipment_id uuid references public.shipments(id) on delete cascade,
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '📦',
  name text not null unique,
  description text not null,
  rate text not null,
  created_at timestamptz not null default now()
);

insert into public.products (icon, name, description, rate) values
  ('📱', 'Phones and electronics', 'Smartphones, laptops, accessories, speakers.', 'From $3 per kg'),
  ('👕', 'Clothing and shoes', 'Wholesale fashion, uniforms, sportswear.', 'From $3 per kg'),
  ('🏠', 'Home appliances', 'Kitchen items, fans, lighting, furniture.', 'Price on request'),
  ('🚗', 'Auto spare parts', 'Motorcycle and car parts, tires, batteries.', 'Price on request'),
  ('🧴', 'Beauty and cosmetics', 'Skincare, hair products, salon tools.', 'From $4 per kg'),
  ('🏗️', 'Building materials', 'Tiles, tools, solar panels, hardware.', 'By sea, per CBM')
on conflict (name) do nothing;

create table if not exists public.admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.account_deletion_requests (
  user_id uuid primary key,
  requested_at timestamptz not null default now(),
  delete_after timestamptz not null default (now() + interval '30 days'),
  status text not null default 'pending' check (status in ('pending', 'processing')),
  updated_at timestamptz not null default now(),
  last_error text
);

create or replace function public.set_shipment_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_shipment_updated_at on public.shipments;
create trigger set_shipment_updated_at
  before update on public.shipments
  for each row execute function public.set_shipment_updated_at();

create or replace function public.notify_shipment_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is not null and old.status is distinct from new.status then
    insert into public.notifications (user_id, shipment_id, title, message)
    values (
      new.user_id,
      new.id,
      'Shipment status updated',
      format('Shipment %s is now %s.', new.tracking_number, new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists shipment_status_notification on public.shipments;
create trigger shipment_status_notification
  after update of status on public.shipments
  for each row execute function public.notify_shipment_status_change();

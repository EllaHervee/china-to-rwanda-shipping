create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracking_number text not null unique,
  status text not null default 'Booked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shipments enable row level security;
grant select on public.shipments to authenticated;## Error Type
Build Error

## Error Message
Module not found: Can't resolve '@neondatabase/serverless'

## Build Output
./frontend/app/api/notifications/route.js:1:1
Error: Module not found: Can't resolve '@neondatabase/serverless'
> 1 | import { neon } from "@neondatabase/serverless";
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  2 | import { NextResponse } from "next/server";
  3 | import { getAuthenticatedUser } from "../../lib/authenticated-user";
  4 |

https://nextjs.org/docs/messages/module-not-found

Next.js version: 16.4.6 (Turbopack)


drop policy if exists "Users can read their own shipments" on public.shipments;
create policy "Users can read their own shipments"
  on public.shipments for select to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shipment_id uuid references public.shipments(id) on delete cascade,
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can mark their own notifications read" on public.notifications;
create policy "Users can mark their own notifications read"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.notify_shipment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.notifications (user_id, shipment_id, title, message)
    values (
      new.user_id,
      new.id,
      'Shipment status updated',
      format('Shipment %s is now %s.', new.tracking_number, new.status)
    );
    new.updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists shipment_status_notification on public.shipments;
create trigger shipment_status_notification
  before update of status on public.shipments
  for each row execute function public.notify_shipment_status_change();

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

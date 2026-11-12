create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  tx_ref text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  amount_rwf integer not null check (amount_rwf > 0),
  payment_method text check (payment_method in ('mtn', 'airtel', 'card')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'review')),
  checkout_url text,
  flw_transaction_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payment_requests_created_idx
  on public.payment_requests (created_at desc);

create index if not exists payment_requests_tx_ref_idx
  on public.payment_requests (tx_ref);

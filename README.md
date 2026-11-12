# CHI-RWA Cargo

The project has a Next.js frontend, a small Node.js API, Supabase Auth for user
accounts, and Neon Postgres for products, shipments, notifications, admins, and
scheduled account deletion.

## Requirements

- Node.js 20.9 or newer
- npm

## Install and configure

From the project root, install dependencies:

```powershell
npm install
```

Copy `frontend/.env.example` to `frontend/.env.local`, then set the Supabase
project URL and publishable key, Neon connection string (`DATABASE_URL`),
Supabase service-role key, and a long random `CRON_SECRET`. Keep `DATABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` server-side; never expose them with
a `NEXT_PUBLIC_` prefix.

Email signup is available at `/signup`, with an optional phone number field.
Google signup and login are also available on the auth page; enable the
Google provider in Supabase Auth, add the Google OAuth client ID and secret, and
allow `http://localhost:3000/auth/confirm` as a redirect URL.

Run `neon/migrations/001_shipments_notifications.sql` in the Neon SQL Editor. It
creates and seeds the public product catalog, shipment and notification tables,
admin allow-list, and account deletion queue. In Supabase Auth URL Configuration,
allow `http://localhost:3000/**` for signup confirmation and password recovery.
Restart the frontend after changing env values.

After creating and confirming your own account, add its Supabase user ID as the
first admin in Neon SQL Editor:

```sql
insert into public.admin_users (user_id)
values ('YOUR-SUPABASE-USER-UUID')
on conflict do nothing;
```

Admins can manage the public product catalog at `/admin`. Users can request
account deletion under `/settings`; they can cancel during the 30-day grace
period. `vercel.json` schedules the deletion worker daily. If you host elsewhere,
configure that host to send a daily `GET /api/cron/process-account-deletions`
request with `Authorization: Bearer <CRON_SECRET>`.

Shipment notifications are generated when an operator changes `status` on a row
in `public.shipments`. Create each shipment with the customer's Supabase user ID,
then change its status in Neon. The landing-page bell and `/account` list refresh
from Neon every 10 seconds. The API verifies the Supabase session and filters each
database query by that user's ID.

## Run

Start each service in its own terminal from the project root:

```powershell
npm run dev:frontend
npm run dev:backend
```

The frontend runs at `http://localhost:3000`. The Node API runs at
`http://localhost:4000` and provides shipping quote endpoints.

## Layout

- `frontend/app/` — Next.js pages, authentication, Neon API routes, admin UI, and account settings
- `frontend/public/js/` — browser JavaScript for the shipping page
- `backend/` — Node.js quote API
- `neon/migrations/` — products, shipments, notifications, admin, and deletion schema

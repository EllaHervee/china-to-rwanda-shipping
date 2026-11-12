import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../lib/authenticated-user";

export const dynamic = "force-dynamic";

async function getUserOrResponse() {
  try {
    const user = await getAuthenticatedUser();
    return user || { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  } catch {
    return { response: NextResponse.json({ error: "Configure Supabase Auth first." }, { status: 503 }) };
  }
}

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

export async function GET() {
  const auth = await getUserOrResponse();
  if (auth.response) return auth.response;
  try {
    const sql = getSql();
    const rows = await sql`select requested_at, delete_after, status
      from public.account_deletion_requests where user_id = ${auth.id} limit 1`;
    return NextResponse.json({ request: rows[0] || null });
  } catch {
    return NextResponse.json({ error: "Configure Neon and apply the database migration." }, { status: 503 });
  }
}

export async function POST() {
  const auth = await getUserOrResponse();
  if (auth.response) return auth.response;
  try {
    const sql = getSql();
    const rows = await sql`insert into public.account_deletion_requests (user_id)
      values (${auth.id})
      on conflict (user_id) do update
        set status = 'pending', updated_at = now(), last_error = null
        where account_deletion_requests.status = 'pending'
      returning requested_at, delete_after, status`;
    if (!rows.length) return NextResponse.json({ error: "This deletion is already being processed." }, { status: 409 });
    return NextResponse.json({ request: rows[0] });
  } catch {
    return NextResponse.json({ error: "Could not schedule account deletion." }, { status: 503 });
  }
}

export async function DELETE() {
  const auth = await getUserOrResponse();
  if (auth.response) return auth.response;
  try {
    const sql = getSql();
    const rows = await sql`delete from public.account_deletion_requests
      where user_id = ${auth.id} and status = 'pending' and delete_after > now()
      returning user_id`;
    if (!rows.length) return NextResponse.json({ error: "No cancellable deletion request was found." }, { status: 409 });
    return NextResponse.json({ cancelled: true });
  } catch {
    return NextResponse.json({ error: "Could not cancel account deletion." }, { status: 503 });
  }
}

import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../lib/authenticated-user";

export const dynamic = "force-dynamic";

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return neon(connectionString);
}

export async function GET(request) {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: "Configure Supabase Auth to view notifications." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in to view notifications." }, { status: 401 });

  const requestedLimit = Number(new URL(request.url).searchParams.get("limit") || 10);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 10;

  try {
    const sql = getSql();
    const [items, unreadRows] = await Promise.all([
      sql`select id, title, message, created_at, read_at
          from public.notifications
          where user_id = ${user.id}
          order by created_at desc
          limit ${limit}`,
      sql`select count(*)::int as unread
          from public.notifications
          where user_id = ${user.id} and read_at is null`,
    ]);
    return NextResponse.json({ items, unread: unreadRows[0]?.unread || 0 });
  } catch (error) {
    const message = error?.message === "DATABASE_URL is not configured"
      ? "Add the Neon DATABASE_URL to frontend/.env.local."
      : "Neon notifications are not ready. Apply the database migration and try again.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(request) {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: "Configure Supabase Auth to update notifications." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in to update notifications." }, { status: 401 });

  let id;
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid notification id." }, { status: 400 });
  }

  try {
    const sql = getSql();
    const updated = await sql`update public.notifications
      set read_at = coalesce(read_at, now())
      where id = ${id} and user_id = ${user.id}
      returning id, read_at`;
    if (!updated.length) return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch {
    return NextResponse.json({ error: "Could not update the notification." }, { status: 503 });
  }
}

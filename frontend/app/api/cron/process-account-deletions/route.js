import { neon } from "@neondatabase/serverless";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Account deletion service is not configured." }, { status: 503 });
  }

  const sql = neon(databaseUrl);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  try {
    await sql`update public.account_deletion_requests
      set status = 'pending', updated_at = now(), last_error = null
      where status = 'processing' and updated_at < now() - interval '1 hour'`;
    const dueUsers = await sql`update public.account_deletion_requests
      set status = 'processing', updated_at = now(), last_error = null
      where user_id in (
        select user_id from public.account_deletion_requests
        where status = 'pending' and delete_after <= now()
        order by delete_after
        limit 25
        for update skip locked
      )
      returning user_id`;

    const results = [];
    for (const { user_id: userId } of dueUsers) {
      try {
        const { data: { user }, error: lookupError } = await admin.auth.admin.getUserById(userId);
        if (lookupError && lookupError.status !== 404) throw lookupError;
        if (user) {
          const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
          if (deleteError) throw deleteError;
        }

        await sql`delete from public.notifications where user_id = ${userId}`;
        await sql`update public.shipments set user_id = null where user_id = ${userId}`;
        await sql`delete from public.admin_users where user_id = ${userId}`;
        await sql`delete from public.account_deletion_requests where user_id = ${userId}`;
        results.push({ userId, status: "deleted" });
      } catch (error) {
        await sql`update public.account_deletion_requests
          set status = 'pending', updated_at = now(), last_error = ${String(error?.message || "Deletion failed").slice(0, 300)}
          where user_id = ${userId}`;
        results.push({ userId, status: "retrying" });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch {
    return NextResponse.json({ error: "Could not process scheduled account deletions." }, { status: 503 });
  }
}

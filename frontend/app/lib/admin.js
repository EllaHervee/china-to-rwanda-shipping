import { neon } from "@neondatabase/serverless";

export async function isAdminUser(userId) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const sql = neon(connectionString);
  const rows = await sql`select user_id from public.admin_users where user_id = ${userId} limit 1`;
  return rows.length > 0;
}

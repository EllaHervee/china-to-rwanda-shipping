import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../lib/authenticated-user";
import { isAdminUser } from "../../lib/admin";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  let user;
  try { user = await getAuthenticatedUser(); } catch {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    if (!(await isAdminUser(user.id))) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Neon admin access is not configured." }, { status: 503 });
  }
  return null;
}

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const sql = getSql();
    const requests = await sql`select id, tx_ref, customer_name, customer_email, customer_phone,
      amount_rwf, payment_method, status, created_at, paid_at
      from public.payment_requests order by created_at desc limit 30`;
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: "Apply the Neon payment requests migration first." }, { status: 503 });
  }
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const amount = Number(body.amountRwf);
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[0-9\s()-]{8,20}$/.test(phone) || !Number.isSafeInteger(amount) || amount < 1 || amount > 100_000_000) {
    return NextResponse.json({ error: "Enter a name, valid email and phone number, and a whole RWF amount." }, { status: 400 });
  }
  if (!process.env.FLW_SECRET_KEY || !process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json({ error: "Configure FLW_SECRET_KEY and NEXT_PUBLIC_SITE_URL before creating payment links." }, { status: 503 });
  }

  try {
    const txRef = `CHI-${randomUUID()}`;
    const sql = getSql();
    const rows = await sql`insert into public.payment_requests (tx_ref, customer_name, customer_email, customer_phone, amount_rwf)
      values (${txRef}, ${name}, ${email}, ${phone}, ${amount})
      returning id, tx_ref, customer_name, customer_email, customer_phone, amount_rwf, status, created_at`;
    const payment = rows[0];
    return NextResponse.json({ payment, url: `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/pay/${payment.id}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create payment request. Check the Neon migration." }, { status: 503 });
  }
}

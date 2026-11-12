import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../lib/authenticated-user";
import { isAdminUser } from "../../lib/admin";

export const dynamic = "force-dynamic";

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

async function requireAdmin() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch {
    return { response: NextResponse.json({ error: "Authentication is not configured." }, { status: 503 }) };
  }
  if (!user) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  try {
    if (!(await isAdminUser(user.id))) {
      return { response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
    }
  } catch {
    return { response: NextResponse.json({ error: "Neon admin access is not configured." }, { status: 503 }) };
  }
  return { user };
}

export async function GET() {
  try {
    const sql = getSql();
    const products = await sql`select id, icon, name, description, rate
      from public.products order by created_at desc, name asc`;
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Product catalog is not ready. Configure Neon and apply its migration." }, { status: 503 });
  }
}

export async function POST(request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const icon = typeof body.icon === "string" ? body.icon.trim() : "📦";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const rate = typeof body.rate === "string" ? body.rate.trim() : "";
  if (!name || name.length > 120 || !description || description.length > 500 || !rate || rate.length > 100 || icon.length > 8) {
    return NextResponse.json({ error: "Enter a product name, description, rate, and a short icon." }, { status: 400 });
  }

  try {
    const sql = getSql();
    const rows = await sql`insert into public.products (icon, name, description, rate)
      values (${icon || "📦"}, ${name}, ${description}, ${rate})
      returning id, icon, name, description, rate`;
    return NextResponse.json({ product: rows[0] }, { status: 201 });
  } catch (error) {
    if (error?.code === "23505") return NextResponse.json({ error: "A product with that name already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not add the product." }, { status: 503 });
  }
}

export async function DELETE(request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let id;
  try { ({ id } = await request.json()); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    const sql = getSql();
    const deleted = await sql`delete from public.products where id = ${id} returning id`;
    if (!deleted.length) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Could not delete the product." }, { status: 503 });
  }
}

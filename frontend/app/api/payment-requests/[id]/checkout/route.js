import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
  }
  const secretKey = process.env.FLW_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!secretKey || !siteUrl || !process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Online payments are not configured yet." }, { status: 503 });
  }

  const sql = neon(process.env.DATABASE_URL);
  let paymentId;
  try {
    const body = await _request.json();
    const paymentMethod = typeof body.method === "string" ? body.method : "";
    if (!["mtn", "airtel", "card"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Choose a supported payment method." }, { status: 400 });
    }
    const rows = await sql`select id, tx_ref, customer_name, customer_email, customer_phone, amount_rwf, status, checkout_url, payment_method
      from public.payment_requests where id = ${id} limit 1`;
    const payment = rows[0];
    if (!payment) return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
    paymentId = payment.id;
    if (payment.status === "paid") return NextResponse.json({ error: "This payment has already been completed." }, { status: 409 });
    if (payment.checkout_url?.startsWith("https://checkout.flutterwave.com/")) {
      if (payment.payment_method !== paymentMethod) return NextResponse.json({ error: "A different payment method is already in checkout. Contact the company to change it." }, { status: 409 });
      return NextResponse.json({ url: payment.checkout_url });
    }
    const claimed = await sql`update public.payment_requests set checkout_url = 'CREATING', payment_method = ${paymentMethod}
      where id = ${payment.id} and status = 'pending' and checkout_url is null returning id`;
    if (!claimed.length) return NextResponse.json({ error: "Checkout is already starting. Please wait a moment and try again." }, { status: 409 });

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        tx_ref: payment.tx_ref,
        amount: payment.amount_rwf,
        currency: "RWF",
        redirect_url: `${siteUrl.replace(/\/$/, "")}/payment/return`,
        payment_options: paymentMethod === "card" ? "card" : "mobilemoneyrwanda",
        customer: { email: payment.customer_email, name: payment.customer_name, phonenumber: payment.customer_phone },
        customizations: { title: "CHI-RWA Cargo", description: `Shipment payment ${payment.tx_ref}` },
        meta: { payment_request_id: payment.id },
      }),
      cache: "no-store",
    });
    const result = await response.json();
    const checkoutUrl = result?.data?.link;
    if (!response.ok || result?.status !== "success" || typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("https://checkout.flutterwave.com/")) {
      await sql`update public.payment_requests set checkout_url = null where id = ${payment.id} and checkout_url = 'CREATING'`;
      return NextResponse.json({ error: "Flutterwave could not create checkout. Please contact CHI-RWA Cargo." }, { status: 502 });
    }
    await sql`update public.payment_requests set checkout_url = ${checkoutUrl}
      where id = ${payment.id} and status = 'pending' and checkout_url = 'CREATING'`;
    return NextResponse.json({ url: checkoutUrl });
  } catch {
    if (paymentId) {
      try { await sql`update public.payment_requests set checkout_url = null where id = ${paymentId} and checkout_url = 'CREATING'`; } catch {}
    }
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}

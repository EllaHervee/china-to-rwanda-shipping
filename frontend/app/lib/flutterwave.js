import { neon } from "@neondatabase/serverless";

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

export async function verifyAndSettlePayment(txRef, transactionId) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) throw new Error("Flutterwave is not configured");
  if (!/^CHI-[0-9a-f-]{36}$/i.test(txRef) || !/^\d+$/.test(String(transactionId))) {
    return { ok: false, status: "invalid" };
  }

  const sql = getSql();
  const requests = await sql`select id, amount_rwf, payment_method, status from public.payment_requests where tx_ref = ${txRef} limit 1`;
  const request = requests[0];
  if (!request) return { ok: false, status: "not_found" };
  if (request.status === "paid") return { ok: true, status: "paid" };

  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not verify payment with Flutterwave");
  const result = await response.json();
  const transaction = result?.data;
  if (result?.status !== "success" || String(transaction?.id) !== String(transactionId) || transaction?.tx_ref !== txRef) {
    return { ok: false, status: "invalid" };
  }

  if (transaction.status !== "successful") {
    const status = transaction.status === "failed" ? "failed" : "pending";
    await sql`update public.payment_requests set status = ${status}, flw_transaction_id = ${String(transactionId)}
      where id = ${request.id} and status <> 'paid'`;
    return { ok: false, status };
  }

  const paymentTypeMatches = request.payment_method === "card"
    ? transaction.payment_type === "card"
    : ["mobilemoneyrw", "mobilemoneyrwanda"].includes(transaction.payment_type);
  if (transaction.currency !== "RWF" || Number(transaction.amount) !== Number(request.amount_rwf) || !paymentTypeMatches) {
    await sql`update public.payment_requests set status = 'review', flw_transaction_id = ${String(transactionId)}
      where id = ${request.id} and status <> 'paid'`;
    return { ok: false, status: "review" };
  }

  await sql`update public.payment_requests
    set status = 'paid', flw_transaction_id = ${String(transactionId)}, paid_at = now()
    where id = ${request.id} and status <> 'paid'`;
  return { ok: true, status: "paid" };
}

export function isAdminPaymentConfigured() {
  return Boolean(process.env.FLW_SECRET_KEY && process.env.DATABASE_URL);
}

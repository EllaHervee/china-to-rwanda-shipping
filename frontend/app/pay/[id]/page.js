import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import SiteShell from "../../site-shell";
import PaymentCheckout from "./checkout";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !process.env.DATABASE_URL) {
    return <SiteShell><PaymentNotFound /></SiteShell>;
  }

  let payment;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`select id, tx_ref, customer_name, amount_rwf, status
      from public.payment_requests where id = ${id} limit 1`;
    payment = rows[0];
  } catch {
    return <SiteShell><PaymentNotFound message="Payment service is not ready. Contact CHI-RWA Cargo for help." /></SiteShell>;
  }
  if (!payment) return <SiteShell><PaymentNotFound /></SiteShell>;

  return (
    <SiteShell>
      <section className="account-section">
        <div className="wrap auth-wrap">
          <div className="card auth-card">
            <p className="eyebrow">CHI-RWA Cargo payment</p>
            <h1>Pay your shipment quote</h1>
            <p className="sub">Payment request for {payment.customer_name}</p>
            <div className="payment-summary">
              <span>Amount due</span><strong>{Number(payment.amount_rwf).toLocaleString("en-RW")} RWF</strong>
              <span>Reference</span><strong>{payment.tx_ref}</strong>
              <span>Status</span><strong>{payment.status === "paid" ? "Paid" : payment.status === "review" ? "Under review" : "Awaiting payment"}</strong>
            </div>
            {payment.status === "paid" ? <p className="form-message" role="status">This payment has already been confirmed.</p> : payment.status === "review" ? <p className="form-message error">Please contact CHI-RWA Cargo about this payment.</p> : <PaymentCheckout id={payment.id} txRef={payment.tx_ref} amount={payment.amount_rwf} />}
            <p className="sub payment-method-note">MTN and Airtel Mobile Money and card checkout are processed through Flutterwave. Bank transfers are arranged with the company.</p>
            <Link className="auth-switch" href="/contact">Need help? Contact us.</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function PaymentNotFound({ message = "This payment link is invalid or unavailable." }) {
  return <section className="account-section"><div className="wrap auth-wrap"><div className="card auth-card"><h1>Payment link unavailable</h1><p className="sub">{message}</p><Link className="btn" href="/contact">Contact CHI-RWA Cargo</Link></div></div></section>;
}

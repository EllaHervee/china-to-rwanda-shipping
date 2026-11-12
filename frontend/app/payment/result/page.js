import Link from "next/link";
import SiteShell from "../../site-shell";

const copy = {
  paid: { heading: "Payment confirmed", message: "Your payment has been verified. CHI-RWA Cargo will follow up about your shipment." },
  review: { heading: "Payment needs review", message: "We received a payment notification but could not match the amount. Please contact CHI-RWA Cargo before paying again." },
  failed: { heading: "Payment was not completed", message: "No successful payment was confirmed. Contact CHI-RWA Cargo if your account was charged." },
  cancelled: { heading: "Checkout cancelled", message: "No payment was confirmed. You can return to the payment link and try again." },
  pending: { heading: "Payment is processing", message: "Your mobile money provider may still be processing the request. Wait a moment, then contact CHI-RWA Cargo if the status does not update." },
  unknown: { heading: "Payment status unavailable", message: "We could not match this return to a payment request. Contact CHI-RWA Cargo for help." },
};

export default async function PaymentResultPage({ searchParams }) {
  const params = await searchParams;
  const result = copy[params?.status] || copy.unknown;
  return (
    <SiteShell>
      <section className="account-section">
        <div className="wrap auth-wrap">
          <div className="card auth-card">
            <p className="eyebrow">CHI-RWA Cargo payments</p>
            <h1>{result.heading}</h1>
            <p className="sub">{result.message}</p>
            <Link className="btn" href="/">Back to home</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

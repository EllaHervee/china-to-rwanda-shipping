import Link from "next/link";
import { redirect } from "next/navigation";
import SiteShell from "../../site-shell";
import { verifyAndSettlePayment } from "../../lib/flutterwave";

export const dynamic = "force-dynamic";

export default async function PaymentReturnPage({ searchParams }) {
  const params = await searchParams;
  const txRef = typeof params?.tx_ref === "string" ? params.tx_ref : "";
  const transactionId = typeof params?.transaction_id === "string" ? params.transaction_id : "";
  if (!txRef) redirect("/payment/result?status=unknown");

  let status = params?.status === "cancelled" ? "cancelled" : "pending";
  if (transactionId) {
    try {
      const result = await verifyAndSettlePayment(txRef, transactionId);
      status = result.status;
    } catch {
      status = "pending";
    }
  }
  redirect(`/payment/result?status=${encodeURIComponent(status)}`);
}

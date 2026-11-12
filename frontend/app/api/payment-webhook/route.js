import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyAndSettlePayment } from "../../lib/flutterwave";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const configuredHash = process.env.FLW_SECRET_HASH || "";
  const receivedHash = request.headers.get("verif-hash") || "";
  const expected = Buffer.from(configuredHash);
  const received = Buffer.from(receivedHash);
  if (!expected.length || expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const transactionId = payload?.data?.id;
    const txRef = payload?.data?.tx_ref;
    if (!transactionId || typeof txRef !== "string") return NextResponse.json({ received: true });
    await verifyAndSettlePayment(txRef, transactionId);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Could not verify payment event." }, { status: 503 });
  }
}

"use client";

import { useState } from "react";

export default function PaymentCheckout({ id, txRef, amount }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("mtn");
  const [cardTransfer, setCardTransfer] = useState("card");

  const contactMessage = encodeURIComponent("Hello CHI-RWA Cargo, I need help paying payment request " + txRef + " for RWF " + Number(amount).toLocaleString("en-RW") + ".");
  const contactUrl = "https://wa.me/250783553434?text=" + contactMessage;
  const needsCompany = method === "discuss" || (method === "card_bank" && cardTransfer === "bank_transfer");

  async function startCheckout() {
    setBusy(true);
    setError("");
    try {
      const checkoutMethod = method === "card_bank" ? cardTransfer : method;
      const response = await fetch("/api/payment-requests/" + id + "/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ method: checkoutMethod }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not start payment.");
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(checkoutError.message);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="auth-form payment-method-form">
        <label htmlFor="payment-method-choice">Payment method</label>
        <select id="payment-method-choice" value={method} onChange={(event) => setMethod(event.target.value)}>
          <option value="mtn">MTN Mobile Money</option>
          <option value="airtel">Airtel Money</option>
          <option value="card_bank">Card / Bank Transfer</option>
          <option value="discuss">Discuss with company</option>
        </select>
        {method === "card_bank" && <>
          <label htmlFor="card-transfer-choice">Choose card or bank transfer</label>
          <select id="card-transfer-choice" value={cardTransfer} onChange={(event) => setCardTransfer(event.target.value)}>
            <option value="card">Card (online)</option>
            <option value="bank_transfer">Bank transfer (arrange with company)</option>
          </select>
        </>}
        {(method === "airtel" || (method === "card_bank" && cardTransfer === "bank_transfer") || method === "discuss") && <p className="sub payment-method-note">
          {method === "airtel" ? "Airtel Money is available through Flutterwave where enabled for your account." : "We’ll help you arrange this payment directly."}
        </p>}
      </div>
      {error && <p className="form-message error" role="alert">{error}</p>}
      {needsCompany
        ? <a className="btn" href={contactUrl} target="_blank" rel="noreferrer">{method === "discuss" ? "Discuss with company" : "Get bank transfer details"}</a>
        : <button className="btn" type="button" onClick={startCheckout} disabled={busy}>{busy ? "Connecting to checkout…" : "Pay securely"}</button>}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

export default function PaymentsManager() {
  const [requests, setRequests] = useState([]);
  const [createdUrl, setCreatedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/payment-requests", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load payment requests.");
      setRequests(result.requests || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  async function createRequest(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const body = Object.fromEntries(new FormData(formElement).entries());
    setWorking(true);
    setError("");
    setMessage("");
    setCreatedUrl("");
    try {
      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create payment request.");
      setCreatedUrl(result.url);
      setMessage("Payment request created. Send this link to the customer after confirming their quote.");
      formElement.reset();
      await loadRequests();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setWorking(false);
    }
  }

  async function copyLink(id) {
    const url = `${window.location.origin}/pay/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Payment link copied.");
    } catch {
      setError(`Copy this payment link: ${url}`);
    }
  }

  return (
    <div className="payment-admin">
      <div>
        <p className="eyebrow">Checkout</p>
        <h2>Create a payment request</h2>
        <p className="sub">After you confirm a quote, create a fixed RWF payment link and send it to your customer.</p>
        <section className="card">
          <form className="auth-form" onSubmit={createRequest}>
            <label htmlFor="payment-customer-name">Customer name</label>
            <input id="payment-customer-name" name="name" required maxLength={120} />
            <label htmlFor="payment-customer-email">Customer email</label>
            <input id="payment-customer-email" name="email" type="email" required />
            <label htmlFor="payment-customer-phone">Mobile money phone</label>
            <input id="payment-customer-phone" name="phone" type="tel" placeholder="+2507XXXXXXXX" required />
            <label htmlFor="payment-amount-rwf">Confirmed amount (RWF)</label>
            <input id="payment-amount-rwf" name="amountRwf" type="number" min="1" max="100000000" step="1" required />
            <button className="btn" type="submit" disabled={working}>{working ? "Creating link…" : "Create payment link"}</button>
          </form>
        </section>
      </div>
      <section className="card payment-requests-card">
        <h2>Payment requests</h2>
        {message && <p className="form-message" role="status">{message}</p>}
        {error && <p className="form-message error" role="alert">{error}</p>}
        {createdUrl && <p className="payment-share-link"><a href={createdUrl}>{createdUrl}</a></p>}
        {loading && <p>Loading payment requests…</p>}
        {!loading && !requests.length && <p>No payment requests yet.</p>}
        <div className="admin-products">
          {requests.map((item) => (
            <article className="admin-product payment-request" key={item.id}>
              <div className="admin-product-copy">
                <h3>{item.customer_name} · {Number(item.amount_rwf).toLocaleString("en-RW")} RWF</h3>
                <p>{item.customer_email} · {item.customer_phone}</p>
                <small>{item.tx_ref} · {item.status}</small>
              </div>
              <button className="delete-button" type="button" onClick={() => copyLink(item.id)}>Copy link</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

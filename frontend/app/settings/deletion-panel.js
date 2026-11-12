"use client";

import { useEffect, useState } from "react";

export default function DeletionPanel() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadRequest() {
    try {
      const response = await fetch("/api/account-deletion", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load account settings.");
      setRequest(result.request);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequest(); }, []);

  async function requestDeletion() {
    if (!window.confirm("Schedule your account for deletion in 30 days? You can cancel before then.")) return;
    setWorking(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account-deletion", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not schedule account deletion.");
      setRequest(result.request);
      setMessage("Your account is scheduled for deletion. You can cancel the request before the due date.");
    } catch (actionError) { setError(actionError.message); }
    finally { setWorking(false); }
  }

  async function cancelDeletion() {
    setWorking(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account-deletion", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not cancel account deletion.");
      setRequest(null);
      setMessage("The account deletion request has been cancelled.");
    } catch (actionError) { setError(actionError.message); }
    finally { setWorking(false); }
  }

  return (
    <section className="card settings-card">
      <p className="eyebrow">Account</p>
      <h2>Delete your account</h2>
      <p>Your account will remain active for 30 days after a deletion request. You can cancel during that period. When the request is processed, your sign-in account and notifications will be deleted; shipment records will be unlinked from your account.</p>
      {loading && <p>Loading account settings…</p>}
      {error && <p className="form-message error" role="alert">{error}</p>}
      {message && <p className="form-message" role="status">{message}</p>}
      {request && <div className="deletion-scheduled"><strong>Deletion scheduled</strong><p>Scheduled date: {new Date(request.delete_after).toLocaleString()}</p><button className="btn alt" type="button" disabled={working || request.status === "processing"} onClick={cancelDeletion}>Cancel request</button></div>}
      {!loading && !request && <button className="danger-button" type="button" disabled={working} onClick={requestDeletion}>{working ? "Saving…" : "Request account deletion"}</button>}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=50", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        setConnected(false);
        setError(result.error || "Notifications could not be loaded.");
        return;
      }
      setItems(result.items || []);
      setUnread(result.unread || 0);
      setConnected(true);
      setError("");
    } catch {
      setConnected(false);
      setError("Could not reach the notification service. Retrying shortly.");
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 10000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  async function markRead(id) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      setError("Could not mark this notification as read.");
      return;
    }
    const result = await response.json();
    setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: result.read_at } : item));
    setUnread((current) => Math.max(0, current - 1));
  }

  return (
    <section className="notification-card" aria-labelledby="notifications-title">
      <div className="notification-heading">
        <div>
          <h2 id="notifications-title">Notifications</h2>
          <p className="sub">Shipment status updates for your account.</p>
        </div>
        <span className={`connection-status ${connected ? "online" : ""}`}>
          {connected ? "Auto-updating" : "Connecting"}
        </span>
      </div>
      <p className="unread-count">{unread ? `${unread} unread` : "All caught up"}</p>
      {error && <p className="form-message error" role="alert">{error}</p>}
      {!error && items.length === 0 && <div className="notification-empty">No shipment updates yet. Updates will appear here when a shipment status changes.</div>}
      <div className="notification-list">
        {items.map((item) => (
          <article className={`notification-item ${item.read_at ? "read" : "unread"}`} key={item.id}>
            <div>
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
            </div>
            {!item.read_at && <button className="text-button" type="button" onClick={() => markRead(item.id)}>Mark read</button>}
          </article>
        ))}
      </div>
    </section>
  );
}

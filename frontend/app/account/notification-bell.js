"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=5", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        setSignedIn(false);
        setReady(true);
        return;
      }
      if (!response.ok) {
        setReady(true);
        return;
      }
      setSignedIn(true);
      setItems(result.items || []);
      setUnread(result.unread || 0);
      setReady(true);
    } catch {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 10000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="notification-toggle"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg className="notification-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unread > 0 && <span className="notification-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="notification-popover" role="region" aria-label="Recent notifications">
          <h3>Notifications</h3>
          {!ready && <p>Loading updates…</p>}
          {ready && !signedIn && <p><Link href="/login">Log in</Link> to receive shipment updates.</p>}
          {ready && signedIn && items.length === 0 && <p>No shipment updates yet.</p>}
          {items.map((item) => (
            <article className={`notification-preview ${item.read_at ? "read" : "unread"}`} key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
            </article>
          ))}
          {signedIn && <Link className="notification-all" href="/account">View all updates</Link>}
        </div>
      )}
    </div>
  );
}

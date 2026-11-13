"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit(event) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <div className="site-search">
      <button className="search-toggle" type="button" aria-label={open ? "Close search" : "Search"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <span aria-hidden="true">×</span> : <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>}
      </button>
      {open && <form className="search-panel" role="search" onSubmit={submit}>
        <label className="sr-only" htmlFor="site-search-input">Search the website</label>
        <input ref={inputRef} id="site-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or pages" />
        <button className="btn" type="submit">Search</button>
      </form>}
    </div>
  );
}

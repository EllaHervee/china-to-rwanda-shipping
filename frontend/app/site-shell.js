import Script from "next/script";
import NotificationBell from "./account/notification-bell";
import { LanguageControl } from "./language-control";

function SiteHeader() {
  return (
    <header>
      <div className="wrap">
        <a className="brand" href="/" aria-label="CHI-RWA Cargo home">
          <span className="brand-mark">
            <svg width="44" height="36" viewBox="160 40 360 210" aria-hidden="true">
              <circle cx="330" cy="125" r="72" fill="#f59e0b" />
              <path d="M170 202C175 90 280 45 470 55C310 80 240 125 225 202Z" fill="#1e2a78" />
              <rect x="225" y="166" width="34" height="24" fill="#de2910" />
              <rect x="261" y="166" width="34" height="24" fill="#fad201" />
              <rect x="297" y="166" width="34" height="24" fill="#00a1de" />
              <rect x="261" y="142" width="34" height="24" fill="#20603d" />
              <rect x="400" y="140" width="50" height="50" fill="#1e2a78" />
              <path d="M190 190H505Q485 224 452 237H225Z" fill="#1e2a78" />
            </svg>
          </span>
          <span>CHI-RWA CARGO</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
          <a className="hide" href="/how-it-works">How it works</a>
          <a className="hide" href="/products">Products</a>
          <a href="/quote">Get a quote</a>
          <a href="/book">Book</a>
          <div className="nav-locale">
            <a href="/contact">Contact</a>
            <div className="sw">
              <LanguageControl />
              <select id="cur" aria-label="Currency">
                <option value="USD">$ USD</option>
                <option value="RWF">RWF</option>
                <option value="CNY">¥ CNY</option>
              </select>
            </div>
          </div>
          <NotificationBell />
          <a href="/login">Log in</a>
          <a className="signup-link" href="/signup">Sign up</a>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div>© 2026 CHI-RWA Cargo · China to Rwanda shipping</div>
        <div className="footer-social">
          <strong>Find us</strong>
          <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.3-8.4L1.8 2h6.4l4.4 6.9L18.9 2Zm-1.1 18h1.7L7.2 3.9H5.4L17.8 20Z" /></svg>
            X
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="instagram-dot" cx="17.5" cy="6.5" r="1" /></svg>
            Instagram
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5h2V3.8c-.4-.1-1.5-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.9V10H7v3h3.1v8H14Z" /></svg>
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function SiteShell({ content, children }) {
  return (
    <>
      <SiteHeader />
      <main id="top">
        {content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : children}
      </main>
      <SiteFooter />
      <Script src="/js/app.js" strategy="afterInteractive" />
    </>
  );
}

import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordForm({ error, message }) {
  return (
    <section className="account-section">
      <div className="wrap auth-wrap">
        <div className="card auth-card">
          <p className="eyebrow">Account recovery</p>
          <h1>Forgot your password?</h1>
          <p className="sub">Enter your account email and we’ll send a secure password reset link if an account matches.</p>
          {error === "setup" && <p className="form-message error" role="alert">Supabase Auth is not configured yet.</p>}
          {error === "missing" && <p className="form-message error" role="alert">Enter your email address.</p>}
          {error === "confirmation" && <p className="form-message error" role="alert">That reset link is invalid or expired. Request a new one.</p>}
          {message === "sent" && <p className="form-message" role="status">If an account exists for that email, a reset link is on its way.</p>}
          <form action={requestPasswordReset} className="auth-form">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
            <button className="btn" type="submit">Send reset link</button>
          </form>
          <p className="auth-switch"><Link href="/login">Back to log in</Link></p>
        </div>
      </div>
    </section>
  );
}

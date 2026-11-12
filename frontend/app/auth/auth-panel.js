import Link from "next/link";
import { signIn, signInWithGoogle, signUp } from "./actions";

const errorText = {
  setup: "Add Neon DATABASE_URL and Supabase Auth settings to frontend/.env.local, then restart the app. Neon stores the app data; Supabase currently handles sign-in and sign-up.",
  google: "Google sign-in is not configured. Enable the Google provider in Supabase Auth and add its OAuth credentials.",
  missing: "Enter your email and password.",
  credentials: "We could not sign you in with those details.",
  invalid: "Enter your name and email, a valid phone number if provided, and a password with at least 8 characters.",
  signup: "We could not create the account. Check the email address and try again.",
  confirmation: "The email confirmation link is invalid or expired. Request a new sign-up email.",
};

export default function AuthPanel({ mode, error, message }) {
  const signingUp = mode === "signup";
  return (
    <section className="account-section">
      <div className="wrap auth-wrap">
        <div className="card auth-card">
          <p className="eyebrow">CHI-RWA Cargo account</p>
          <h1>{signingUp ? "Create your account" : "Welcome back"}</h1>
          <p className="sub">
            {signingUp
              ? "Create an account with your email address to follow your bookings and shipment updates."
              : "Log in to see your bookings and shipment notifications."}
          </p>
          {error && <p className="form-message error" role="alert">{errorText[error] || "Something went wrong. Please try again."}</p>}
          {message === "check-email" && <p className="form-message" role="status">Check your email to confirm your account, then log in.</p>}
          {message === "signed-out" && <p className="form-message" role="status">You have been signed out.</p>}
          <form action={signingUp ? signUp : signIn} className="auth-form">
            {signingUp && <><label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" required /></>}
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
            {signingUp && <><label htmlFor="phone">Phone number (optional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+2507XXXXXXXX" pattern="\+[1-9][0-9]{7,14}" title="Include the country code, for example +2507XXXXXXXX" /></>}
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete={signingUp ? "new-password" : "current-password"} minLength={signingUp ? 8 : undefined} required />
            <button className="btn" type="submit">{signingUp ? "Create account" : "Log in"}</button>
          </form>
          <div className="auth-divider"><span>or continue with</span></div>
          <form action={signInWithGoogle}>
            <input type="hidden" name="destination" value={signingUp ? "signup" : "login"} />
            <button className="google-auth-button" type="submit">
              <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.16 7.14-17.56Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.95 23.95 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>
              {signingUp ? "Sign up with Google" : "Continue with Google"}
            </button>
          </form>
          {!signingUp && <p className="auth-switch"><Link href="/forgot-password">Forgot your password?</Link></p>}
          <p className="auth-switch">
            {signingUp ? "Already have an account? " : "New to CHI-RWA Cargo? "}
            <Link href={signingUp ? "/login" : "/signup"}>{signingUp ? "Log in" : "Sign up"}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

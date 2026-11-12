import { updatePassword } from "./actions";

export default function UpdatePasswordForm({ error }) {
  return (
    <section className="account-section">
      <div className="wrap auth-wrap">
        <div className="card auth-card">
          <p className="eyebrow">Account recovery</p>
          <h1>Choose a new password</h1>
          <p className="sub">Use at least 8 characters.</p>
          {error && <p className="form-message error" role="alert">{error === "weak" ? "Choose a password with at least 8 characters." : "The reset link may have expired. Request a new one."}</p>}
          <form action={updatePassword} className="auth-form">
            <label htmlFor="password">New password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <button className="btn" type="submit">Update password</button>
          </form>
        </div>
      </div>
    </section>
  );
}

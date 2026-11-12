import SiteShell from "../site-shell";
import ForgotPasswordForm from "../auth/forgot-password-form";

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  return <SiteShell><ForgotPasswordForm error={params?.error} message={params?.message} /></SiteShell>;
}

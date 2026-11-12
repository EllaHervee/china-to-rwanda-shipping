import { redirect } from "next/navigation";
import SiteShell from "../site-shell";
import { createClient } from "../lib/supabase/server";
import UpdatePasswordForm from "../auth/update-password-form";

export default async function UpdatePasswordPage({ searchParams }) {
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/login?error=setup"); }
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims?.sub) redirect("/forgot-password?error=confirmation");
  const params = await searchParams;
  return <SiteShell><UpdatePasswordForm error={params?.error} /></SiteShell>;
}

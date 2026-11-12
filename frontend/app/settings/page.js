import { redirect } from "next/navigation";
import SiteShell from "../site-shell";
import { createClient } from "../lib/supabase/server";
import DeletionPanel from "./deletion-panel";

export default async function SettingsPage() {
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/login?error=setup"); }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  return (
    <SiteShell>
      <section className="account-section">
        <div className="wrap settings-wrap">
          <p className="eyebrow">Account settings</p>
          <h1>Manage your account</h1>
          <p className="sub">Signed in as {user.email}</p>
          <DeletionPanel />
        </div>
      </section>
    </SiteShell>
  );
}

import { redirect } from "next/navigation";
import SiteShell from "../site-shell";
import { signOut } from "../auth/actions";
import { createClient } from "../lib/supabase/server";
import { isAdminUser } from "../lib/admin";
import Notifications from "./notifications";

export default async function AccountPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login?error=setup");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");
  const admin = await isAdminUser(user.id).catch(() => false);

  return (
    <SiteShell>
      <section className="account-section">
        <div className="wrap account-wrap">
          <div className="account-title">
            <div>
              <p className="eyebrow">Your CHI-RWA Cargo account</p>
              <h1>Shipment updates</h1>
              <p className="sub">Signed in as {user.email}</p>
              <div className="account-links">
                <a href="/settings">Account settings</a>
                {admin && <a href="/admin">Admin dashboard</a>}
              </div>
            </div>
            <form action={signOut}><button className="btn alt" type="submit">Log out</button></form>
          </div>
          <Notifications />
        </div>
      </section>
    </SiteShell>
  );
}

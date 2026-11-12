import { redirect } from "next/navigation";
import SiteShell from "../site-shell";
import { getAuthenticatedUser } from "../lib/authenticated-user";
import { isAdminUser } from "../lib/admin";
import ProductsManager from "./products-manager";

export default async function AdminPage() {
  let user;
  try { user = await getAuthenticatedUser(); } catch { redirect("/login?error=setup"); }
  if (!user) redirect("/login");
  let allowed = false;
  try { allowed = await isAdminUser(user.id); } catch { redirect("/account?error=admin-setup"); }
  if (!allowed) redirect("/account?error=admin");

  return (
    <SiteShell>
      <section className="account-section">
        <div className="wrap">
          <p className="eyebrow">Administration</p>
          <h1>Manage products</h1>
          <p className="sub">Add or remove products shown in the public catalog.</p>
          <ProductsManager />
        </div>
      </section>
    </SiteShell>
  );
}

import SiteShell from "../site-shell";
import AuthPanel from "../auth/auth-panel";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <SiteShell>
      <AuthPanel mode="login" error={params?.error} message={params?.message} />
    </SiteShell>
  );
}

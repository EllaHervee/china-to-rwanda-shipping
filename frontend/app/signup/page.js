import SiteShell from "../site-shell";
import AuthPanel from "../auth/auth-panel";

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  return (
    <SiteShell>
      <AuthPanel mode="signup" error={params?.error} message={params?.message} />
    </SiteShell>
  );
}

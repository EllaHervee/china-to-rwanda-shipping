import SiteShell from "./site-shell";
import content from "./content/home.json";

export default function Page() {
  return <SiteShell content={content} />;
}

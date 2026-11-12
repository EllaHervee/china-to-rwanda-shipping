import SiteShell from "../site-shell";
import content from "../content/products.json";

export default function Page() {
  return <SiteShell content={content} />;
}

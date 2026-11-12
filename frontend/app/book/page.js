import SiteShell from "../site-shell";
import content from "../content/book.json";

export default function Page() {
  return <SiteShell content={content} />;
}

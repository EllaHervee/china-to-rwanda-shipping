import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import SiteShell from "../site-shell";

export const dynamic = "force-dynamic";

const pages = [
  { title: "Home", description: "Shipping from China to Rwanda", href: "/" },
  { title: "How it works", description: "Learn about the shipping process", href: "/how-it-works" },
  { title: "Products", description: "Products available to ship from China", href: "/products" },
  { title: "Get a quote", description: "Shipping estimate and parcel tracking", href: "/quote" },
  { title: "Book", description: "Book your shipment", href: "/book" },
  { title: "Contact", description: "Phone, email, office and location", href: "/contact" },
];

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.trim().slice(0, 80) : "";
  const normalized = query.toLocaleLowerCase();
  const pageResults = normalized
    ? pages.filter((page) => `${page.title} ${page.description}`.toLocaleLowerCase().includes(normalized))
    : [];

  let products = [];
  if (query && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
      products = await sql`select id, name, description, rate from public.products
        where name ilike ${pattern} or description ilike ${pattern}
        order by name asc limit 20`;
    } catch {
      products = [];
    }
  }

  return (
    <SiteShell>
      <section className="account-section">
        <div className="wrap search-results-wrap">
          <p className="eyebrow">CHI-RWA Cargo</p>
          <h1>Search</h1>
          {!query && <p className="sub">Enter a product or page name in the search box.</p>}
          {query && <p className="sub">Results for “{query}”</p>}
          {!!pageResults.length && <div className="search-results">
            {pageResults.map((page) => <Link className="card search-result" href={page.href} key={page.href}><h2>{page.title}</h2><p>{page.description}</p></Link>)}
          </div>}
          {!!products.length && <>
            <h2 className="search-section-title">Products</h2>
            <div className="search-results">
              {products.map((product) => <Link className="card search-result" href="/products" key={product.id}><h2>{product.name}</h2><p>{product.description}</p><strong>{product.rate}</strong></Link>)}
            </div>
          </>}
          {query && !pageResults.length && !products.length && <div className="card search-empty"><p>No matches found.</p><Link href="/contact">Contact us and we’ll help you find it.</Link></div>}
        </div>
      </section>
    </SiteShell>
  );
}

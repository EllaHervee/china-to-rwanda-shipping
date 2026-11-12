"use client";

import { useEffect, useState } from "react";

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load products.");
      setProducts(result.products || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  async function addProduct(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setWorking(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add the product.");
      setProducts((current) => [result.product, ...current]);
      formElement.reset();
      setMessage("Product added.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setWorking(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete “${product.name}” from the catalog?`)) return;
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete the product.");
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage("Product deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="admin-grid">
      <section className="card">
        <h2>Add a product</h2>
        <form className="auth-form" onSubmit={addProduct}>
          <label htmlFor="product-icon">Icon or emoji</label>
          <input id="product-icon" name="icon" defaultValue="📦" maxLength={8} />
          <label htmlFor="product-name">Product name</label>
          <input id="product-name" name="name" required maxLength={120} />
          <label htmlFor="product-description">Description</label>
          <textarea id="product-description" name="description" required maxLength={500} />
          <label htmlFor="product-rate">Rate</label>
          <input id="product-rate" name="rate" required maxLength={100} placeholder="e.g. From $3 per kg" />
          <button className="btn" type="submit" disabled={working}>{working ? "Saving…" : "Add product"}</button>
        </form>
      </section>
      <section className="card admin-catalog">
        <h2>Product catalog</h2>
        {message && <p className="form-message" role="status">{message}</p>}
        {error && <p className="form-message error" role="alert">{error}</p>}
        {loading && <p>Loading products…</p>}
        {!loading && !products.length && <p>No products have been added yet.</p>}
        <div className="admin-products">
          {products.map((product) => (
            <article className="admin-product" key={product.id}>
              <span className="admin-product-icon" aria-hidden="true">{product.icon}</span>
              <div className="admin-product-copy">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <small>{product.rate}</small>
              </div>
              <button className="delete-button" type="button" disabled={working} onClick={() => deleteProduct(product)}>Delete</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

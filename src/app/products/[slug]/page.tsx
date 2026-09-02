"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Stars } from "@/components/ProductCard";
import { useStore } from "@/components/Shell";
import type { Product, Review } from "@/lib/types";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { refresh, wishIds } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("DESCRIPTION");
  const [main, setMain] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/products?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else {
          setProduct(d.product);
          setReviews(d.reviews || []);
          setColor(d.product.colors[0]);
          setSize(d.product.sizes[0]);
          setMain(d.product.image);
        }
      });
  }, [slug]);

  async function add(buy = false) {
    if (!product) return;
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, color, size, qty })
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error);
    await refresh();
    router.push(buy ? "/checkout" : "/cart");
  }

  async function wish() {
    if (!product) return;
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id })
    });
    await refresh();
  }

  if (!product) return <div className="container page">{err || "Loading…"}</div>;

  return (
    <div className="container page">
      <p className="muted">
        Home &gt; {product.category} &gt; {product.name}
      </p>
      {err && <div className="alert">{err}</div>}
      <div className="pdp">
        <div className="gallery">
          <div className="thumbs">
            {product.images.map((src) => (
              <button key={src} onClick={() => setMain(src)}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <img className="main-img" src={main} alt={product.name} />
        </div>
        <div>
          <h1>{product.name}</h1>
          <Stars value={product.rating} />
          <p className="muted">{product.reviewCount} reviews</p>
          <p className="price" style={{ fontSize: 24 }}>
            ${product.price.toFixed(2)}
          </p>
          <p>{product.description}</p>
          <p>
            <strong>Color</strong>
          </p>
          <div className="swatches">
            {product.colors.map((c) => (
              <button key={c} className={`swatch ${color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <p>
            <strong>Size</strong>
          </p>
          <div className="sizes">
            {product.sizes.map((s) => (
              <button key={s} className={`size ${size === s ? "on" : ""}`} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>
          <p>
            <strong>Quantity</strong>
          </p>
          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
          </div>
          <div className="actions">
            <button className="btn" onClick={() => add(false)}>
              Add to cart
            </button>
            <button className="btn secondary" onClick={() => add(true)}>
              Buy now
            </button>
          </div>
          <button className="btn ghost" onClick={wish}>
            {wishIds.includes(product.id) ? "Saved to wishlist" : "Add to wishlist"}
          </button>
        </div>
      </div>
      <div className="tabs">
        {(
          [
            ["DESCRIPTION", "DESCRIPTION"],
            ["REVIEWS", `REVIEWS (${reviews.length})`],
            ["SHIPPING & RETURNS", "SHIPPING & RETURNS"]
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", padding: 18, borderRadius: 12, marginTop: 12 }}>
        {tab === "DESCRIPTION" && (
          <>
            <ul>
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <ul>
              {Object.entries(product.specs).map(([k, v]) => (
                <li key={k}>
                  <strong>{k}:</strong> {v}
                </li>
              ))}
            </ul>
          </>
        )}
        {tab === "REVIEWS" &&
          reviews.map((r) => (
            <div key={r.id} style={{ marginBottom: 12 }}>
              <strong>{r.author}</strong> <Stars value={r.rating} />
              <p>{r.text}</p>
            </div>
          ))}
        {tab === "SHIPPING & RETURNS" && <p>{product.shipping}</p>}
      </div>
    </div>
  );
}

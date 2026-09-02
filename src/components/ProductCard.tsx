"use client";

import Link from "next/link";
import { useStore } from "./Shell";
import type { Product } from "@/lib/types";

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return <div className="stars">{"★".repeat(full)}{"☆".repeat(5 - full)}</div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { wishIds, refresh } = useStore();
  const wished = wishIds.includes(product.id);

  async function add(buy = false) {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, qty: 1 })
    });
    await refresh();
    if (buy) window.location.href = "/checkout";
  }

  async function wish() {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id })
    });
    await refresh();
  }

  return (
    <article className="card">
      <div className="thumb" style={{ backgroundImage: `url(${product.image})` }}>
        <button className="wish" onClick={wish} aria-label="Wishlist">
          {wished ? "♥" : "♡"}
        </button>
        <div className="hover-actions">
          <button className="btn" onClick={() => add(false)}>
            Add to cart
          </button>
          <button className="btn secondary" onClick={() => add(true)}>
            Buy now
          </button>
        </div>
      </div>
      <div className="body">
        <Link href={`/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="price">${product.price.toFixed(2)}</div>
        <Stars value={product.rating} />
      </div>
    </article>
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  const items = Array.from({ length: pages }, (_, i) => i + 1).slice(0, 8);
  return (
    <nav className="pager">
      {items.map((n) => (
        <Link key={n} className={n === page ? "on" : ""} href={href(n)}>
          {n}
        </Link>
      ))}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product, Testimonial } from "@/lib/types";
import { Stars } from "@/components/ProductCard";

const CATS = [
  { name: "Men", img: "https://images.unsplash.com/photo-1490578474895-869c11ebc637?auto=format&fit=crop&w=300&q=80" },
  { name: "Women", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80" },
  { name: "Footwear", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80" },
  { name: "Bags", img: "https://images.unsplash.com/photo-1548036328-c9fa89d12891?auto=format&fit=crop&w=300&q=80" },
  { name: "Watches", img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80" }
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=8&sort=popular").then((r) => r.json()).then((d) => setProducts(d.items || []));
    fetch("/api/testimonials").then((r) => r.json()).then((d) => setQuotes(d.testimonials || []));
  }, []);

  return (
    <div className="container page">
      <section className="hero">
        <div>
          <h1>New Arrivals Summer Collection</h1>
          <Link className="btn" href="/products">
            Shop now
          </Link>
        </div>
      </section>
      <div className="features">
        <div className="feature">Free Shipping</div>
        <div className="feature">Easy Returns</div>
        <div className="feature">Secure Payment</div>
        <div className="feature">24/7 Support</div>
      </div>
      <div className="section-head">
        <h2>Top Categories</h2>
        <Link href="/products">View all</Link>
      </div>
      <div className="cats">
        {CATS.map((c) => (
          <Link key={c.name} href={`/products?category=${c.name}`} className="cat">
            <div className="cat-img" style={{ backgroundImage: `url(${c.img})` }} />
            {c.name}
          </Link>
        ))}
      </div>
      <div className="section-head">
        <h2>Best Selling Products</h2>
        <Link href="/products">View all</Link>
      </div>
      <div className="grid products">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="section-head">
        <h2>What Our Customers Say</h2>
        <Link href="/testimonials">View all</Link>
      </div>
      <div className="quotes">
        {quotes.slice(0, 2).map((t) => (
          <article key={t.id} className="quote">
            <img src={t.avatar} alt="" />
            <div>
              <strong>{t.name}</strong>
              <Stars value={t.rating} />
              <p>{t.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

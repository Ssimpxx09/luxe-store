"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const CATS = ["Men", "Women", "Footwear", "Bags", "Watches", "Electronics"];
const BRANDS = ["Luxe", "Northwind", "Aether", "Volt", "Maison"];
const COLORS = ["#111111", "#1e3a5f", "#8b5a2b", "#ffffff"];
const SIZES = ["S", "M", "L", "XL", "6", "7", "8", "9", "10", "11", "12"];

export function ProductBrowser({
  initialCategory = "",
  initialQuery = "",
  title
}: {
  initialCategory?: string;
  initialQuery?: string;
  title?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(250);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Product[]; total: number; pages: number; page: number }>({
    items: [],
    total: 0,
    pages: 1,
    page: 1
  });

  useEffect(() => {
    setCategory(initialCategory);
    setPage(1);
  }, [initialCategory]);

  useEffect(() => {
    const qs = new URLSearchParams({
      q: initialQuery,
      category,
      brand,
      size,
      color,
      min: String(min),
      max: String(max),
      sort,
      page: String(page),
      limit: "12"
    });
    fetch(`/api/products?${qs}`)
      .then((r) => r.json())
      .then(setData);
  }, [category, brand, size, color, min, max, sort, page, initialQuery]);

  return (
    <div className="layout-2">
      <aside className="filters">
        <h4>Categories</h4>
        {CATS.map((c) => (
          <label key={c}>
            <input type="checkbox" checked={category === c} onChange={() => setCategory(category === c ? "" : c)} />
            {c}
          </label>
        ))}
        <h4>Brand</h4>
        {BRANDS.map((b) => (
          <label key={b}>
            <input type="checkbox" checked={brand === b} onChange={() => setBrand(brand === b ? "" : b)} />
            {b}
          </label>
        ))}
        <h4>Price</h4>
        <input type="range" min={0} max={250} value={max} onChange={(e) => setMax(Number(e.target.value))} />
        <div className="muted">Up to ${max}</div>
        <h4>Size</h4>
        <div className="sizes">
          {SIZES.map((s) => (
            <button key={s} className={`size ${size === s ? "on" : ""}`} onClick={() => setSize(size === s ? "" : s)}>
              {s}
            </button>
          ))}
        </div>
        <h4>Color</h4>
        <div className="swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${color === c ? "on" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(color === c ? "" : c)}
            />
          ))}
        </div>
      </aside>
      <section>
        <div className="toolbar">
          <div>
            <h2 style={{ margin: 0 }}>{title || "Products"}</h2>
            <div className="muted">
              Showing {data.items.length} of {data.total} products
              {initialQuery ? ` for “${initialQuery}”` : ""}
            </div>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 180 }}>
            <option value="popular">Sort by: Popularity</option>
            <option value="rating">Rating</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        <div className="grid products">
          {data.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {!data.items.length && <p className="muted">No products match these filters.</p>}
        <div className="pager">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
            <button key={n} className={`size ${n === page ? "on" : ""}`} onClick={() => setPage(n)}>
              {n}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

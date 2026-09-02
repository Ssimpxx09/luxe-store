"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const [items, setItems] = useState<Array<{ product: Product }>>([]);
  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, []);
  return (
    <div className="container page">
      <h1>Wishlist</h1>
      <div className="grid products">
        {items.map((i) => (
          <ProductCard key={i.product.id} product={i.product} />
        ))}
      </div>
      {!items.length && <p className="muted">Save products from any listing.</p>}
    </div>
  );
}

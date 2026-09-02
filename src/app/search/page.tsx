"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ProductBrowser } from "@/components/ProductBrowser";

function Inner() {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const [value, setValue] = useState(q);
  return (
    <div className="container page">
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = `/search?q=${encodeURIComponent(value)}`;
        }}
      >
        <input className="input" style={{ maxWidth: 420 }} value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn">Search</button>
      </form>
      <p className="muted">Showing results for “{q || "all"}”</p>
      <ProductBrowser initialQuery={q} title="Search results" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

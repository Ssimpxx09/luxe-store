"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductBrowser } from "@/components/ProductBrowser";

function Inner() {
  const sp = useSearchParams();
  const category = sp.get("category") || "";
  return (
    <div className="container page">
      <ProductBrowser initialCategory={category} title={category || "Category"} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

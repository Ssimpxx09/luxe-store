import { error, json } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const color = searchParams.get("color") || "";
  const size = searchParams.get("size") || "";
  const min = Number(searchParams.get("min") || 0);
  const max = Number(searchParams.get("max") || 10000);
  const sort = searchParams.get("sort") || "popular";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") || 12)));
  const slug = searchParams.get("slug");

  const store = getStore();
  if (slug) {
    const product = store.products.find((p) => p.slug === slug || p.id === slug);
    if (!product) return error("Product not found", 404);
    const reviews = store.reviews.filter((r) => r.productId === product.id);
    return json({ product, reviews });
  }

  let list = [...store.products];
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (category) list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (brand) list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  if (size) list = list.filter((p) => p.sizes.includes(size));
  if (color) list = list.filter((p) => p.colors.includes(color));
  list = list.filter((p) => p.price >= min && p.price <= max);

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  else list.sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.reviewCount - a.reviewCount);

  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);
  return json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

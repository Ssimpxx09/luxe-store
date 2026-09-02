import { NextResponse } from "next/server";
import { CART_COOKIE, cookieValue, ensureCartId, error, getUserFromRequest, json } from "@/lib/auth";
import { cartKey, getProduct } from "@/lib/commerce";
import { getStore, uid, updateStore } from "@/lib/db";

function owner(req: Request, res?: NextResponse) {
  const user = getUserFromRequest(req);
  const cartId = cookieValue(req, CART_COOKIE) || ensureCartId(req, res);
  return { user, key: cartKey(user?.id ?? null, cartId) };
}

export async function GET(req: Request) {
  const res = NextResponse.json({});
  const { key } = owner(req, res);
  const store = getStore();
  const items = store.wishlist
    .filter((w) => w.cartId === key)
    .map((w) => ({ ...w, product: store.products.find((p) => p.id === w.productId) }))
    .filter((w) => w.product);
  return NextResponse.json({ items }, { headers: res.headers });
}

export async function POST(req: Request) {
  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const product = getProduct(body.productId || "");
  if (!product) return error("Product not found", 404);
  const res = NextResponse.json({});
  const { user, key } = owner(req, res);
  updateStore((store) => {
    const exists = store.wishlist.find((w) => w.cartId === key && w.productId === product.id);
    if (exists) store.wishlist = store.wishlist.filter((w) => w.id !== exists.id);
    else
      store.wishlist.push({
        id: uid("wl"),
        userId: user?.id ?? null,
        cartId: key,
        productId: product.id
      });
  });
  const store = getStore();
  const items = store.wishlist.filter((w) => w.cartId === key);
  return NextResponse.json({ items, ids: items.map((i) => i.productId) }, { headers: res.headers });
}

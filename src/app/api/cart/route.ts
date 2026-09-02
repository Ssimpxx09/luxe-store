import { NextResponse } from "next/server";
import { CART_COOKIE, cookieValue, ensureCartId, error, getUserFromRequest, json } from "@/lib/auth";
import { cartKey, getProduct, hydrateCart } from "@/lib/commerce";
import { uid, updateStore } from "@/lib/db";

function owner(req: Request, res?: NextResponse) {
  const user = getUserFromRequest(req);
  const cartId = cookieValue(req, CART_COOKIE) || ensureCartId(req, res);
  return cartKey(user?.id ?? null, cartId);
}

export async function GET(req: Request) {
  const res = NextResponse.json({});
  const key = owner(req, res);
  const data = hydrateCart(key);
  return NextResponse.json(data, { headers: res.headers });
}

export async function POST(req: Request) {
  let body: { productId?: string; color?: string; size?: string; qty?: number };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const product = getProduct(body.productId || "");
  if (!product) return error("Product not found", 404);
  const qty = Math.max(1, Math.min(10, Number(body.qty || 1)));
  const color = body.color || product.colors[0];
  const size = body.size || product.sizes[0];
  if (!product.colors.includes(color)) return error("Select a valid color");
  if (!product.sizes.includes(size)) return error("Select a valid size");

  const res = NextResponse.json({});
  const key = owner(req, res);
  updateStore((store) => {
    const existing = store.cartItems.find(
      (i) => i.cartId === key && i.productId === product.id && i.color === color && i.size === size
    );
    if (existing) existing.qty = Math.min(10, existing.qty + qty);
    else store.cartItems.push({ id: uid("ci"), cartId: key, productId: product.id, color, size, qty });
  });
  return NextResponse.json(hydrateCart(key), { headers: res.headers });
}

export async function PATCH(req: Request) {
  let body: { id?: string; qty?: number };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const res = NextResponse.json({});
  const key = owner(req, res);
  const qty = Math.max(0, Math.min(10, Number(body.qty || 0)));
  updateStore((store) => {
    const item = store.cartItems.find((i) => i.id === body.id && i.cartId === key);
    if (!item) return;
    if (qty === 0) store.cartItems = store.cartItems.filter((i) => i.id !== item.id);
    else item.qty = qty;
  });
  return NextResponse.json(hydrateCart(key), { headers: res.headers });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const res = NextResponse.json({});
  const key = owner(req, res);
  updateStore((store) => {
    store.cartItems = store.cartItems.filter((i) => !(i.cartId === key && (!id || i.id === id)));
  });
  return NextResponse.json(hydrateCart(key), { headers: res.headers });
}

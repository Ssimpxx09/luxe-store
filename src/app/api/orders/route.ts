import { CART_COOKIE, cookieValue, error, getUserFromRequest, json, validateEmail } from "@/lib/auth";
import { cartKey, hydrateCart } from "@/lib/commerce";
import { getStore, uid, updateStore } from "@/lib/db";
import type { ShippingInfo } from "@/lib/types";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  const id = new URL(req.url).searchParams.get("id");
  const store = getStore();
  if (id) {
    const order = store.orders.find((o) => o.id === id || o.number === id);
    if (!order) return error("Order not found", 404);
    if (user && order.userId && order.userId !== user.id) return error("Order not found", 404);
    return json({ order });
  }
  if (!user) return json({ orders: [] });
  return json({ orders: store.orders.filter((o) => o.userId === user.id) });
}

export async function POST(req: Request) {
  let body: { shipping?: ShippingInfo };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const s = body.shipping;
  if (!s) return error("Shipping details are required");
  const required: Array<keyof ShippingInfo> = ["fullName", "phone", "email", "line1", "city", "state", "zip"];
  for (const key of required) {
    if (!String(s[key] || "").trim()) return error(`Missing ${key}`);
  }
  if (!validateEmail(s.email)) return error("Enter a valid email");
  if (!/^[0-9+\-\s]{8,}$/.test(s.phone)) return error("Enter a valid phone number");
  if (!/^[0-9A-Za-z\-\s]{3,}$/.test(s.zip)) return error("Enter a valid ZIP / postal code");

  const user = getUserFromRequest(req);
  const cartId = cookieValue(req, CART_COOKIE);
  const key = cartKey(user?.id ?? null, cartId || "anon");
  const cart = hydrateCart(key);
  if (!cart.items.length) return error("Your cart is empty");

  const order = {
    id: uid("ord"),
    number: `LX${Date.now().toString().slice(-8)}`,
    userId: user?.id ?? null,
    items: cart.items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      image: i.product.image,
      color: i.color,
      size: i.size,
      qty: i.qty,
      price: i.product.price
    })),
    shipping: {
      fullName: s.fullName.trim(),
      phone: s.phone.trim(),
      email: s.email.trim().toLowerCase(),
      line1: s.line1.trim(),
      line2: (s.line2 || "").trim(),
      city: s.city.trim(),
      state: s.state.trim(),
      zip: s.zip.trim(),
      country: s.country || "United States"
    },
    subtotal: cart.subtotal,
    shippingFee: cart.shippingFee,
    tax: cart.tax,
    total: cart.total,
    status: "placed" as const,
    createdAt: new Date().toISOString()
  };

  updateStore((store) => {
    store.orders.unshift(order);
    store.cartItems = store.cartItems.filter((i) => i.cartId !== key);
    if (user) {
      const hasDefault = store.addresses.some((a) => a.userId === user.id && a.isDefault);
      store.addresses.push({
        id: uid("addr"),
        userId: user.id,
        fullName: order.shipping.fullName,
        phone: order.shipping.phone,
        line1: order.shipping.line1,
        line2: order.shipping.line2,
        city: order.shipping.city,
        state: order.shipping.state,
        zip: order.shipping.zip,
        country: order.shipping.country,
        isDefault: !hasDefault
      });
    }
  });

  return json({ order }, 201);
}

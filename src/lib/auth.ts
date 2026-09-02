import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStore, uid, updateStore } from "./db";
import type { User } from "./types";

const SECRET = process.env.SESSION_SECRET || "luxe-dev-secret";
export const CART_COOKIE = "luxe_cart";
export const SESSION_COOKIE = "luxe_session";

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(`${SECRET}:${password}`).digest("hex");
}

export function signSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 })).toString(
    "base64url"
  );
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSession(token?: string | null): { userId: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  const a = crypto.createHash("sha256").update(sig).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId: string; exp: number };
    if (data.exp < Date.now()) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: Request): User | null {
  const token = cookieValue(req, SESSION_COOKIE);
  const session = readSession(token);
  if (!session) return null;
  return getStore().users.find((u) => u.id === session.userId) ?? null;
}

export function cookieValue(req: Request, name: string) {
  const header = req.headers.get("cookie") || "";
  const part = header.split(";").map((s) => s.trim()).find((s) => s.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.split("=").slice(1).join("=")) : null;
}

export function ensureCartId(req: Request, res?: NextResponse) {
  let cartId = cookieValue(req, CART_COOKIE);
  if (!cartId) {
    cartId = uid("cart");
    res?.cookies.set(CART_COOKIE, cartId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return cartId;
}

export async function currentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = readSession(token);
  if (!session) return null;
  const user = getStore().users.find((u) => u.id === session.userId);
  if (!user) return null;
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function publicUser(user: User) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function json(data: unknown, status = 200, extra?: NextResponse) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function mergeGuestCart(userId: string, cartId: string) {
  updateStore((store) => {
    store.cartItems.forEach((item) => {
      if (item.cartId === cartId) item.cartId = `user_${userId}`;
    });
    store.wishlist.forEach((item) => {
      if (item.cartId === cartId) {
        item.userId = userId;
        item.cartId = `user_${userId}`;
      }
    });
  });
}

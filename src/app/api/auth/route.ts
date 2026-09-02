import { NextResponse } from "next/server";
import {
  CART_COOKIE,
  SESSION_COOKIE,
  error,
  getUserFromRequest,
  hashPassword,
  json,
  mergeGuestCart,
  publicUser,
  signSession,
  validateEmail
} from "@/lib/auth";
import { getStore, uid, updateStore } from "@/lib/db";
import { cookieValue } from "@/lib/auth";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return json({ user: null });
  return json({ user: publicUser(user) });
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string; phone?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const mode = body.mode === "register" ? "register" : "login";

  if (!validateEmail(email)) return error("Enter a valid email address");
  if (password.length < 6) return error("Password must be at least 6 characters");

  // Determine cart id (do not set cookie yet)
  const existingCart = cookieValue(req, CART_COOKIE);
  let cartId = existingCart || uid("cart");
  const needSetCartCookie = !existingCart;

  if (mode === "register") {
    const name = (body.name || "").trim();
    if (name.length < 2) return error("Enter your full name");
    if (getStore().users.some((u) => u.email === email)) return error("An account with this email already exists");
    const user = {
      id: uid("usr"),
      name,
      email,
      phone: (body.phone || "").trim(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    updateStore((s) => s.users.push(user));
    mergeGuestCart(user.id, cartId);

    const res = NextResponse.json({ user: publicUser(user) });
    if (needSetCartCookie) {
      res.cookies.set(CART_COOKIE, cartId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
    }
    res.cookies.set(SESSION_COOKIE, signSession(user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });
    return res;
  }

  const user = getStore().users.find((u) => u.email === email);
  if (!user || user.passwordHash !== hashPassword(password)) return error("Invalid email or password", 401);
  mergeGuestCart(user.id, cartId);

  const res = NextResponse.json({ user: publicUser(user) });
  if (needSetCartCookie) {
    res.cookies.set(CART_COOKIE, cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }
  res.cookies.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
  return res;
}

export async function DELETE() {
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

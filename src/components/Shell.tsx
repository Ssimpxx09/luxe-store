"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; name: string; email: string; phone?: string } | null;
type CartState = { count: number; total: number };
type Ctx = {
  user: User;
  cart: CartState;
  wishIds: string[];
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const StoreCtx = createContext<Ctx | null>(null);

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [cart, setCart] = useState<CartState>({ count: 0, total: 0 });
  const [wishIds, setWishIds] = useState<string[]>([]);
  const pathname = usePathname();

  async function refresh() {
    const [me, c, w] = await Promise.all([
      fetch("/api/auth").then((r) => r.json()),
      fetch("/api/cart").then((r) => r.json()),
      fetch("/api/wishlist").then((r) => r.json())
    ]);
    setUser(me.user);
    setCart({
      count: (c.items || []).reduce((n: number, i: { qty: number }) => n + i.qty, 0),
      total: c.total || 0
    });
    setWishIds((w.items || []).map((i: { productId: string }) => i.productId));
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    await refresh();
  }

  useEffect(() => {
    refresh();
  }, [pathname]);

  const value = useMemo(() => ({ user, cart, wishIds, refresh, logout }), [user, cart, wishIds]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function Header() {
  const { user, cart, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [path]);

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-left">
          <button className="icon-btn" aria-label="Menu" onClick={() => setOpen(true)}>
            ☰
          </button>
        </div>
        <Link className="logo" href="/">
          LUXE
        </Link>
        <div className="header-right">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
            className="header-search"
            style={{ display: "flex", alignItems: "center" }}
          >
            <input
              className="input"
              style={{ width: 160, padding: "8px 10px" }}
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search"
            />
          </form>
          <Link className="icon-btn" href="/wishlist" aria-label="Wishlist">
            ♡
          </Link>
          <Link className="icon-btn" href="/cart" aria-label="Cart">
            👜
            {cart.count > 0 && <span className="badge">{cart.count}</span>}
          </Link>
          <div style={{ position: "relative" }}>
            <button className="icon-btn" aria-label="Account" onClick={() => setMenu((v) => !v)}>
              ●
            </button>
            {menu && (
              <div className="menu">
                {user ? (
                  <>
                    <strong>{user.name}</strong>
                    <br />
                    <small>{user.email}</small>
                    <Link href="/orders">My Orders</Link>
                    <Link href="/wishlist">Wishlist</Link>
                    <Link href="/account">Addresses</Link>
                    <Link href="/account">Account Settings</Link>
                    <button className="linkish" onClick={logout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">Login</Link>
                    <Link href="/register">Sign Up</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {open && (
        <div className="nav-drawer">
          <div className="overlay" onClick={() => setOpen(false)} />
          <nav className="nav-panel" style={{ position: "relative", zIndex: 2 }}>
            <strong>Menu</strong>
            <Link href="/">Home</Link>
            <Link href="/products">Categories</Link>
            <Link href="/products?category=Men">Men</Link>
            <Link href="/products?category=Women">Women</Link>
            <Link href="/products?category=Footwear">Footwear</Link>
            <Link href="/products?category=Bags">Bags</Link>
            <Link href="/products?category=Watches">Watches</Link>
            <Link href="/booking">Book a Stylist</Link>
            <Link href="/testimonials">Testimonials</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>LUXE</h4>
          <p>New arrivals, considered essentials, and a checkout that just works.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <p><Link href="/products">All products</Link></p>
          <p><Link href="/products?category=Women">Women</Link></p>
          <p><Link href="/products?category=Men">Men</Link></p>
        </div>
        <div>
          <h4>Help</h4>
          <p><Link href="/contact">Send message</Link></p>
          <p><Link href="/booking">Appointments</Link></p>
          <p><Link href="/orders">Orders</Link></p>
        </div>
        <div>
          <h4>Company</h4>
          <p>Free shipping over $50</p>
          <p>Easy 30-day returns</p>
        </div>
      </div>
    </footer>
  );
}

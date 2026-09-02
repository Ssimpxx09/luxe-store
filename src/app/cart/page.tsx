"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/Shell";

type Item = {
  id: string;
  qty: number;
  color: string;
  size: string;
  product: { name: string; image: string; price: number; slug: string };
};

export default function CartPage() {
  const { refresh } = useStore();
  const [cart, setCart] = useState<{ items: Item[]; subtotal: number; shippingFee: number; tax: number; total: number } | null>(
    null
  );

  async function load() {
    const data = await fetch("/api/cart").then((r) => r.json());
    setCart(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function qty(id: string, next: number) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, qty: next })
    });
    await load();
    await refresh();
  }

  if (!cart) return <div className="container page">Loading…</div>;

  return (
    <div className="container page">
      <h1>Cart</h1>
      {!cart.items.length && (
        <p>
          Your cart is empty. <Link href="/products">Continue shopping</Link>
        </p>
      )}
      <div className="cart-layout">
        <div>
          {cart.items.map((i) => (
            <div className="line" key={i.id}>
              <img src={i.product.image} alt="" />
              <div>
                <Link href={`/products/${i.product.slug}`}>
                  <strong>{i.product.name}</strong>
                </Link>
                <div className="muted">
                  Size {i.size} · Color {i.color}
                </div>
                <div className="qty" style={{ marginTop: 8 }}>
                  <button onClick={() => qty(i.id, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => qty(i.id, i.qty + 1)}>+</button>
                </div>
              </div>
              <div>
                <div className="price">${(i.product.price * i.qty).toFixed(2)}</div>
                <button className="icon-btn" onClick={() => qty(i.id, 0)} aria-label="Remove">
                  ⌫
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h3>Price details</h3>
          <div className="row">
            <span>Price ({cart.items.length} items)</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="row">
            <span>Shipping</span>
            <span>{cart.shippingFee ? `$${cart.shippingFee.toFixed(2)}` : "Free"}</span>
          </div>
          <div className="row">
            <span>Tax (15%)</span>
            <span>${cart.tax.toFixed(2)}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          {cart.items.length ? (
            <Link className="btn block" href="/checkout">
              Proceed to checkout
            </Link>
          ) : (
            <button className="btn block" disabled>
              Proceed to checkout
            </button>
          )}
          <Link className="btn secondary block" href="/products" style={{ marginTop: 8 }}>
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

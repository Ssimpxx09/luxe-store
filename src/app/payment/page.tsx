"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/components/Shell";

export default function PaymentPage() {
  const router = useRouter();
  const { refresh } = useStore();
  const [cart, setCart] = useState<{ total: number; items: unknown[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/cart").then((r) => r.json()).then(setCart);
  }, []);

  async function pay() {
    const shipping = sessionStorage.getItem("luxe_shipping");
    if (!shipping) {
      router.push("/checkout");
      return;
    }
    setBusy(true);
    setErr("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipping: JSON.parse(shipping) })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.error || "Could not place order");
    sessionStorage.removeItem("luxe_shipping");
    await refresh();
    router.push(`/orders/${data.order.id}`);
  }

  return (
    <div className="container page">
      <div className="progress">
        <span>1. Shipping</span>
        <span className="on">2. Payment</span>
        <span>3. Receipt</span>
      </div>
      <div className="center-card" style={{ width: "min(520px, 100%)", textAlign: "left" }}>
        <h1>Confirm & pay</h1>
        <p className="muted">
          No card, UPI, or gateway step. Pay Now creates the order immediately and shows your receipt.
        </p>
        {err && <div className="alert">{err}</div>}
        <p className="price" style={{ fontSize: 28 }}>
          ${cart?.total?.toFixed(2) || "0.00"}
        </p>
        <button className="btn block" disabled={busy || !cart?.items?.length} onClick={pay}>
          {busy ? "Placing order…" : `Pay now $${cart?.total?.toFixed(2) || "0.00"}`}
        </button>
      </div>
    </div>
  );
}

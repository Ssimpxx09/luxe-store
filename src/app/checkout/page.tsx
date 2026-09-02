"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/components/Shell";

const empty = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States"
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useStore();
  const [form, setForm] = useState(empty);
  const [cart, setCart] = useState<{ items: unknown[]; total: number; subtotal: number; tax: number; shippingFee: number } | null>(
    null
  );
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/cart").then((r) => r.json()).then(setCart);
    const saved = sessionStorage.getItem("luxe_shipping");
    if (saved) setForm(JSON.parse(saved));
    else if (user) setForm((f) => ({ ...f, fullName: user.name, email: user.email, phone: user.phone || "" }));
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => {
        const a = (d.addresses || []).find((x: { isDefault: boolean }) => x.isDefault) || d.addresses?.[0];
        if (a) {
          setForm((f) => ({
            ...f,
            fullName: a.fullName,
            phone: a.phone,
            line1: a.line1,
            line2: a.line2,
            city: a.city,
            state: a.state,
            zip: a.zip,
            country: a.country
          }));
        }
      });
  }, [user]);

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (!cart?.items.length) return setErr("Your cart is empty");
    sessionStorage.setItem("luxe_shipping", JSON.stringify(form));
    router.push("/payment");
  }

  return (
    <div className="container page">
      <div className="progress">
        <span className="on">1. Shipping</span>
        <span>2. Payment</span>
        <span>3. Receipt</span>
      </div>
      <form className="check-layout" onSubmit={go}>
        <div className="card" style={{ padding: 18 }}>
          <h2>Shipping information</h2>
          {err && <div className="alert">{err}</div>}
          {Object.entries({
            fullName: "Full name",
            phone: "Phone number",
            email: "Email",
            line1: "Address",
            line2: "Apartment / suite",
            city: "City",
            state: "State",
            zip: "ZIP / postal code"
          }).map(([k, label]) => (
            <label className="field" key={k}>
              <span>{label}</span>
              <input
                className="input"
                required={k !== "line2"}
                value={(form as Record<string, string>)[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </label>
          ))}
          <button className="btn block">Continue to payment</button>
        </div>
        <aside className="summary">
          <h3>Order summary</h3>
          <div className="row">
            <span>Subtotal</span>
            <span>${cart?.subtotal?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="row">
            <span>Shipping</span>
            <span>{cart?.shippingFee ? `$${cart.shippingFee.toFixed(2)}` : "Free"}</span>
          </div>
          <div className="row">
            <span>Tax</span>
            <span>${cart?.tax?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>${cart?.total?.toFixed(2) || "0.00"}</span>
          </div>
          <Link href="/cart">Edit cart</Link>
        </aside>
      </form>
    </div>
  );
}

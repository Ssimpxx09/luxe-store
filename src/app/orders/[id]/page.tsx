"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/orders?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else setOrder(d.order);
      });
  }, [id]);

  if (!order) return <div className="container page">{err || "Loading…"}</div>;

  return (
    <div className="container page">
      <div className="progress">
        <span>1. Shipping</span>
        <span>2. Payment</span>
        <span className="on">3. Receipt</span>
      </div>
      <div className="center-card" style={{ width: "min(640px, 100%)" }}>
        <div className="check">✓</div>
        <h1>Thank you! Your order has been placed successfully.</h1>
        <p className="muted">Order {order.number}</p>
        <div style={{ textAlign: "left", marginTop: 18 }}>
          {order.items.map((i) => (
            <div className="row" key={`${i.productId}-${i.size}-${i.color}`}>
              <span>
                {i.name} × {i.qty}
              </span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="row">
            <span>Shipping</span>
            <span>{order.shippingFee ? `$${order.shippingFee.toFixed(2)}` : "Free"}</span>
          </div>
          <div className="row">
            <span>Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <p>
            Ship to {order.shipping.fullName}, {order.shipping.line1}, {order.shipping.city} {order.shipping.zip}
          </p>
        </div>
        <Link className="btn" href="/orders">
          View order
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, []);
  return (
    <div className="container page">
      <h1>My Orders</h1>
      {!orders.length && <p className="muted">No orders yet.</p>}
      {orders.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`} className="line">
          <div />
          <div>
            <strong>{o.number}</strong>
            <div className="muted">{new Date(o.createdAt).toLocaleString()}</div>
          </div>
          <div className="price">${o.total.toFixed(2)}</div>
        </Link>
      ))}
    </div>
  );
}

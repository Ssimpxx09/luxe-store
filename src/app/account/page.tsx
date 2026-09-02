"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/Shell";
import type { Address } from "@/lib/types";

export default function AccountPage() {
  const { user, refresh } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "" });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
    fetch("/api/addresses").then((r) => r.json()).then((d) => setAddresses(d.addresses || []));
  }, [user]);

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone })
    });
    const data = await res.json();
    setMsg(data.error || "Account updated");
    await refresh();
  }

  async function saveAddr(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error);
    setAddresses((a) => [...a, data.address]);
    setMsg("Address saved");
  }

  if (!user) return <div className="container page">Please log in to manage your account.</div>;

  return (
    <div className="container page check-layout">
      <form className="card" style={{ padding: 18 }} onSubmit={saveAccount}>
        <h2>Account settings</h2>
        {msg && <div className="ok">{msg}</div>}
        <label className="field">
          <span>Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Phone</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <p className="muted">{user.email}</p>
        <button className="btn">Save</button>
      </form>
      <div>
        <div className="card" style={{ padding: 18, marginBottom: 16 }}>
          <h2>Addresses</h2>
          {addresses.map((a) => (
            <p key={a.id}>
              {a.fullName}, {a.line1}, {a.city} {a.zip}
            </p>
          ))}
        </div>
        <form className="card" style={{ padding: 18 }} onSubmit={saveAddr}>
          <h3>Add address</h3>
          {Object.keys(form).map((k) => (
            <label className="field" key={k}>
              <span>{k}</span>
              <input
                className="input"
                value={(form as Record<string, string>)[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </label>
          ))}
          <button className="btn">Save address</button>
        </form>
      </div>
    </div>
  );
}

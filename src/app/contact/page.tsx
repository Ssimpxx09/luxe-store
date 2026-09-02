"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error);
    setMsg("Message sent. We’ll get back to you shortly.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="container page">
      <form className="auth-card" onSubmit={send}>
        <h1>Send message</h1>
        {err && <div className="alert">{err}</div>}
        {msg && <div className="ok">{msg}</div>}
        <label className="field">
          <span>Name</span>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="field">
          <span>Email</span>
          <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </label>
        <button className="btn block">Send message</button>
      </form>
    </div>
  );
}

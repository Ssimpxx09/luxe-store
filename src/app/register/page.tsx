"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/Shell";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, mode: "register" })
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error);
    await refresh();
    router.push("/");
  }

  return (
    <div className="container page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Sign Up</h1>
        {err && <div className="alert">{err}</div>}
        {(["name", "email", "phone", "password"] as const).map((k) => (
          <label className="field" key={k}>
            <span>{k[0].toUpperCase() + k.slice(1)}</span>
            <input
              className="input"
              type={k === "password" ? "password" : "text"}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              required={k !== "phone"}
            />
          </label>
        ))}
        <button className="btn block">Create account</button>
        <p>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

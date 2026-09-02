"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/Shell";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, mode: "login" })
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error);
    await refresh();
    router.push("/");
  }

  return (
    <div className="container page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Login</h1>
        {err && <div className="alert">{err}</div>}
        <label className="field">
          <span>Email / Phone</span>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <p className="muted">Forgot password? Use the contact form and we’ll help reset it.</p>
        <button className="btn block">Login</button>
        <div className="social">
          <button type="button" className="btn secondary" onClick={() => setErr("Social login is a demo stub.")}>
            Login with Google
          </button>
          <button type="button" className="btn secondary" onClick={() => setErr("Social login is a demo stub.")}>
            Login with Facebook
          </button>
        </div>
        <p>
          Don’t have an account? <Link href="/register">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

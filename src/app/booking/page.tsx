"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/components/Shell";

const SLOTS = ["09:00 AM", "10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

export default function BookingPage() {
  const { user } = useStore();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
    return cells;
  }, [year, month]);

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, date, time, notes })
    });
    const data = await res.json();
    if (!res.ok) return setErr(data.error);
    setMsg(`Booking confirmed for ${data.booking.date} at ${data.booking.time}`);
  }

  return (
    <div className="container page">
      <h1>Select Date & Time</h1>
      <form className="check-layout" onSubmit={confirm}>
        <div className="cal">
          <div className="toolbar">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const d = new Date(year, month - 1, 1);
                setYear(d.getFullYear());
                setMonth(d.getMonth());
              }}
            >
              ‹
            </button>
            <strong>
              {new Date(year, month, 1).toLocaleString("en", { month: "long", year: "numeric" })}
            </strong>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const d = new Date(year, month + 1, 1);
                setYear(d.getFullYear());
                setMonth(d.getMonth());
              }}
            >
              ›
            </button>
          </div>
          <div className="cal-grid" style={{ marginBottom: 8, fontSize: 12 }}>
            {"SMTWTFS".split("").map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="cal-grid">
            {days.map((d, i) =>
              d ? (
                <button
                  type="button"
                  key={i}
                  className={date === `${year}-${month + 1}-${d}` ? "on" : ""}
                  onClick={() => setDate(`${year}-${month + 1}-${d}`)}
                >
                  {d}
                </button>
              ) : (
                <div key={i} />
              )
            )}
          </div>
          <h3>Available time slots</h3>
          <div className="slots">
            {SLOTS.map((s) => (
              <button type="button" key={s} className={`size ${time === s ? "on" : ""}`} onClick={() => setTime(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          {err && <div className="alert">{err}</div>}
          {msg && <div className="ok">{msg}</div>}
          <label className="field">
            <span>Name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span>Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <button className="btn block">Confirm booking</button>
        </div>
      </form>
    </div>
  );
}

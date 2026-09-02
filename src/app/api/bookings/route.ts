import { error, getUserFromRequest, json, validateEmail } from "@/lib/auth";
import { getStore, uid, updateStore } from "@/lib/db";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  const list = getStore().bookings.filter((b) => (user ? b.userId === user.id || b.email === user.email : false));
  return json({ bookings: list });
}

export async function POST(req: Request) {
  let body: { name?: string; email?: string; date?: string; time?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const date = body.date || "";
  const time = body.time || "";
  if (name.length < 2) return error("Enter your name");
  if (!validateEmail(email)) return error("Enter a valid email");
  if (!date) return error("Select a date");
  if (!time) return error("Select a time slot");
  const user = getUserFromRequest(req);
  const booking = {
    id: uid("bk"),
    userId: user?.id ?? null,
    name,
    email,
    date,
    time,
    notes: (body.notes || "").trim(),
    createdAt: new Date().toISOString()
  };
  updateStore((s) => s.bookings.push(booking));
  return json({ booking }, 201);
}

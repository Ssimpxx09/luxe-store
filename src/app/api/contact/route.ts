import { error, json, validateEmail } from "@/lib/auth";
import { uid, updateStore } from "@/lib/db";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const message = (body.message || "").trim();
  if (name.length < 2) return error("Enter your name");
  if (!validateEmail(email)) return error("Enter a valid email");
  if (message.length < 10) return error("Message should be at least 10 characters");
  const row = { id: uid("ct"), name, email, message, createdAt: new Date().toISOString() };
  updateStore((s) => s.contacts.push(row));
  return json({ ok: true }, 201);
}

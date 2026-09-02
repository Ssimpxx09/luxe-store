import { CART_COOKIE, cookieValue, error, json } from "@/lib/auth";
import { getStore, uid, updateStore } from "@/lib/db";

const REPLIES = [
  "Hi! How can we help you?",
  "I can help with orders, sizing, and returns. What do you need?",
  "Thanks — a stylist will follow up if needed. Anything else?",
  "You can track orders from My Orders after checkout. Want a product recommendation?"
];

export async function GET(req: Request) {
  const sessionId = cookieValue(req, CART_COOKIE) || "guest";
  const messages = getStore().chat.filter((m) => m.sessionId === sessionId);
  return json({ messages });
}

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const text = (body.text || "").trim();
  if (!text) return error("Type a message");
  const sessionId = cookieValue(req, CART_COOKIE) || "guest";
  const userMsg = {
    id: uid("msg"),
    sessionId,
    from: "user" as const,
    text,
    createdAt: new Date().toISOString()
  };
  const count = getStore().chat.filter((m) => m.sessionId === sessionId && m.from === "agent").length;
  const agentMsg = {
    id: uid("msg"),
    sessionId,
    from: "agent" as const,
    text: REPLIES[Math.min(count, REPLIES.length - 1)],
    createdAt: new Date().toISOString()
  };
  updateStore((s) => {
    s.chat.push(userMsg, agentMsg);
  });
  return json({ messages: getStore().chat.filter((m) => m.sessionId === sessionId) });
}

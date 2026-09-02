import { error, getUserFromRequest, json } from "@/lib/auth";
import { getStore, uid, updateStore } from "@/lib/db";

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return json({ addresses: [] });
  return json({ addresses: getStore().addresses.filter((a) => a.userId === user.id) });
}

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return error("Please log in to save addresses", 401);
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const fullName = (body.fullName || "").trim();
  const phone = (body.phone || "").trim();
  const line1 = (body.line1 || "").trim();
  const city = (body.city || "").trim();
  const state = (body.state || "").trim();
  const zip = (body.zip || "").trim();
  if (!fullName || !phone || !line1 || !city || !state || !zip) return error("Complete all required address fields");
  const address = {
    id: uid("addr"),
    userId: user.id,
    fullName,
    phone,
    line1,
    line2: (body.line2 || "").trim(),
    city,
    state,
    zip,
    country: body.country || "United States",
    isDefault: true
  };
  updateStore((store) => {
    store.addresses.forEach((a) => {
      if (a.userId === user.id) a.isDefault = false;
    });
    store.addresses.push(address);
  });
  return json({ address }, 201);
}

export async function DELETE(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return error("Unauthorized", 401);
  const id = new URL(req.url).searchParams.get("id");
  updateStore((s) => {
    s.addresses = s.addresses.filter((a) => !(a.userId === user.id && a.id === id));
  });
  return json({ ok: true });
}

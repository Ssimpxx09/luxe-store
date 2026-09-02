import { getUserFromRequest, json } from "@/lib/auth";
import { getStore, updateStore } from "@/lib/db";
import { error } from "@/lib/auth";

export async function PATCH(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return error("Please log in", 401);
  let body: { name?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON");
  }
  const name = (body.name || "").trim();
  if (name.length < 2) return error("Enter your name");
  updateStore((s) => {
    const u = s.users.find((x) => x.id === user.id);
    if (u) {
      u.name = name;
      u.phone = (body.phone || "").trim();
    }
  });
  const fresh = getStore().users.find((u) => u.id === user.id)!;
  const { passwordHash: _, ...safe } = fresh;
  return json({ user: safe });
}

import { json } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function GET() {
  return json({ testimonials: getStore().testimonials });
}

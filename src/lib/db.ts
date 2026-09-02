import fs from "fs";
import path from "path";
import type { Store } from "./types";
import { products, reviews, testimonials } from "./catalog";

const FILE = path.join(process.cwd(), "data", "db.json");

type GlobalStore = { luxeStore?: Store };

function emptyStore(): Store {
  return {
    users: [],
    addresses: [],
    products,
    reviews,
    cartItems: [],
    wishlist: [],
    orders: [],
    testimonials,
    bookings: [],
    chat: [],
    contacts: []
  };
}

function readFile(): Store {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    parsed.products = products;
    parsed.reviews = reviews;
    parsed.testimonials = testimonials;
    return parsed;
  } catch {
    return emptyStore();
  }
}

function persist(store: Store) {
  const g = globalThis as unknown as GlobalStore;
  g.luxeStore = store;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store, null, 2));
  } catch {
    /* Vercel serverless filesystem may be read-only */
  }
}

export function getStore(): Store {
  const g = globalThis as unknown as GlobalStore;
  if (!g.luxeStore) g.luxeStore = readFile();
  return g.luxeStore;
}

export function updateStore(mutator: (store: Store) => void): Store {
  const store = getStore();
  mutator(store);
  persist(store);
  return store;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

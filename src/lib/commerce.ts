import { getStore } from "./db";
import type { CartItem, Product } from "./types";

export const TAX_RATE = 0.15;
export const SHIPPING_THRESHOLD = 50;
export const SHIPPING_FEE = 5;

export function getProduct(id: string) {
  return getStore().products.find((p) => p.id === id || p.slug === id);
}

export function cartKey(userId: string | null, cartId: string) {
  return userId ? `user_${userId}` : cartId;
}

export function cartTotals(items: Array<CartItem & { product: Product }>) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const shippingFee = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;
  return { subtotal: round(subtotal), shippingFee, tax, total };
}

export function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function hydrateCart(owner: string) {
  const store = getStore();
  const items = store.cartItems
    .filter((i) => i.cartId === owner)
    .map((i) => {
      const product = store.products.find((p) => p.id === i.productId);
      if (!product) return null;
      return { ...i, product };
    })
    .filter(Boolean) as Array<CartItem & { product: Product }>;
  return { items, ...cartTotals(items) };
}

export function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

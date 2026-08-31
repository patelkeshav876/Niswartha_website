import type { Need } from '../types';

export const DONATION_CART_KEY = 'oc_donation_cart_v1';

export type CartLine = {
  needId: string;
  ashramId: string;
  title: string;
  imageUrl?: string;
  quantityRequired: number;
  quantityFulfilled: number;
};

export function getCart(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(DONATION_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCart(lines: CartLine[]): void {
  sessionStorage.setItem(DONATION_CART_KEY, JSON.stringify(lines));
}

export function clearCart(): void {
  sessionStorage.removeItem(DONATION_CART_KEY);
}

/** Drop lines from other ashrams, then add need if not present */
export function addNeedToCart(need: Need): void {
  let next = getCart().filter((l) => l.ashramId === need.ashramId);
  if (next.some((l) => l.needId === need.id)) {
    next = next.map((l) =>
      l.needId === need.id
        ? {
            ...l,
            title: need.title,
            imageUrl: need.imageUrl,
            quantityRequired: need.quantityRequired,
            quantityFulfilled: need.quantityFulfilled,
          }
        : l,
    );
  } else {
    next.push({
      needId: need.id,
      ashramId: need.ashramId,
      title: need.title,
      imageUrl: need.imageUrl,
      quantityRequired: need.quantityRequired,
      quantityFulfilled: need.quantityFulfilled,
    });
  }
  setCart(next);
}

export function removeNeedFromCart(needId: string): void {
  setCart(getCart().filter((l) => l.needId !== needId));
}

export function remainingForLine(line: CartLine): number {
  const req = Number(line.quantityRequired) || 0;
  const done = Number(line.quantityFulfilled) || 0;
  return Math.max(0, req - done);
}

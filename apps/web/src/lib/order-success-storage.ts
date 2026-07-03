import type { CheckoutResponse } from "@/lib/api";

const STORAGE_KEY = "minishop-order-success";

export function saveOrderSuccessSummary(summary: CheckoutResponse): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
  } catch {
    // Ignore quota/blocked storage.
  }
}

export function readOrderSuccessSummary(): CheckoutResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutResponse;
  } catch {
    return null;
  }
}

export function clearOrderSuccessSummary(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
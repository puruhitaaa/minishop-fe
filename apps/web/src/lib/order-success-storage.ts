import type { CheckoutResponse } from "@/lib/api";

const STORAGE_KEY = "minishop-order-success";

/** In-memory copy after first read; survives React StrictMode remounts. */
let pendingSummary: CheckoutResponse | null | undefined;

export function saveOrderSuccessSummary(summary: CheckoutResponse): void {
	pendingSummary = undefined;
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

/** Read once per checkout handoff; safe under React StrictMode double mount. */
export function takeOrderSuccessSummary(): CheckoutResponse | null {
	if (pendingSummary !== undefined) return pendingSummary;
	const data = readOrderSuccessSummary();
	pendingSummary = data;
	if (data) clearOrderSuccessSummary();
	return data;
}

export function clearOrderSuccessSummary(): void {
	if (typeof window === "undefined") return;
	sessionStorage.removeItem(STORAGE_KEY);
}

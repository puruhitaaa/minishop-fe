import type { components } from "../../../../src/api/types";

import { getAdminToken } from "./admin-token";

export type ApiError = components["schemas"]["APIError"];
export type ResponseEnvelope = components["schemas"]["ResponseEnvelope"];
export type Product = components["schemas"]["Product"];
export type Category = components["schemas"]["Category"];
export type CategoryListData = components["schemas"]["CategoryListData"];
export type ProductListData = components["schemas"]["ProductListData"];
export type CheckoutRequest = components["schemas"]["CheckoutRequest"];
export type CheckoutResponse = components["schemas"]["CheckoutResponse"];
export type Order = components["schemas"]["Order"];
export type OrderListData = components["schemas"]["OrderListData"];

export class ApiRequestError extends Error {
	readonly status: number;
	readonly code?: string;
	readonly details?: unknown;

	constructor(
		message: string,
		status: number,
		code?: string,
		details?: unknown,
	) {
		super(message);
		this.name = "ApiRequestError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

function apiBaseUrl(): string {
	const base = import.meta.env.VITE_SERVER_URL;
	if (!base) {
		throw new ApiRequestError("VITE_SERVER_URL is not set", 0, "CONFIG");
	}
	return base.replace(/\/$/, "");
}

function buildUrl(
	path: string,
	query?: Record<string, string | number | boolean | undefined>,
): string {
	const url = new URL(
		path.startsWith("/") ? path : `/${path}`,
		`${apiBaseUrl()}/`,
	);
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value === undefined || value === "") continue;
			url.searchParams.set(key, String(value));
		}
	}
	return url.toString();
}

async function parseEnvelope(response: Response): Promise<ResponseEnvelope> {
	const text = await response.text();
	if (!text) {
		throw new ApiRequestError("Empty response from server", response.status);
	}
	let body: unknown;
	try {
		body = JSON.parse(text);
	} catch {
		throw new ApiRequestError("Invalid JSON from server", response.status);
	}
	if (!body || typeof body !== "object") {
		throw new ApiRequestError("Unexpected response shape", response.status);
	}
	return body as ResponseEnvelope;
}

function friendlyMessage(envelope: ResponseEnvelope, fallback: string): string {
	return envelope.error?.message?.trim() || fallback;
}

export type ApiRequestOptions = {
	method?: string;
	query?: Record<string, string | number | boolean | undefined>;
	json?: unknown;
	form?: FormData;
	admin?: boolean;
	okStatuses?: number[];
};

export async function apiRequest<T>(
	path: string,
	options: ApiRequestOptions = {},
): Promise<T> {
	const {
		method = "GET",
		query,
		json,
		form,
		admin,
		okStatuses = [200, 201],
	} = options;
	const headers = new Headers();
	if (json !== undefined) headers.set("Content-Type", "application/json");
	if (admin) {
		const token = getAdminToken();
		if (token) headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(buildUrl(path, query), {
		method,
		headers,
		body: json !== undefined ? JSON.stringify(json) : form,
	});

	const envelope = await parseEnvelope(response);
	if (!okStatuses.includes(response.status) || !envelope.success) {
		throw new ApiRequestError(
			friendlyMessage(envelope, `Request failed (${response.status})`),
			response.status,
			envelope.error?.code,
			envelope.error?.details,
		);
	}
	return envelope.data as T;
}

export async function listPublicCategories() {
	return apiRequest<CategoryListData>("/v1/categories");
}

export async function listPublicProducts(
	query?: NonNullable<
		import("../../../../src/api/types").operations["listPublicProducts"]["parameters"]["query"]
	>,
) {
	return apiRequest<ProductListData>("/v1/products", { query });
}

export async function getPublicProduct(idOrSlug: string) {
	return apiRequest<Product>(`/v1/products/${encodeURIComponent(idOrSlug)}`);
}

export async function createCheckoutOrder(body: CheckoutRequest) {
	return apiRequest<CheckoutResponse>("/v1/checkout", {
		method: "POST",
		json: body,
		okStatuses: [201],
	});
}

export async function listAdminCategories(
	query?: NonNullable<
		import("../../../../src/api/types").operations["listAdminCategories"]["parameters"]["query"]
	>,
) {
	return apiRequest<CategoryListData>("/internal/categories", {
		query,
		admin: true,
	});
}

export async function listAdminProducts(
	query?: NonNullable<
		import("../../../../src/api/types").operations["listAdminProducts"]["parameters"]["query"]
	>,
) {
	return apiRequest<ProductListData>("/internal/products", {
		query,
		admin: true,
	});
}

export async function getAdminProduct(idOrSlug: string) {
	return apiRequest<Product>(
		`/internal/products/${encodeURIComponent(idOrSlug)}`,
		{ admin: true },
	);
}

export async function createAdminProduct(form: FormData) {
	return apiRequest<Product>("/internal/products", {
		method: "POST",
		form,
		admin: true,
		okStatuses: [201],
	});
}

export async function updateAdminProduct(idOrSlug: string, form: FormData) {
	return apiRequest<Product>(
		`/internal/products/${encodeURIComponent(idOrSlug)}`,
		{
			method: "PATCH",
			form,
			admin: true,
		},
	);
}

export async function deleteAdminProduct(idOrSlug: string) {
	return apiRequest<null>(
		`/internal/products/${encodeURIComponent(idOrSlug)}`,
		{
			method: "DELETE",
			admin: true,
		},
	);
}

export async function listAdminOrders(
	query?: NonNullable<
		import("../../../../src/api/types").operations["listAdminOrders"]["parameters"]["query"]
	>,
) {
	return apiRequest<OrderListData>("/internal/orders", { query, admin: true });
}

export async function getAdminOrder(idOrOrderNumber: string) {
	return apiRequest<Order>(
		`/internal/orders/${encodeURIComponent(idOrOrderNumber)}`,
		{ admin: true },
	);
}

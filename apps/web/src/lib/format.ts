export function formatIdr(amount?: number | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function productDetailPath(product: { id?: string; slug?: string }): string {
  const key = product.slug || product.id;
  if (!key) return "/";
  return `/products/${encodeURIComponent(key)}`;
}
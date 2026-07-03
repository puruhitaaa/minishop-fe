# MiniShop (Frontend)

## 1. Ringkasan

MiniShop adalah toko online demo: katalog produk, keranjang di browser, checkout ke API, dan panel admin untuk mengelola produk serta melihat pesanan. Frontend ini memanggil REST API **minishop-be**; tidak ada database di sisi web.

Alur pengguna: jelajahi & filter produk → detail → tambah ke cart → isi data pelanggan → checkout → halaman sukses. Operator demo memakai bearer token di `/admin` untuk CRUD produk dan daftar/detail order.

## 2. Tech stack

| Teknologi | Peran | Alasan singkat |
|-----------|--------|----------------|
| **React 19** | UI | Ekosistem matang, cocok dengan TanStack Start. |
| **TanStack Start + Router** | SSR, routing file-based | Satu codebase full-stack ringan; rute di `apps/web/src/routes`. |
| **TanStack Query** | Data server (katalog, admin) | Cache, loading/error, refetch tanpa boilerplate Redux. |
| **Tailwind CSS 4** | Styling | Cepat, konsisten dengan token di `packages/ui`. |
| **shadcn/ui** (`packages/ui`) | Komponen | Primitif terbagi antar app; tidak bikin design system baru. |
| **Turborepo + pnpm** | Monorepo | Build `web` + paket `ui` / `env` terkoordinasi. |
| **Biome** | Lint & format | Satu tool, cepat. |
| **Vite 8 + Nitro** | Build & deploy (mis. Vercel) | Output serverless untuk SSR Start. |

Tipe API di-generate dari OpenAPI backend (`src/api/types.ts` di repo backend / salinan di monorepo jika ada).

## 3. Menjalankan lokal

**Prasyarat:** Node.js, pnpm 10, API **minishop-be** jalan (default `http://localhost:8000`), Postgres backend sudah migrate + seed (lihat README backend).

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
```

Isi `apps/web/.env`:

```env
VITE_SERVER_URL=http://localhost:8000
```

Jalankan dev (port **3001**):

```bash
pnpm run dev:web
```

Buka [http://localhost:3001](http://localhost:3001).

**Admin demo:** buka [http://localhost:3001/admin](http://localhost:3001/admin), tempel bearer token yang sama dengan `INTERNAL_KEY` di backend (lihat README minishop-be). Token disimpan di `sessionStorage` (hilang saat tab ditutup).

**Build:**

```bash
pnpm run build
```

Deploy (Vercel): set **Root Directory** `apps/web`, env `VITE_SERVER_URL` ke origin API, dan pastikan `VITE_SERVER_URL` tercantum di `turbo.json` → `build.env` agar Turbo tidak cache build tanpa env.

## 4. Endpoint API (yang dipakai frontend)

Semua respons memakai envelope `{ "success", "error", "data" }`. Harga dalam **rupiah utuh (integer)**. Dokumen lengkap: `{API}/docs` dan `docs/api/openapi.yaml` di repo backend.

| Method | Path | Auth | Contoh request | Contoh `data` (sukses) |
|--------|------|------|----------------|-------------------------|
| GET | `/v1/categories` | — | — | `{ "items": [{ "id", "name", "slug", ... }], "meta": { "page", "limit", "total", "total_pages" } }` |
| GET | `/v1/products?page=1&limit=12&search=...&category_slug=electronics&sort=created_at_desc` | — | — | `{ "items": [{ "id", "name", "slug", "price", "stock", "image_url", ... }], "meta": {...} }` |
| GET | `/v1/products/{id_or_slug}` | — | — | `{ "id", "name", "description", "price", "stock", ... }` |
| POST | `/v1/checkout` | — | `{ "customer_name", "customer_email", "customer_phone?", "shipping_address?", "items": [{ "product_id", "quantity" }] }` | `{ "order_id", "order_number", "status", "total", ... }` (201) |
| GET | `/internal/categories` | Bearer `INTERNAL_KEY` | — | sama seperti list kategori |
| POST/PATCH/DELETE | `/internal/categories`, `/internal/categories/{id_or_slug}` | Bearer | JSON body (admin) | kategori tunggal atau null |
| GET/POST/PATCH/DELETE | `/internal/products`, `/internal/products/{id_or_slug}` | Bearer | POST/PATCH: `multipart/form-data` (name, price, category_id, stock, image?) | produk / list |
| GET | `/internal/orders?page=1&limit=20&customer_email=...&order_number=...` | Bearer | — | `{ "items": [Order], "meta" }` |
| GET | `/internal/orders/{id_or_order_number}` | Bearer | — | Order + `items[]` |

Header admin: `Authorization: Bearer <INTERNAL_KEY>`.

## 5. Known limitations

- **Auth admin hanya demo:** token di `sessionStorage`, bukan login/OAuth/refresh token.
- **Tidak ada SSR prefetch untuk React Query:** data katalog di-fetch di client setelah hydrate; first paint bisa skeleton tanpa request di Network sampai JS jalan.
- **Cart hanya `localStorage`:** `{ product_id, quantity }`; tidak sinkron antar perangkat; stok divalidasi ulang saat checkout.
- **Tanpa pembayaran / webhook / ubah status order** di UI; checkout hanya membuat order di backend.
- **Gambar produk seed** sering tanpa URL (null) sampai di-upload lewat admin.
- **Chunk JS besar** (~500 KB+) — belum di-split agresif (peringatan Rolldown/Vite).
- **CORS & `VITE_SERVER_URL`:** harus benar di build/deploy; salah env → tidak ada request API atau URL API salah.

## Skrip

- `pnpm run dev` — semua app di monorepo  
- `pnpm run dev:web` — hanya web  
- `pnpm run build` — build turbo  
- `pnpm run check` — Biome
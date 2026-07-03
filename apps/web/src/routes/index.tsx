import { Button } from "@minishop-fe/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@minishop-fe/ui/components/empty";
import { Input } from "@minishop-fe/ui/components/input";
import { Label } from "@minishop-fe/ui/components/label";
import { Skeleton } from "@minishop-fe/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { ProductCard } from "@/components/product-card";
import { listPublicCategories, listPublicProducts } from "@/lib/api";

const catalogSearchSchema = z.object({
  search: z.string().optional(),
  category_slug: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().catch(1),
});

export const Route = createFileRoute("/")({
  validateSearch: (search) => catalogSearchSchema.parse(search),
  component: ShopPage,
});

function ShopPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { search, category_slug, page = 1 } = Route.useSearch();
  const [searchInput, setSearchInput] = useState(search ?? "");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: listPublicCategories,
  });

  const productsQuery = useQuery({
    queryKey: ["products", { search, category_slug, page }],
    queryFn: () =>
      listPublicProducts({
        search: search || undefined,
        category_slug: category_slug || undefined,
        page,
        limit: 12,
        sort: "created_at_desc",
      }),
  });

  const categories = categoriesQuery.data?.items ?? [];
  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;

  function applyFilters(next: { search?: string; category_slug?: string; page?: number }) {
    navigate({
      search: (prev) => ({
        ...prev,
        search: next.search?.trim() || undefined,
        category_slug: next.category_slug || undefined,
        page: next.page ?? 1,
      }),
    });
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-medium">Shop</h1>
        <p className="text-sm text-muted-foreground">Browse products and add items to your cart.</p>
      </div>

      <form
        className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters({ search: searchInput, category_slug, page: 1 });
        }}
      >
        <div className="grid flex-1 gap-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            name="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products"
          />
        </div>
        <div className="grid gap-2 sm:w-56">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            value={category_slug ?? ""}
            onChange={(e) =>
              applyFilters({
                search: searchInput,
                category_slug: e.target.value || undefined,
                page: 1,
              })
            }
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id ?? cat.slug} value={cat.slug ?? ""}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Search</Button>
      </form>

      {categoriesQuery.isError ? (
        <p className="text-sm text-destructive">Could not load categories.</p>
      ) : null}

      {productsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : null}

      {productsQuery.isError ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Could not load products</EmptyTitle>
            <EmptyDescription>Check the API server and try again.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => productsQuery.refetch()}>
            Retry
          </Button>
        </Empty>
      ) : null}

      {productsQuery.isSuccess && products.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyDescription>Try a different search or category.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {productsQuery.isSuccess && products.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id ?? product.slug} product={product} />
            ))}
          </div>
          {meta && (meta.total_pages ?? 1) > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => applyFilters({ search, category_slug, page: page - 1 })}
              >
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.total_pages ?? page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (meta.total_pages ?? page)}
                onClick={() => applyFilters({ search, category_slug, page: page + 1 })}
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
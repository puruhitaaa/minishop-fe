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
import { Textarea } from "@minishop-fe/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useAdminToken } from "@/hooks/use-admin-token";
import {
  ApiRequestError,
  createAdminProduct,
  deleteAdminProduct,
  listAdminCategories,
  listAdminProducts,
} from "@/lib/api";
import { buildProductFormData } from "@/lib/admin-product-form";
import { formatIdr } from "@/lib/format";

const productsSearchSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().catch(1),
});

export const Route = createFileRoute("/admin/products/")({
  validateSearch: (search) => productsSearchSchema.parse(search),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const { token, ready } = useAdminToken();
  const { search, page = 1 } = Route.useSearch();
  const [searchInput, setSearchInput] = useState(search ?? "");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => listAdminCategories({ limit: 100 }),
    enabled: Boolean(token),
  });

  const productsQuery = useQuery({
    queryKey: ["admin", "products", { search, page }],
    queryFn: () =>
      listAdminProducts({
        search: search || undefined,
        page,
        limit: 20,
        sort: "created_at_desc",
      }),
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminProduct(
        buildProductFormData(
          {
            name,
            slug,
            description,
            price,
            category_id: categoryId,
            stock,
            is_active: isActive,
            image: imageFile,
          },
          "create",
        ),
      ),
    onSuccess: () => {
      toast.success("Product created");
      setName("");
      setSlug("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageFile(null);
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (err) => {
      setFormError(err instanceof ApiRequestError ? err.message : "Create failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (idOrSlug: string) => deleteAdminProduct(idOrSlug),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiRequestError ? err.message : "Delete failed");
    },
  });

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!token) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Token required</EmptyTitle>
          <EmptyDescription>
            <Link to="/admin" className="underline">
              Save an admin token
            </Link>{" "}
            to manage products.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;
  const categories = categoriesQuery.data?.items ?? [];

  function applySearch() {
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchInput.trim() || undefined,
        page: 1,
      }),
    });
  }

  return (
    <div className="space-y-8">
      <form
        className="grid max-w-xl gap-3 rounded-lg border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !price.trim() || !categoryId || !stock.trim()) {
            setFormError("Name, price, category, and stock are required.");
            return;
          }
          createMutation.mutate();
        }}
      >
        <h2 className="font-medium">Create product</h2>
        <div className="grid gap-2">
          <Label htmlFor="new_name">Name</Label>
          <Input id="new_name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new_slug">Slug (optional)</Label>
          <Input id="new_slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new_description">Description (optional)</Label>
          <Textarea
            id="new_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="new_price">Price (IDR)</Label>
            <Input
              id="new_price"
              type="number"
              min={0}
              step={1}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new_stock">Stock</Label>
            <Input
              id="new_stock"
              type="number"
              min={0}
              step={1}
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new_category">Category</Label>
          <select
            id="new_category"
            required
            className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id ?? ""}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
        <div className="grid gap-2">
          <Label htmlFor="new_image">Image (optional)</Label>
          <Input
            id="new_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating…" : "Create product"}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid flex-1 gap-2 sm:max-w-xs">
            <Label htmlFor="product_search">Search products</Label>
            <Input
              id="product_search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applySearch())}
            />
          </div>
          <Button variant="outline" onClick={applySearch}>
            Search
          </Button>
        </div>

        {productsQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : productsQuery.isError ? (
          <p className="text-sm text-destructive">
            {productsQuery.error instanceof ApiRequestError
              ? productsQuery.error.message
              : "Failed to load products"}
          </p>
        ) : products.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No products</EmptyTitle>
              <EmptyDescription>Create one above or change search.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium">Active</th>
                  <th className="p-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const key = product.id ?? product.slug ?? "";
                  const editKey = product.slug || product.id || "";
                  return (
                    <tr key={key} className="border-b last:border-0">
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{formatIdr(product.price)}</td>
                      <td className="p-3">{product.stock ?? "—"}</td>
                      <td className="p-3">{product.is_active ? "Yes" : "No"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <Link
                                to="/admin/products/$idOrSlug"
                                params={{ idOrSlug: editKey }}
                              />
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteMutation.isPending || !editKey}
                            onClick={() => {
                              if (!editKey) return;
                              if (!window.confirm(`Delete ${product.name}?`)) return;
                              deleteMutation.mutate(editKey);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && (meta.total_pages ?? 1) > 1 ? (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: page - 1 }) })
              }
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
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })
              }
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
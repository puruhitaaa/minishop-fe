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
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAdminToken } from "@/hooks/use-admin-token";
import {
  ApiRequestError,
  getAdminProduct,
  listAdminCategories,
  updateAdminProduct,
} from "@/lib/api";
import { buildProductFormData } from "@/lib/admin-product-form";

export const Route = createFileRoute("/admin/products/$idOrSlug")({
  component: AdminEditProductPage,
});

function AdminEditProductPage() {
  const { idOrSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, ready } = useAdminToken();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ["admin", "product", idOrSlug],
    queryFn: () => getAdminProduct(idOrSlug),
    enabled: Boolean(token),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => listAdminCategories({ limit: 100 }),
    enabled: Boolean(token),
  });

  useEffect(() => {
    const p = productQuery.data;
    if (!p) return;
    setName(p.name ?? "");
    setSlug(p.slug ?? "");
    setDescription(p.description ?? "");
    setPrice(p.price !== undefined ? String(p.price) : "");
    setCategoryId(p.category_id ?? "");
    setStock(p.stock !== undefined ? String(p.stock) : "");
    setIsActive(p.is_active !== false);
  }, [productQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminProduct(
        idOrSlug,
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
            remove_image: removeImage,
          },
          "update",
        ),
      ),
    onSuccess: () => {
      toast.success("Product updated");
      setFormError(null);
      setImageFile(null);
      setRemoveImage(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product", idOrSlug] });
    },
    onError: (err) => {
      setFormError(err instanceof ApiRequestError ? err.message : "Update failed");
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
            </Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (productQuery.isLoading) {
    return <Skeleton className="h-64 w-full max-w-xl" />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Product not found</EmptyTitle>
          <EmptyDescription>
            <Link to="/admin/products" className="underline">
              Back to products
            </Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const product = productQuery.data;
  const categories = categoriesQuery.data?.items ?? [];

  return (
    <div className="max-w-xl space-y-4">
      <Link to="/admin/products" className="text-sm text-muted-foreground hover:underline">
        ← Products
      </Link>
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name ?? "Product"}
          className="max-h-48 rounded-lg object-cover"
        />
      ) : null}
      <form
        className="grid gap-3 rounded-lg border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
      >
        <h2 className="font-medium">Edit product</h2>
        <div className="grid gap-2">
          <Label htmlFor="edit_name">Name</Label>
          <Input id="edit_name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit_slug">Slug (optional)</Label>
          <Input id="edit_slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit_description">Description (optional)</Label>
          <Textarea
            id="edit_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="edit_price">Price (IDR)</Label>
            <Input
              id="edit_price"
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit_stock">Stock</Label>
            <Input
              id="edit_stock"
              type="number"
              min={0}
              step={1}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit_category">Category</Label>
          <select
            id="edit_category"
            className="h-8 rounded-2xl border border-transparent bg-input/50 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">—</option>
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
        {product.image_url ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={removeImage}
              onChange={(e) => setRemoveImage(e.target.checked)}
            />
            Remove current image
          </label>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="edit_image">Replace image (optional)</Label>
          <Input
            id="edit_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/admin/products" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
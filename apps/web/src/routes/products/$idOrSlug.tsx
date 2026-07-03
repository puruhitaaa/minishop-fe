import { Button } from "@minishop-fe/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@minishop-fe/ui/components/empty";
import { Skeleton } from "@minishop-fe/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { useCart } from "@/contexts/cart-context";
import { getPublicProduct } from "@/lib/api";
import { formatIdr } from "@/lib/format";

export const Route = createFileRoute("/products/$idOrSlug")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { idOrSlug } = Route.useParams();
  const { addItem } = useCart();

  const productQuery = useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: () => getPublicProduct(idOrSlug),
  });

  const product = productQuery.data;
  const stock = product?.stock ?? 0;
  const outOfStock = stock <= 0;

  if (productQuery.isLoading) {
    return (
      <div className="container mx-auto max-w-3xl space-y-4 px-4 py-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Product not found</EmptyTitle>
            <EmptyDescription>
              <Link to="/" className="underline">
                Back to shop
              </Link>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-6">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to shop
      </Link>
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name ?? "Product"}
          className="aspect-video w-full rounded-lg object-cover"
        />
      ) : null}
      <div className="space-y-2">
        <h1 className="text-2xl font-medium">{product.name}</h1>
        {product.category_name ? (
          <p className="text-sm text-muted-foreground">{product.category_name}</p>
        ) : null}
        <p className="text-lg font-medium">{formatIdr(product.price)}</p>
        <p className="text-sm text-muted-foreground">
          {outOfStock ? "Out of stock" : `${stock} in stock`}
        </p>
        {product.description ? (
          <p className="whitespace-pre-wrap text-sm">{product.description}</p>
        ) : null}
      </div>
      <Button
        disabled={!product.id || outOfStock}
        onClick={() => product.id && addItem(product.id, 1, product)}
      >
        Add to cart
      </Button>
    </div>
  );
}
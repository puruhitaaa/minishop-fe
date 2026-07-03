import { Button } from "@minishop-fe/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@minishop-fe/ui/components/card";
import { Link } from "@tanstack/react-router";

import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/api";
import { formatIdr, productDetailPath } from "@/lib/format";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const stock = product.stock ?? 0;
  const outOfStock = stock <= 0;
  const productId = product.id ?? "";

  return (
    <Card className="h-full">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name ?? "Product"}
          className="aspect-video w-full object-cover"
        />
      ) : null}
      <CardHeader>
        <CardTitle>
          <Link to={productDetailPath(product)} className="hover:underline">
            {product.name ?? "Unnamed product"}
          </Link>
        </CardTitle>
        {product.category_name ? (
          <CardDescription>{product.category_name}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-medium">{formatIdr(product.price)}</p>
        <p className="text-sm text-muted-foreground">
          {outOfStock ? "Out of stock" : `${stock} in stock`}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" render={<Link to={productDetailPath(product)} />}>
          Details
        </Button>
        <Button
          size="sm"
          disabled={!productId || outOfStock}
          onClick={() => addItem(productId, 1, product)}
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
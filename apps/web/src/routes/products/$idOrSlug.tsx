import { Button } from "@minishop-fe/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@minishop-fe/ui/components/empty";
import { Skeleton } from "@minishop-fe/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
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
			<PageShell width="narrow" className="space-y-4">
				<Skeleton className="h-8 w-48 max-w-full" />
				<Skeleton className="aspect-video w-full" />
				<Skeleton className="h-24 w-full" />
			</PageShell>
		);
	}

	if (productQuery.isError || !product) {
		return (
			<PageShell width="narrow">
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
			</PageShell>
		);
	}

	return (
		<PageShell width="narrow" className="space-y-6">
			<Link to="/" className="text-muted-foreground text-sm hover:underline">
				← Back to shop
			</Link>
			{product.image_url ? (
				<img
					src={product.image_url}
					alt={product.name ?? "Product"}
					className="aspect-video w-full max-w-full rounded-lg object-cover"
				/>
			) : null}
			<div className="min-w-0 space-y-2">
				<h1 className="font-medium text-xl tracking-tight sm:text-2xl">
					{product.name}
				</h1>
				{product.category_name ? (
					<p className="text-muted-foreground text-sm">
						{product.category_name}
					</p>
				) : null}
				<p className="font-medium text-lg">{formatIdr(product.price)}</p>
				<p className="text-muted-foreground text-sm">
					{outOfStock ? "Out of stock" : `${stock} in stock`}
				</p>
				{product.description ? (
					<p className="whitespace-pre-wrap text-sm">{product.description}</p>
				) : null}
			</div>
			<Button
				className="w-full sm:w-auto"
				disabled={!product.id || outOfStock}
				onClick={() => {
					if (!product.id) {
						toast.error("Could not add to cart");
						return;
					}
					if (addItem(product.id, 1, product)) {
						toast.success("Added to cart");
					} else {
						toast.error("Could not add to cart");
					}
				}}
			>
				Add to cart
			</Button>
		</PageShell>
	);
}

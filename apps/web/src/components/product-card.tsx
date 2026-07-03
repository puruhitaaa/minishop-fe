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
import type { CSSProperties } from "react";
import { toast } from "sonner";

import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/api";
import { formatIdr, productDetailPath } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductCardProps = {
	product: Product;
	className?: string;
	style?: CSSProperties;
};

export function ProductCard({ product, className, style }: ProductCardProps) {
	const { addItem } = useCart();
	const stock = product.stock ?? 0;
	const outOfStock = stock <= 0;
	const productId = product.id ?? "";

	return (
		<Card
			style={style}
			className={cn(
				"h-full pt-0 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.55)]",
				className,
			)}
		>
			<div className="relative overflow-hidden bg-muted/30">
				{product.image_url ? (
					<img
						src={product.image_url}
						alt={product.name ?? "Product"}
						className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02]"
					/>
				) : (
					<div className="flex aspect-[4/3] w-full items-center justify-center bg-muted/50 text-muted-foreground text-xs">
						No image
					</div>
				)}
				{product.category_name ? (
					<span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 font-medium text-foreground text-xs ring-1 ring-border/60 backdrop-blur-sm">
						{product.category_name}
					</span>
				) : null}
			</div>
			<CardHeader className="gap-1">
				<CardTitle className="text-base leading-snug">
					<Link
						to={productDetailPath(product)}
						className="transition-colors hover:text-primary"
					>
						{product.name ?? "Unnamed product"}
					</Link>
				</CardTitle>
				{product.description ? (
					<CardDescription className="line-clamp-2">
						{product.description}
					</CardDescription>
				) : null}
			</CardHeader>
			<CardContent className="space-y-1">
				<p className="font-heading font-medium text-lg tracking-tight">
					{formatIdr(product.price)}
				</p>
				<p className="text-muted-foreground text-sm">
					{outOfStock ? "Out of stock" : `${stock} units available`}
				</p>
			</CardContent>
			<CardFooter className="gap-2 pt-0">
				<Button
					variant="outline"
					size="sm"
					render={<Link to={productDetailPath(product)} />}
				>
					View
				</Button>
				<Button
					size="sm"
					className="flex-1 sm:flex-none"
					disabled={!productId || outOfStock}
					onClick={() => {
						if (addItem(productId, 1, product)) {
							toast.success("Added to cart");
						} else {
							toast.error("Could not add to cart");
						}
					}}
				>
					Add to cart
				</Button>
			</CardFooter>
		</Card>
	);
}

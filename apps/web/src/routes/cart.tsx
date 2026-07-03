import { Button } from "@minishop-fe/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@minishop-fe/ui/components/card";
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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
	DataTable,
	DataTableCell,
	DataTableHead,
	DataTableRow,
} from "@/components/data-table";
import { PageHeader, PageShell } from "@/components/page-shell";
import { Panel } from "@/components/panel";
import { useCart } from "@/contexts/cart-context";
import { useCartProducts } from "@/hooks/use-cart-products";
import { ApiRequestError, createCheckoutOrder } from "@/lib/api";
import { formatIdr, productDetailPath } from "@/lib/format";
import { saveOrderSuccessSummary } from "@/lib/order-success-storage";

export const Route = createFileRoute("/cart")({
	component: CartPage,
});

function CartPage() {
	const navigate = useNavigate();
	const { lines, setQuantity, removeItem, clearCart } = useCart();
	const { rows, isLoading } = useCartProducts();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [shippingAddress, setShippingAddress] = useState("");

	const total = useMemo(
		() =>
			rows.reduce((sum, row) => {
				const price = row.product?.price ?? 0;
				return sum + price * row.quantity;
			}, 0),
		[rows],
	);

	const hasStockIssue = rows.some((row) => {
		const stock = row.product?.stock;
		if (stock === undefined) return false;
		return row.quantity > stock || stock <= 0;
	});
	const hasUnavailableItem = rows.some(
		(row) => !row.loading && (row.error || !row.product),
	);

	async function handleCheckout(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (lines.length === 0) {
			setError("Your cart is empty.");
			return;
		}
		if (isLoading) {
			setError("Still loading product details. Try again in a moment.");
			return;
		}
		if (hasStockIssue) {
			setError("Some items exceed available stock. Update quantities first.");
			return;
		}
		if (hasUnavailableItem) {
			setError("Remove unavailable items before checkout.");
			return;
		}
		if (!customerName.trim() || !customerEmail.trim()) {
			setError("Name and email are required.");
			return;
		}

		const items = rows
			.filter((row) => row.product?.id)
			.map((row) => ({
				product_id: row.product_id,
				quantity: row.quantity,
			}));

		if (items.length === 0) {
			setError("No valid cart items to checkout.");
			return;
		}

		setSubmitting(true);
		try {
			const order = await createCheckoutOrder({
				customer_name: customerName.trim(),
				customer_email: customerEmail.trim(),
				customer_phone: customerPhone.trim() || undefined,
				shipping_address: shippingAddress.trim() || undefined,
				items,
			});
			saveOrderSuccessSummary(order);
			clearCart();
			toast.success("Order placed");
			navigate({ to: "/order-success" });
		} catch (err) {
			const message =
				err instanceof ApiRequestError
					? err.message
					: err instanceof Error
						? err.message
						: "Checkout failed";
			setError(message);
		} finally {
			setSubmitting(false);
		}
	}

	if (lines.length === 0) {
		return (
			<PageShell width="wide">
				<PageHeader title="Cart" description="Review items before checkout." />
				<Empty className="border border-border/80 bg-card/40">
					<EmptyHeader>
						<EmptyTitle>Your cart is empty</EmptyTitle>
						<EmptyDescription>
							<Link
								to="/"
								className="font-medium text-primary underline-offset-4 hover:underline"
							>
								Continue shopping
							</Link>
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</PageShell>
		);
	}

	return (
		<PageShell width="wide" className="space-y-8">
			<PageHeader
				eyebrow="Checkout"
				title="Your cart"
				description="Adjust quantities, then complete the form to place your order."
			/>

			<div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
				<div className="space-y-4">
					<div className="space-y-3 md:hidden">
						{rows.map((row) => {
							const stock = row.product?.stock;
							const maxQty =
								stock !== undefined && stock > 0 ? stock : undefined;
							const lineTotal = (row.product?.price ?? 0) * row.quantity;
							const stockWarning =
								stock !== undefined && (stock <= 0 || row.quantity > stock);

							return (
								<div
									key={row.product_id}
									className="space-y-3 rounded-2xl border border-border/80 bg-card/40 p-4 ring-1 ring-foreground/5"
								>
									<div className="min-w-0 space-y-1">
										{row.loading ? (
											<Skeleton className="h-4 w-32" />
										) : row.error || !row.product ? (
											<span className="text-destructive text-sm">
												Unavailable
											</span>
										) : (
											<Link
												to={productDetailPath(row.product)}
												className="font-medium text-sm transition-colors hover:text-primary"
											>
												{row.product.name}
											</Link>
										)}
										{stockWarning ? (
											<p className="text-destructive text-xs">
												Stock limit: {stock ?? 0}
											</p>
										) : null}
									</div>
									<dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
										<dt className="text-muted-foreground">Price</dt>
										<dd className="text-right font-medium">
											{formatIdr(row.product?.price)}
										</dd>
										<dt className="text-muted-foreground">Line total</dt>
										<dd className="text-right font-medium">
											{formatIdr(lineTotal)}
										</dd>
									</dl>
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="grid gap-1">
											<span className="text-muted-foreground text-xs">
												Quantity
											</span>
											<Input
												type="number"
												min={1}
												max={maxQty}
												className="w-24"
												value={row.quantity}
												disabled={row.loading || !row.product}
												onChange={(e) => {
													const next = Number(e.target.value);
													setQuantity(row.product_id, next, row.product);
												}}
											/>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => removeItem(row.product_id)}
										>
											Remove
										</Button>
									</div>
								</div>
							);
						})}
					</div>

					<div className="hidden md:block">
						<DataTable>
							<DataTableHead>
								<DataTableRow>
									<DataTableCell header>Product</DataTableCell>
									<DataTableCell header>Price</DataTableCell>
									<DataTableCell header>Qty</DataTableCell>
									<DataTableCell header>Line total</DataTableCell>
									<DataTableCell header />
								</DataTableRow>
							</DataTableHead>
							<tbody>
								{rows.map((row) => {
									const stock = row.product?.stock;
									const maxQty =
										stock !== undefined && stock > 0 ? stock : undefined;
									const lineTotal = (row.product?.price ?? 0) * row.quantity;
									const stockWarning =
										stock !== undefined && (stock <= 0 || row.quantity > stock);

									return (
										<DataTableRow key={row.product_id}>
											<DataTableCell>
												{row.loading ? (
													<Skeleton className="h-4 w-32" />
												) : row.error || !row.product ? (
													<span className="text-destructive">Unavailable</span>
												) : (
													<Link
														to={productDetailPath(row.product)}
														className="font-medium transition-colors hover:text-primary"
													>
														{row.product.name}
													</Link>
												)}
												{stockWarning ? (
													<p className="text-destructive text-xs">
														Stock limit: {stock ?? 0}
													</p>
												) : null}
											</DataTableCell>
											<DataTableCell>
												{formatIdr(row.product?.price)}
											</DataTableCell>
											<DataTableCell>
												<Input
													type="number"
													min={1}
													max={maxQty}
													className="w-20"
													value={row.quantity}
													disabled={row.loading || !row.product}
													onChange={(e) => {
														const next = Number(e.target.value);
														setQuantity(row.product_id, next, row.product);
													}}
												/>
											</DataTableCell>
											<DataTableCell className="font-medium">
												{formatIdr(lineTotal)}
											</DataTableCell>
											<DataTableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeItem(row.product_id)}
												>
													Remove
												</Button>
											</DataTableCell>
										</DataTableRow>
									);
								})}
							</tbody>
						</DataTable>
					</div>
				</div>

				<div className="space-y-4 lg:sticky lg:top-20">
					<Card className="ring-1 ring-border/60">
						<CardHeader>
							<CardTitle className="font-heading text-lg">
								Order summary
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-baseline justify-between text-muted-foreground text-sm">
								<span>Items</span>
								<span className="font-mono">{lines.length}</span>
							</div>
							<div className="flex items-baseline justify-between border-border/60 border-t pt-3">
								<span className="text-muted-foreground text-sm">Total</span>
								<span className="font-heading font-medium text-2xl tracking-tight">
									{formatIdr(total)}
								</span>
							</div>
						</CardContent>
					</Card>

					<Panel>
						<form className="grid gap-4" onSubmit={handleCheckout}>
							<h2 className="font-heading font-medium text-base">
								Customer details
							</h2>
							<div className="grid gap-2">
								<Label htmlFor="customer_name">Name</Label>
								<Input
									id="customer_name"
									required
									value={customerName}
									onChange={(e) => setCustomerName(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="customer_email">Email</Label>
								<Input
									id="customer_email"
									type="email"
									required
									value={customerEmail}
									onChange={(e) => setCustomerEmail(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="customer_phone">Phone (optional)</Label>
								<Input
									id="customer_phone"
									value={customerPhone}
									onChange={(e) => setCustomerPhone(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="shipping_address">
									Shipping address (optional)
								</Label>
								<Textarea
									id="shipping_address"
									value={shippingAddress}
									onChange={(e) => setShippingAddress(e.target.value)}
								/>
							</div>
							{hasUnavailableItem ? (
								<p className="text-destructive text-sm">
									Remove unavailable items before checkout.
								</p>
							) : null}
							{error ? (
								<p className="text-destructive text-sm">{error}</p>
							) : null}
							<Button
								type="submit"
								size="lg"
								className="w-full"
								disabled={
									submitting || isLoading || hasStockIssue || hasUnavailableItem
								}
							>
								{submitting ? "Placing order…" : "Place order"}
							</Button>
						</form>
					</Panel>
				</div>
			</div>
		</PageShell>
	);
}

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@minishop-fe/ui/components/empty";
import { Skeleton } from "@minishop-fe/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { useAdminToken } from "@/hooks/use-admin-token";
import { getAdminOrder } from "@/lib/api";
import { formatIdr } from "@/lib/format";

export const Route = createFileRoute("/admin/orders/$idOrOrderNumber")({
	component: AdminOrderDetailPage,
});

function AdminOrderDetailPage() {
	const { idOrOrderNumber } = Route.useParams();
	const { token, ready } = useAdminToken();

	const orderQuery = useQuery({
		queryKey: ["admin", "order", idOrOrderNumber],
		queryFn: () => getAdminOrder(idOrOrderNumber),
		enabled: Boolean(token),
	});

	if (!ready) return <p className="text-muted-foreground text-sm">Loading…</p>;

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

	if (orderQuery.isLoading) {
		return <Skeleton className="h-64 w-full" />;
	}

	if (orderQuery.isError || !orderQuery.data) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyTitle>Order not found</EmptyTitle>
					<EmptyDescription>
						<Link to="/admin/orders" className="underline">
							Back to orders
						</Link>
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const order = orderQuery.data;
	const items = order.items ?? [];

	return (
		<div className="space-y-6">
			<Link
				to="/admin/orders"
				className="text-muted-foreground text-sm hover:underline"
			>
				← Orders
			</Link>
			<dl className="grid max-w-lg gap-2 rounded-lg border p-4 text-sm">
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<dt className="text-muted-foreground">Order number</dt>
					<dd className="min-w-0 break-all text-right font-medium">
						{order.order_number ?? order.id}
					</dd>
				</div>
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<dt className="text-muted-foreground">Status</dt>
					<dd className="text-right">{order.status ?? "—"}</dd>
				</div>
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<dt className="text-muted-foreground">Customer</dt>
					<dd className="min-w-0 text-right">
						{order.customer_name}
						<br />
						<span className="break-all text-muted-foreground">
							{order.customer_email}
						</span>
					</dd>
				</div>
				{order.customer_phone ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<dt className="text-muted-foreground">Phone</dt>
						<dd className="text-right">{order.customer_phone}</dd>
					</div>
				) : null}
				{order.shipping_address ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<dt className="text-muted-foreground">Address</dt>
						<dd className="max-w-[min(100%,16rem)] text-right sm:max-w-xs">
							{order.shipping_address}
						</dd>
					</div>
				) : null}
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<dt className="text-muted-foreground">Total</dt>
					<dd className="text-right font-medium">{formatIdr(order.total)}</dd>
				</div>
				{order.created_at ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<dt className="text-muted-foreground">Created</dt>
						<dd className="text-right text-xs sm:text-sm">
							{new Date(order.created_at).toLocaleString()}
						</dd>
					</div>
				) : null}
			</dl>

			<div>
				<h2 className="mb-2 font-medium">Items</h2>
				{items.length === 0 ? (
					<p className="text-muted-foreground text-sm">No line items.</p>
				) : (
					<div className="overflow-x-auto rounded-lg border">
						<table className="w-full min-w-[32rem] text-left text-sm">
							<thead className="border-b bg-muted/40">
								<tr>
									<th className="p-3 font-medium">Product</th>
									<th className="p-3 font-medium">Unit price</th>
									<th className="p-3 font-medium">Qty</th>
									<th className="p-3 font-medium">Line total</th>
								</tr>
							</thead>
							<tbody>
								{items.map((item) => (
									<tr
										key={item.id ?? `${item.product_id}-${item.quantity}`}
										className="border-b last:border-0"
									>
										<td className="p-3">
											{item.product_name ?? item.product_id}
										</td>
										<td className="p-3">{formatIdr(item.unit_price)}</td>
										<td className="p-3">{item.quantity ?? "—"}</td>
										<td className="p-3">{formatIdr(item.line_total)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

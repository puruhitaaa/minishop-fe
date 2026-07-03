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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import {
	DataTable,
	DataTableCell,
	DataTableHead,
	DataTableRow,
} from "@/components/data-table";
import { Panel } from "@/components/panel";
import { useAdminToken } from "@/hooks/use-admin-token";
import { ApiRequestError, listAdminOrders } from "@/lib/api";
import { formatIdr } from "@/lib/format";

const ordersSearchSchema = z.object({
	page: z.coerce.number().int().min(1).optional().catch(1),
	customer_email: z.string().optional(),
	order_number: z.string().optional(),
});

export const Route = createFileRoute("/admin/orders/")({
	validateSearch: (search) => ordersSearchSchema.parse(search),
	component: AdminOrdersPage,
});

function AdminOrdersPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { token, ready } = useAdminToken();
	const { page = 1, customer_email, order_number } = Route.useSearch();
	const [emailInput, setEmailInput] = useState(customer_email ?? "");
	const [orderInput, setOrderInput] = useState(order_number ?? "");

	const ordersQuery = useQuery({
		queryKey: ["admin", "orders", { page, customer_email, order_number }],
		queryFn: () =>
			listAdminOrders({
				page,
				limit: 20,
				customer_email: customer_email || undefined,
				order_number: order_number || undefined,
				sort: "created_at_desc",
			}),
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
						</Link>{" "}
						to view orders.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const orders = ordersQuery.data?.items ?? [];
	const meta = ordersQuery.data?.meta;

	function applyFilters() {
		navigate({
			search: (prev) => ({
				...prev,
				customer_email: emailInput.trim() || undefined,
				order_number: orderInput.trim() || undefined,
				page: 1,
			}),
		});
	}

	return (
		<div className="space-y-4">
			<Panel
				padding="tight"
				className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
			>
				<div className="grid w-full min-w-0 gap-2 sm:max-w-xs sm:flex-1">
					<Label htmlFor="order_number">Order number</Label>
					<Input
						id="order_number"
						value={orderInput}
						onChange={(e) => setOrderInput(e.target.value)}
					/>
				</div>
				<div className="grid w-full min-w-0 gap-2 sm:max-w-xs sm:flex-1">
					<Label htmlFor="customer_email">Customer email</Label>
					<Input
						id="customer_email"
						type="email"
						value={emailInput}
						onChange={(e) => setEmailInput(e.target.value)}
					/>
				</div>
				<Button
					variant="outline"
					className="w-full sm:w-auto"
					onClick={applyFilters}
				>
					Filter
				</Button>
			</Panel>

			{ordersQuery.isLoading ? (
				<Skeleton className="h-40 w-full" />
			) : ordersQuery.isError ? (
				<p className="text-destructive text-sm">
					{ordersQuery.error instanceof ApiRequestError
						? ordersQuery.error.message
						: "Failed to load orders"}
				</p>
			) : orders.length === 0 ? (
				<Empty className="border">
					<EmptyHeader>
						<EmptyTitle>No orders</EmptyTitle>
						<EmptyDescription>Try different filters.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<DataTable>
					<DataTableHead>
						<DataTableRow>
							<DataTableCell header>Order</DataTableCell>
							<DataTableCell header>Customer</DataTableCell>
							<DataTableCell header>Status</DataTableCell>
							<DataTableCell header>Total</DataTableCell>
							<DataTableCell header>Created</DataTableCell>
						</DataTableRow>
					</DataTableHead>
					<tbody>
						{orders.map((order) => {
							const detailKey = order.order_number || order.id || "";
							return (
								<DataTableRow key={order.id ?? order.order_number}>
									<DataTableCell>
										{detailKey ? (
											<Link
												to="/admin/orders/$idOrOrderNumber"
												params={{ idOrOrderNumber: detailKey }}
												className="font-medium transition-colors hover:text-primary"
											>
												{order.order_number ?? order.id}
											</Link>
										) : (
											"—"
										)}
									</DataTableCell>
									<DataTableCell>
										<div>{order.customer_name}</div>
										<div className="text-muted-foreground">
											{order.customer_email}
										</div>
									</DataTableCell>
									<DataTableCell>{order.status ?? "—"}</DataTableCell>
									<DataTableCell className="font-medium">
										{formatIdr(order.total)}
									</DataTableCell>
									<DataTableCell className="text-muted-foreground">
										{order.created_at
											? new Date(order.created_at).toLocaleString()
											: "—"}
									</DataTableCell>
								</DataTableRow>
							);
						})}
					</tbody>
				</DataTable>
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
					<span className="text-muted-foreground text-sm">
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
	);
}

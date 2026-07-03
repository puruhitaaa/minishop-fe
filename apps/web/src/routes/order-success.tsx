import { Button } from "@minishop-fe/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@minishop-fe/ui/components/empty";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageShell } from "@/components/page-shell";
import { formatIdr } from "@/lib/format";
import { takeOrderSuccessSummary } from "@/lib/order-success-storage";

export const Route = createFileRoute("/order-success")({
	component: OrderSuccessPage,
});

function OrderSuccessPage() {
	const summary = useMemo(() => takeOrderSuccessSummary(), []);

	if (!summary) {
		return (
			<PageShell width="narrow">
				<Empty className="border">
					<EmptyHeader>
						<EmptyTitle>No order summary</EmptyTitle>
						<EmptyDescription>
							Place an order from your cart, or{" "}
							<Link to="/" className="underline">
								return to the shop
							</Link>
							.
						</EmptyDescription>
					</EmptyHeader>
					<Button variant="outline" render={<Link to="/" />}>
						Shop
					</Button>
				</Empty>
			</PageShell>
		);
	}

	return (
		<PageShell width="narrow" className="space-y-4">
			<h1 className="font-medium text-xl tracking-tight sm:text-2xl">
				Order placed
			</h1>
			<p className="text-muted-foreground text-sm">Thank you for your order.</p>
			<dl className="space-y-2 rounded-lg border p-4 text-sm">
				{summary.order_number ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<dt className="text-muted-foreground">Order number</dt>
						<dd className="min-w-0 break-all text-right font-medium">
							{summary.order_number}
						</dd>
					</div>
				) : null}
				{summary.status ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<dt className="text-muted-foreground">Status</dt>
						<dd className="text-right">{summary.status}</dd>
					</div>
				) : null}
				<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<dt className="text-muted-foreground">Total</dt>
					<dd className="text-right font-medium">{formatIdr(summary.total)}</dd>
				</div>
				{summary.customer_email ? (
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<dt className="text-muted-foreground">Email</dt>
						<dd className="min-w-0 break-all text-right">
							{summary.customer_email}
						</dd>
					</div>
				) : null}
			</dl>
			<Button className="w-full sm:w-auto" render={<Link to="/" />}>
				Continue shopping
			</Button>
		</PageShell>
	);
}

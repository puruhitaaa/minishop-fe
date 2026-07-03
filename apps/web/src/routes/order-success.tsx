import { Button } from "@minishop-fe/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@minishop-fe/ui/components/empty";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { CheckoutResponse } from "@/lib/api";
import { formatIdr } from "@/lib/format";
import { clearOrderSuccessSummary, readOrderSuccessSummary } from "@/lib/order-success-storage";

export const Route = createFileRoute("/order-success")({
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const [summary, setSummary] = useState<CheckoutResponse | null | undefined>(undefined);

  useEffect(() => {
    const data = readOrderSuccessSummary();
    setSummary(data);
    if (data) clearOrderSuccessSummary();
  }, []);

  if (summary === undefined) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-6">
        <p className="text-sm text-muted-foreground">Loading order summary…</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-6">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg space-y-4 px-4 py-6">
      <h1 className="text-2xl font-medium">Order placed</h1>
      <p className="text-sm text-muted-foreground">Thank you for your order.</p>
      <dl className="space-y-2 rounded-lg border p-4 text-sm">
        {summary.order_number ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="font-medium">{summary.order_number}</dd>
          </div>
        ) : null}
        {summary.status ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{summary.status}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Total</dt>
          <dd className="font-medium">{formatIdr(summary.total)}</dd>
        </div>
        {summary.customer_email ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{summary.customer_email}</dd>
          </div>
        ) : null}
      </dl>
      <Button render={<Link to="/" />}>Continue shopping</Button>
    </div>
  );
}
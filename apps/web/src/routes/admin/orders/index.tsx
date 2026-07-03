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
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

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

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

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
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-2">
          <Label htmlFor="order_number">Order number</Label>
          <Input
            id="order_number"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customer_email">Customer email</Label>
          <Input
            id="customer_email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={applyFilters}>
          Filter
        </Button>
      </div>

      {ordersQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : ordersQuery.isError ? (
        <p className="text-sm text-destructive">
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
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const detailKey = order.order_number || order.id || "";
                return (
                  <tr key={order.id ?? order.order_number} className="border-b last:border-0">
                    <td className="p-3">
                      {detailKey ? (
                        <Link
                          to="/admin/orders/$idOrOrderNumber"
                          params={{ idOrOrderNumber: detailKey }}
                          className="font-medium hover:underline"
                        >
                          {order.order_number ?? order.id}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      <div>{order.customer_name}</div>
                      <div className="text-muted-foreground">{order.customer_email}</div>
                    </td>
                    <td className="p-3">{order.status ?? "—"}</td>
                    <td className="p-3">{formatIdr(order.total)}</td>
                    <td className="p-3 text-muted-foreground">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && (meta.total_pages ?? 1) > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => navigate({ search: (prev) => ({ ...prev, page: page - 1 }) })}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.total_pages ?? page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (meta.total_pages ?? page)}
            onClick={() => navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
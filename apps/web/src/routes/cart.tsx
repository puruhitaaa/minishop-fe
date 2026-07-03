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
import { Textarea } from "@minishop-fe/ui/components/textarea";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
  const hasUnavailableItem = rows.some((row) => !row.loading && (row.error || !row.product));

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
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>
              <Link to="/" className="underline">
                Continue shopping
              </Link>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-6">
      <h1 className="text-2xl font-medium">Cart</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Qty</th>
              <th className="p-3 font-medium">Line total</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const stock = row.product?.stock;
              const maxQty = stock !== undefined && stock > 0 ? stock : undefined;
              const lineTotal = (row.product?.price ?? 0) * row.quantity;
              const stockWarning =
                stock !== undefined && (stock <= 0 || row.quantity > stock);

              return (
                <tr key={row.product_id} className="border-b last:border-0">
                  <td className="p-3">
                    {row.loading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : row.error || !row.product ? (
                      <span className="text-destructive">Unavailable</span>
                    ) : (
                      <Link
                        to={productDetailPath(row.product)}
                        className="font-medium hover:underline"
                      >
                        {row.product.name}
                      </Link>
                    )}
                    {stockWarning ? (
                      <p className="text-xs text-destructive">Stock limit: {stock ?? 0}</p>
                    ) : null}
                  </td>
                  <td className="p-3">{formatIdr(row.product?.price)}</td>
                  <td className="p-3">
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
                  </td>
                  <td className="p-3">{formatIdr(lineTotal)}</td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(row.product_id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-right text-lg font-medium">Total: {formatIdr(total)}</p>

      <form className="grid max-w-lg gap-4 rounded-lg border p-4" onSubmit={handleCheckout}>
        <h2 className="font-medium">Checkout</h2>
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
          <Label htmlFor="shipping_address">Shipping address (optional)</Label>
          <Textarea
            id="shipping_address"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
          />
        </div>
        {hasUnavailableItem ? (
          <p className="text-sm text-destructive">Remove unavailable items before checkout.</p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting || isLoading || hasStockIssue || hasUnavailableItem}>
          {submitting ? "Placing order…" : "Place order"}
        </Button>
      </form>
    </div>
  );
}

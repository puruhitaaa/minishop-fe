import { getPublicProduct, type Product } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { useQueries } from "@tanstack/react-query";

export type CartLineWithProduct = {
  product_id: string;
  quantity: number;
  product?: Product;
  loading: boolean;
  error: boolean;
};

export function useCartProducts(): {
  rows: CartLineWithProduct[];
  isLoading: boolean;
  hasError: boolean;
} {
  const { lines } = useCart();

  const queries = useQueries({
    queries: lines.map((line) => ({
      queryKey: ["product", line.product_id],
      queryFn: () => getPublicProduct(line.product_id),
      enabled: Boolean(line.product_id),
    })),
  });

  const rows: CartLineWithProduct[] = lines.map((line, index) => {
    const query = queries[index];
    return {
      product_id: line.product_id,
      quantity: line.quantity,
      product: query?.data,
      loading: query?.isLoading ?? false,
      error: query?.isError ?? false,
    };
  });

  return {
    rows,
    isLoading: queries.some((q) => q.isLoading),
    hasError: queries.some((q) => q.isError),
  };
}
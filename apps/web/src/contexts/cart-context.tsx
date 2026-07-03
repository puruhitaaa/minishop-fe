import type { Product } from "@/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "minishop-cart";

export type CartLine = {
  product_id: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  addItem: (productId: string, quantity?: number, product?: Pick<Product, "stock">) => void;
  setQuantity: (productId: string, quantity: number, product?: Pick<Product, "stock">) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.floor(quantity));
}

function clampToStock(quantity: number, stock?: number): number {
  const qty = normalizeQuantity(quantity);
  if (stock === undefined || stock === null) return qty;
  if (stock <= 0) return 0;
  return Math.min(qty, stock);
}

function readStoredLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((line) => {
        if (!line || typeof line !== "object") return null;
        const product_id = "product_id" in line ? String(line.product_id) : "";
        const quantity = "quantity" in line ? Number(line.quantity) : 0;
        if (!product_id || quantity < 1) return null;
        return { product_id, quantity: normalizeQuantity(quantity) };
      })
      .filter((line): line is CartLine => line !== null);
  } catch {
    return [];
  }
}

function writeStoredLines(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Ignore blocked storage; cart still works in memory.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredLines(lines);
  }, [hydrated, lines]);

  const addItem = useCallback(
    (productId: string, quantity = 1, product?: Pick<Product, "stock">) => {
      const stock = product?.stock;
      if (stock !== undefined && stock <= 0) return;

      setLines((prev) => {
        const existing = prev.find((line) => line.product_id === productId);
        const nextQty = clampToStock((existing?.quantity ?? 0) + quantity, stock);
        if (nextQty <= 0) return prev;

        if (existing) {
          return prev.map((line) =>
            line.product_id === productId ? { ...line, quantity: nextQty } : line,
          );
        }
        return [...prev, { product_id: productId, quantity: nextQty }];
      });
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number, product?: Pick<Product, "stock">) => {
      const nextQty = clampToStock(quantity, product?.stock);
      setLines((prev) => {
        if (nextQty <= 0) return prev.filter((line) => line.product_id !== productId);
        return prev.map((line) =>
          line.product_id === productId ? { ...line, quantity: nextQty } : line,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => prev.filter((line) => line.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({ lines, itemCount, addItem, setQuantity, removeItem, clearCart }),
    [lines, itemCount, addItem, setQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

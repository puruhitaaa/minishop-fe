import { Button } from "@minishop-fe/ui/components/button";
import { Link } from "@tanstack/react-router";

import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/" as const, label: "Shop" },
  { to: "/cart" as const, label: "Cart" },
  { to: "/admin" as const, label: "Admin" },
] as const;

export default function Header() {
  const { itemCount } = useCart();

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="hover:underline"
              activeProps={{ className: "font-medium underline" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link to="/cart" />}>
            Cart
            <span
              className={cn(
                "ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground",
                itemCount === 0 && "opacity-60",
              )}
            >
              {itemCount}
            </span>
          </Button>
        </div>
      </div>
      <hr />
    </div>
  );
}
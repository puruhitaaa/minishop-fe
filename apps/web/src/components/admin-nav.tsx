import { Link } from "@tanstack/react-router";

const links = [
  { to: "/admin" as const, label: "Token" },
  { to: "/admin/products" as const, label: "Products" },
  { to: "/admin/orders" as const, label: "Orders" },
] as const;

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      {links.map(({ to, label }) => (
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
  );
}
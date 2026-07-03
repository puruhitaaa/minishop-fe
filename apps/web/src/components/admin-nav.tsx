import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

const links = [
	{ to: "/admin" as const, label: "Access" },
	{ to: "/admin/products" as const, label: "Products" },
	{ to: "/admin/orders" as const, label: "Orders" },
] as const;

export function AdminNav() {
	return (
		<nav className="flex flex-wrap gap-2">
			{links.map(({ to, label }) => (
				<Link
					key={to}
					to={to}
					className={cn(
						"rounded-xl border border-transparent px-3 py-1.5 text-muted-foreground text-sm transition-colors",
						"hover:border-border/80 hover:bg-muted/40 hover:text-foreground",
					)}
					activeProps={{
						className:
							"border-border/80 bg-accent text-accent-foreground font-medium shadow-sm hover:bg-accent hover:text-accent-foreground",
					}}
				>
					{label}
				</Link>
			))}
		</nav>
	);
}

import { Button } from "@minishop-fe/ui/components/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@minishop-fe/ui/components/sheet";
import {
	GearSixIcon,
	ListIcon,
	ShoppingCartSimpleIcon,
	StorefrontIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

const navLinks = [
	{ to: "/" as const, label: "Shop", icon: StorefrontIcon },
	{ to: "/cart" as const, label: "Cart", icon: ShoppingCartSimpleIcon },
	{ to: "/admin" as const, label: "Admin", icon: GearSixIcon },
] as const;

const navLinkClass =
	"inline-flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

const navLinkActiveClass =
	"bg-accent text-accent-foreground shadow-sm ring-1 ring-border/60 hover:bg-accent hover:text-accent-foreground";

function CartBadge({ className }: { className?: string }) {
	const { itemCount } = useCart();
	return (
		<span
			className={cn(
				"inline-flex min-w-5 items-center justify-center rounded-full bg-primary-foreground/15 px-1.5 text-xs",
				itemCount === 0 && "opacity-70",
				className,
			)}
		>
			{itemCount}
		</span>
	);
}

export default function Header() {
	const { itemCount } = useCart();

	return (
		<header className="sticky top-0 z-40 border-border/70 border-b bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
				<div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none">
					<Sheet>
						<SheetTrigger
							render={
								<Button
									variant="outline"
									size="icon-sm"
									className="shrink-0 md:hidden"
									aria-label="Open menu"
								/>
							}
						>
							<ListIcon className="size-4" weight="bold" />
						</SheetTrigger>
						<SheetContent side="left" className="w-[min(100%,20rem)] p-0">
							<SheetHeader className="border-border/60 border-b px-4 py-3 text-left">
								<SheetTitle>Menu</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-1 p-3">
								{navLinks.map(({ to, label, icon: Icon }) => (
									<SheetClose
										key={to}
										render={
											<Link
												to={to}
												className={navLinkClass}
												activeProps={{ className: navLinkActiveClass }}
											/>
										}
									>
										<Icon className="size-4" weight="regular" />
										{label}
									</SheetClose>
								))}
							</nav>
						</SheetContent>
					</Sheet>

					<Link
						to="/"
						className="group flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 transition-colors hover:text-primary"
					>
						<span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
							<StorefrontIcon className="size-4" weight="duotone" />
						</span>
						<span className="truncate font-heading font-medium text-sm tracking-tight sm:text-base">
							MiniShop
						</span>
					</Link>
				</div>

				<nav className="hidden items-center gap-1 md:flex">
					{navLinks.map(({ to, label, icon: Icon }) => (
						<Link
							key={to}
							to={to}
							className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted/60 hover:text-foreground"
							activeProps={{ className: navLinkActiveClass }}
						>
							<Icon className="size-4" weight="regular" />
							{label}
						</Link>
					))}
				</nav>

				<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
					<ThemeToggle />
					<Button
						variant="outline"
						size="sm"
						className="md:hidden"
						render={<Link to="/cart" />}
					>
						<ShoppingCartSimpleIcon className="size-4" weight="regular" />
						<span
							className={cn(
								"ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-primary-foreground text-xs",
								itemCount === 0 && "opacity-60",
							)}
						>
							{itemCount}
						</span>
					</Button>
					<Button
						size="sm"
						render={<Link to="/cart" />}
						className="hidden md:inline-flex"
					>
						<ShoppingCartSimpleIcon className="size-4" weight="regular" />
						<span className="hidden sm:inline">Cart</span>
						<CartBadge />
					</Button>
				</div>
			</div>
		</header>
	);
}

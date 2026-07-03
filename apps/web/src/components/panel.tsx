import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
	children,
	className,
	padding = "default",
}: {
	children: ReactNode;
	className?: string;
	padding?: "default" | "tight";
}) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-border/80 bg-card/50 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.4)] ring-1 ring-foreground/5 backdrop-blur-sm",
				padding === "default" ? "p-5 sm:p-6" : "p-4",
				className,
			)}
		>
			{children}
		</div>
	);
}

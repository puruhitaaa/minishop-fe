import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
	children: ReactNode;
	className?: string;
	width?: "narrow" | "default" | "wide";
};

const widthClass = {
	narrow: "max-w-3xl",
	default: "max-w-6xl",
	wide: "max-w-7xl",
} as const;

export function PageShell({
	children,
	className,
	width = "default",
}: PageShellProps) {
	return (
		<div
			className={cn(
				"mx-auto w-full px-4 py-8 sm:px-6 lg:py-10",
				widthClass[width],
				className,
			)}
		>
			{children}
		</div>
	);
}

type PageHeaderProps = {
	eyebrow?: string;
	title: string;
	description?: string;
	actions?: ReactNode;
	className?: string;
};

export function PageHeader({
	eyebrow,
	title,
	description,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<header
			className={cn(
				"mb-8 flex flex-col gap-4 border-border/60 border-b pb-6 sm:flex-row sm:items-end sm:justify-between",
				className,
			)}
		>
			<div className="max-w-2xl space-y-2">
				{eyebrow ? (
					<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
						{eyebrow}
					</p>
				) : null}
				<h1 className="font-heading font-medium text-2xl tracking-tight sm:text-3xl md:text-4xl">
					{title}
				</h1>
				{description ? (
					<p className="text-base text-muted-foreground leading-relaxed">
						{description}
					</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
			) : null}
		</header>
	);
}

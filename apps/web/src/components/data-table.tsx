import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DataTable({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				"overflow-x-auto rounded-2xl border border-border/80 bg-card/40 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.45)] ring-1 ring-foreground/5",
				className,
			)}
		>
			<table className="w-full min-w-[28rem] text-left text-sm sm:min-w-[32rem]">
				{children}
			</table>
		</div>
	);
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
	return (
		<thead className="border-border/80 border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wide">
			{children}
		</thead>
	);
}

export function DataTableRow({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<tr
			className={cn(
				"border-border/50 border-b transition-colors last:border-0 hover:bg-muted/20",
				className,
			)}
		>
			{children}
		</tr>
	);
}

export function DataTableCell({
	children,
	className,
	header,
}: {
	children: ReactNode;
	className?: string;
	header?: boolean;
}) {
	const Tag = header ? "th" : "td";
	return (
		<Tag
			className={cn(
				"px-4 py-3 align-middle",
				header && "font-medium text-foreground normal-case tracking-normal",
				className,
			)}
		>
			{children}
		</Tag>
	);
}

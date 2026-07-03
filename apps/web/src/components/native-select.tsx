import { cn } from "@/lib/utils";

type NativeSelectProps = React.ComponentProps<"select">;

export function NativeSelect({
	className,
	children,
	...props
}: NativeSelectProps) {
	return (
		<select
			className={cn(
				"h-9 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm outline-none transition-[color,box-shadow,border-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
				className,
			)}
			{...props}
		>
			{children}
		</select>
	);
}

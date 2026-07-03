import { SpinnerIcon } from "@phosphor-icons/react";

export default function Loader() {
	return (
		<div className="flex h-full items-center justify-center pt-8">
			<SpinnerIcon className="size-6 animate-spin" />
		</div>
	);
}

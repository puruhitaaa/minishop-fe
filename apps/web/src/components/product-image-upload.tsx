import { Button } from "@minishop-fe/ui/components/button";
import { Label } from "@minishop-fe/ui/components/label";
import { ImageIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

function isAcceptedImage(file: File) {
	return (
		file.type === "image/jpeg" ||
		file.type === "image/png" ||
		file.type === "image/webp"
	);
}

type ProductImageUploadProps = {
	id?: string;
	label: string;
	value: File | null;
	onChange: (file: File | null) => void;
	currentImageUrl?: string | null;
	onRemoveCurrentImage?: () => void;
	disabled?: boolean;
};

export function ProductImageUpload({
	id: idProp,
	label,
	value,
	onChange,
	currentImageUrl,
	onRemoveCurrentImage,
	disabled,
}: ProductImageUploadProps) {
	const autoId = useId();
	const inputId = idProp ?? autoId;
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!value) {
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(value);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [value]);

	const applyFile = useCallback(
		(file: File | null) => {
			setError(null);
			if (!file) {
				onChange(null);
				return;
			}
			if (!isAcceptedImage(file)) {
				setError("Use JPEG, PNG, or WebP.");
				return;
			}
			if (file.size > MAX_BYTES) {
				setError("Image must be 5 MB or smaller.");
				return;
			}
			onChange(file);
		},
		[onChange],
	);

	const displayUrl = previewUrl ?? (value ? null : currentImageUrl) ?? null;

	function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		applyFile(e.target.files?.[0] ?? null);
		e.target.value = "";
	}

	function onDrop(e: React.DragEvent) {
		e.preventDefault();
		setDragOver(false);
		if (disabled) return;
		const file = e.dataTransfer.files?.[0];
		if (file) applyFile(file);
	}

	return (
		<div className="grid gap-2">
			<Label htmlFor={inputId}>{label}</Label>
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				className="sr-only"
				accept={ACCEPT}
				disabled={disabled}
				onChange={onInputChange}
			/>
			{displayUrl ? (
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start">
					<img
						src={displayUrl}
						alt=""
						className="aspect-square w-full max-w-40 rounded-2xl border object-cover"
					/>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={disabled}
							onClick={() => inputRef.current?.click()}
						>
							Replace
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={disabled}
							onClick={() => {
								if (value) applyFile(null);
								else onRemoveCurrentImage?.();
							}}
						>
							<XIcon className="size-4" aria-hidden />
							Remove
						</Button>
					</div>
				</div>
			) : (
				// ponytail: no react-dropzone dep; native drag/drop + hidden input
				<button
					type="button"
					disabled={disabled}
					className={cn(
						"flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/30 px-4 py-6 text-center text-sm transition-colors",
						"hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
						dragOver && "border-ring bg-muted/50",
						disabled && "pointer-events-none opacity-50",
					)}
					onClick={() => inputRef.current?.click()}
					onDragEnter={(e) => {
						e.preventDefault();
						if (!disabled) setDragOver(true);
					}}
					onDragLeave={(e) => {
						e.preventDefault();
						setDragOver(false);
					}}
					onDragOver={(e) => e.preventDefault()}
					onDrop={onDrop}
				>
					<ImageIcon className="size-8 text-muted-foreground" aria-hidden />
					<span className="font-medium">
						Drop image here or click to upload
					</span>
					<span className="text-muted-foreground text-xs">
						JPEG, PNG, or WebP · max 5 MB
					</span>
				</button>
			)}
			{error ? <p className="text-destructive text-sm">{error}</p> : null}
		</div>
	);
}

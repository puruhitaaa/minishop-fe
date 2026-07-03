import { Button } from "@minishop-fe/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@minishop-fe/ui/components/empty";
import { Input } from "@minishop-fe/ui/components/input";
import { Label } from "@minishop-fe/ui/components/label";
import { Skeleton } from "@minishop-fe/ui/components/skeleton";
import { Textarea } from "@minishop-fe/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
	DataTable,
	DataTableCell,
	DataTableHead,
	DataTableRow,
} from "@/components/data-table";
import { NativeSelect } from "@/components/native-select";
import { Panel } from "@/components/panel";
import { ProductImageUpload } from "@/components/product-image-upload";
import { useAdminToken } from "@/hooks/use-admin-token";
import { buildProductFormData } from "@/lib/admin-product-form";
import {
	ApiRequestError,
	createAdminProduct,
	deleteAdminProduct,
	listAdminCategories,
	listAdminProducts,
} from "@/lib/api";
import { formatIdr } from "@/lib/format";

const productsSearchSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().min(1).optional().catch(1),
});

export const Route = createFileRoute("/admin/products/")({
	validateSearch: (search) => productsSearchSchema.parse(search),
	component: AdminProductsPage,
});

function AdminProductsPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const queryClient = useQueryClient();
	const { token, ready } = useAdminToken();
	const { search, page = 1 } = Route.useSearch();
	const [searchInput, setSearchInput] = useState(search ?? "");

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [stock, setStock] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const categoriesQuery = useQuery({
		queryKey: ["admin", "categories"],
		queryFn: () => listAdminCategories({ limit: 100 }),
		enabled: Boolean(token),
	});

	const productsQuery = useQuery({
		queryKey: ["admin", "products", { search, page }],
		queryFn: () =>
			listAdminProducts({
				search: search || undefined,
				page,
				limit: 20,
				sort: "created_at_desc",
			}),
		enabled: Boolean(token),
	});

	const createMutation = useMutation({
		mutationFn: () =>
			createAdminProduct(
				buildProductFormData(
					{
						name,
						slug,
						description,
						price,
						category_id: categoryId,
						stock,
						is_active: isActive,
						image: imageFile,
					},
					"create",
				),
			),
		onSuccess: () => {
			toast.success("Product created");
			setName("");
			setSlug("");
			setDescription("");
			setPrice("");
			setStock("");
			setImageFile(null);
			setFormError(null);
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
		},
		onError: (err) => {
			setFormError(
				err instanceof ApiRequestError ? err.message : "Create failed",
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (idOrSlug: string) => deleteAdminProduct(idOrSlug),
		onSuccess: () => {
			toast.success("Product deleted");
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
		},
		onError: (err) => {
			toast.error(
				err instanceof ApiRequestError ? err.message : "Delete failed",
			);
		},
	});

	if (!ready) return <p className="text-muted-foreground text-sm">Loading…</p>;

	if (!token) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyTitle>Token required</EmptyTitle>
					<EmptyDescription>
						<Link to="/admin" className="underline">
							Save an admin token
						</Link>{" "}
						to manage products.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const products = productsQuery.data?.items ?? [];
	const meta = productsQuery.data?.meta;
	const categories = categoriesQuery.data?.items ?? [];

	function applySearch() {
		navigate({
			search: (prev) => ({
				...prev,
				search: searchInput.trim() || undefined,
				page: 1,
			}),
		});
	}

	return (
		<div className="space-y-8">
			<Panel className="max-w-xl">
				<form
					className="grid gap-3"
					onSubmit={(e) => {
						e.preventDefault();
						if (!name.trim() || !price.trim() || !categoryId || !stock.trim()) {
							setFormError("Name, price, category, and stock are required.");
							return;
						}
						createMutation.mutate();
					}}
				>
					<h2 className="font-heading font-medium text-lg tracking-tight">
						Create product
					</h2>
					<div className="grid gap-2">
						<Label htmlFor="new_name">Name</Label>
						<Input
							id="new_name"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new_slug">Slug (optional)</Label>
						<Input
							id="new_slug"
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new_description">Description (optional)</Label>
						<Textarea
							id="new_description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="new_price">Price (IDR)</Label>
							<Input
								id="new_price"
								type="number"
								min={0}
								step={1}
								required
								value={price}
								onChange={(e) => setPrice(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="new_stock">Stock</Label>
							<Input
								id="new_stock"
								type="number"
								min={0}
								step={1}
								required
								value={stock}
								onChange={(e) => setStock(e.target.value)}
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new_category">Category</Label>
						<NativeSelect
							id="new_category"
							required
							value={categoryId}
							onChange={(e) => setCategoryId(e.target.value)}
						>
							<option value="">Select category</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id ?? ""}>
									{cat.name}
								</option>
							))}
						</NativeSelect>
					</div>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={isActive}
							onChange={(e) => setIsActive(e.target.checked)}
						/>
						Active
					</label>
					<ProductImageUpload
						id="new_image"
						label="Image (optional)"
						value={imageFile}
						onChange={setImageFile}
					/>
					{formError ? (
						<p className="text-destructive text-sm">{formError}</p>
					) : null}
					<Button type="submit" disabled={createMutation.isPending}>
						{createMutation.isPending ? "Creating…" : "Create product"}
					</Button>
				</form>
			</Panel>

			<div className="space-y-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
					<div className="grid w-full min-w-0 flex-1 gap-2 sm:max-w-xs">
						<Label htmlFor="product_search">Search products</Label>
						<Input
							id="product_search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && (e.preventDefault(), applySearch())
							}
						/>
					</div>
					<Button
						variant="outline"
						className="w-full sm:w-auto"
						onClick={applySearch}
					>
						Search
					</Button>
				</div>

				{productsQuery.isLoading ? (
					<Skeleton className="h-40 w-full" />
				) : productsQuery.isError ? (
					<p className="text-destructive text-sm">
						{productsQuery.error instanceof ApiRequestError
							? productsQuery.error.message
							: "Failed to load products"}
					</p>
				) : products.length === 0 ? (
					<Empty className="border">
						<EmptyHeader>
							<EmptyTitle>No products</EmptyTitle>
							<EmptyDescription>
								Create one above or change search.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<DataTable>
						<DataTableHead>
							<DataTableRow>
								<DataTableCell header>Name</DataTableCell>
								<DataTableCell header>Price</DataTableCell>
								<DataTableCell header>Stock</DataTableCell>
								<DataTableCell header>Active</DataTableCell>
								<DataTableCell header />
							</DataTableRow>
						</DataTableHead>
						<tbody>
							{products.map((product) => {
								const key = product.id ?? product.slug ?? "";
								const editKey = product.slug || product.id || "";
								return (
									<DataTableRow key={key}>
										<DataTableCell className="font-medium">
											{product.name}
										</DataTableCell>
										<DataTableCell>{formatIdr(product.price)}</DataTableCell>
										<DataTableCell className="font-mono text-xs">
											{product.stock ?? "—"}
										</DataTableCell>
										<DataTableCell>
											{product.is_active ? "Yes" : "No"}
										</DataTableCell>
										<DataTableCell>
											<div className="flex flex-wrap gap-2">
												<Button
													variant="outline"
													size="sm"
													render={
														<Link
															to="/admin/products/$idOrSlug"
															params={{ idOrSlug: editKey }}
														/>
													}
												>
													Edit
												</Button>
												<Button
													variant="destructive"
													size="sm"
													disabled={deleteMutation.isPending || !editKey}
													onClick={() => {
														if (!editKey) return;
														if (!window.confirm(`Delete ${product.name}?`))
															return;
														deleteMutation.mutate(editKey);
													}}
												>
													Delete
												</Button>
											</div>
										</DataTableCell>
									</DataTableRow>
								);
							})}
						</tbody>
					</DataTable>
				)}

				{meta && (meta.total_pages ?? 1) > 1 ? (
					<div className="flex items-center justify-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() =>
								navigate({ search: (prev) => ({ ...prev, page: page - 1 }) })
							}
						>
							Prev
						</Button>
						<span className="text-muted-foreground text-sm">
							Page {page} of {meta.total_pages ?? page}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= (meta.total_pages ?? page)}
							onClick={() =>
								navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })
							}
						>
							Next
						</Button>
					</div>
				) : null}
			</div>
		</div>
	);
}

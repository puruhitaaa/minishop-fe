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
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { NativeSelect } from "@/components/native-select";
import { PageHeader, PageShell } from "@/components/page-shell";
import { Panel } from "@/components/panel";
import { ProductCard } from "@/components/product-card";
import { listPublicCategories, listPublicProducts } from "@/lib/api";

const catalogSearchSchema = z.object({
	search: z.string().optional(),
	category_slug: z.string().optional(),
	page: z.coerce.number().int().min(1).optional().catch(1),
});

export const Route = createFileRoute("/")({
	validateSearch: (search) => catalogSearchSchema.parse(search),
	component: ShopPage,
});

function ShopPage() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { search, category_slug, page = 1 } = Route.useSearch();
	const [searchInput, setSearchInput] = useState(search ?? "");

	const categoriesQuery = useQuery({
		queryKey: ["categories"],
		queryFn: listPublicCategories,
	});

	const productsQuery = useQuery({
		queryKey: ["products", { search, category_slug, page }],
		queryFn: () =>
			listPublicProducts({
				search: search || undefined,
				category_slug: category_slug || undefined,
				page,
				limit: 12,
				sort: "created_at_desc",
			}),
	});

	const categories = categoriesQuery.data?.items ?? [];
	const products = productsQuery.data?.items ?? [];
	const meta = productsQuery.data?.meta;

	function applyFilters(next: {
		search?: string;
		category_slug?: string;
		page?: number;
	}) {
		navigate({
			search: (prev) => ({
				...prev,
				search: next.search?.trim() || undefined,
				category_slug: next.category_slug || undefined,
				page: next.page ?? 1,
			}),
		});
	}

	return (
		<div className="relative min-h-full">
			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-transparent to-transparent"
				aria-hidden
			/>
			<PageShell width="wide" className="relative space-y-8">
				<section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
					<PageHeader
						eyebrow="Catalog"
						title="Curated goods for everyday use"
						description="Filter by category, search by name, and add items to your cart in a few clicks."
						className="mb-0 border-0 pb-0"
					/>
					<Panel className="lg:mb-2">
						<form
							className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
							onSubmit={(e) => {
								e.preventDefault();
								applyFilters({ search: searchInput, category_slug, page: 1 });
							}}
						>
							<div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor="search">Search</Label>
									<div className="relative">
										<MagnifyingGlassIcon
											className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
											weight="regular"
										/>
										<Input
											id="search"
											name="search"
											className="pl-9"
											value={searchInput}
											onChange={(e) => setSearchInput(e.target.value)}
											placeholder="Search products"
										/>
									</div>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="category">Category</Label>
									<NativeSelect
										id="category"
										value={category_slug ?? ""}
										onChange={(e) =>
											applyFilters({
												search: searchInput,
												category_slug: e.target.value || undefined,
												page: 1,
											})
										}
									>
										<option value="">All categories</option>
										{categories.map((cat) => (
											<option key={cat.id ?? cat.slug} value={cat.slug ?? ""}>
												{cat.name}
											</option>
										))}
									</NativeSelect>
								</div>
							</div>
							<Button type="submit" className="w-full sm:w-auto">
								Apply filters
							</Button>
						</form>
					</Panel>
				</section>

				{categoriesQuery.isError ? (
					<p className="text-destructive text-sm">Could not load categories.</p>
				) : null}

				{productsQuery.isPending ? (
					<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-80 w-full rounded-2xl" />
						))}
					</div>
				) : null}

				{productsQuery.isError ? (
					<Empty className="border border-border/80 bg-card/40">
						<EmptyHeader>
							<EmptyTitle>Could not load products</EmptyTitle>
							<EmptyDescription>
								Check the API server and try again.
							</EmptyDescription>
						</EmptyHeader>
						<Button variant="outline" onClick={() => productsQuery.refetch()}>
							Retry
						</Button>
					</Empty>
				) : null}

				{productsQuery.isSuccess && products.length === 0 ? (
					<Empty className="border border-border/80 bg-card/40">
						<EmptyHeader>
							<EmptyTitle>No products found</EmptyTitle>
							<EmptyDescription>
								Try a different search or category.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : null}

				{productsQuery.isSuccess && products.length > 0 ? (
					<>
						<div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-sm">
							<span className="min-w-0">
								Showing page {page}
								{meta?.total != null ? ` · ${meta.total} items` : ""}
							</span>
						</div>
						<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
							{products.map((product, index) => (
								<ProductCard
									key={product.id ?? product.slug}
									product={product}
									className="fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-500"
									style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
								/>
							))}
						</div>
						{meta && (meta.total_pages ?? 1) > 1 ? (
							<div className="flex items-center justify-center gap-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									disabled={page <= 1}
									onClick={() =>
										applyFilters({ search, category_slug, page: page - 1 })
									}
								>
									Previous
								</Button>
								<span className="font-mono text-muted-foreground text-sm">
									{page} / {meta.total_pages ?? page}
								</span>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= (meta.total_pages ?? page)}
									onClick={() =>
										applyFilters({ search, category_slug, page: page + 1 })
									}
								>
									Next
								</Button>
							</div>
						) : null}
					</>
				) : null}
			</PageShell>
		</div>
	);
}

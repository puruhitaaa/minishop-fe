import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminNav } from "@/components/admin-nav";
import { PageHeader, PageShell } from "@/components/page-shell";
import { Panel } from "@/components/panel";

export const Route = createFileRoute("/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<PageShell width="wide" className="space-y-6">
			<PageHeader
				eyebrow="Operations"
				title="Admin console"
				description="Manage catalog, orders, and demo API access for this storefront."
			/>
			<Panel padding="tight" className="space-y-3">
				<p className="text-muted-foreground text-sm">
					Demo only: bearer token stored in{" "}
					<span className="font-mono text-foreground text-xs">
						sessionStorage
					</span>
					, not production auth.
				</p>
				<AdminNav />
			</Panel>
			<Outlet />
		</PageShell>
	);
}

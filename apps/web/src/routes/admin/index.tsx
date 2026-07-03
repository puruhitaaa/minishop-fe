import { Button } from "@minishop-fe/ui/components/button";
import { Input } from "@minishop-fe/ui/components/input";
import { Label } from "@minishop-fe/ui/components/label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Panel } from "@/components/panel";
import { useAdminToken } from "@/hooks/use-admin-token";

export const Route = createFileRoute("/admin/")({
	component: AdminHomePage,
});

function AdminHomePage() {
	const { token, ready, save, clear } = useAdminToken();
	const [input, setInput] = useState("");

	if (!ready) {
		return <p className="text-muted-foreground text-sm">Loading…</p>;
	}

	return (
		<Panel className="max-w-xl space-y-4">
			<div className="space-y-1">
				<h2 className="font-heading font-medium text-lg tracking-tight">
					API access
				</h2>
				<p className="text-muted-foreground text-sm leading-relaxed">
					Paste a demo bearer token for internal routes. Cleared when the tab
					session ends.
				</p>
			</div>

			{token ? (
				<div className="space-y-4">
					<p className="rounded-xl bg-muted/40 px-3 py-2 text-sm ring-1 ring-border/60">
						Token saved{" "}
						<span className="font-mono text-muted-foreground text-xs">
							({token.slice(0, 8)}…)
						</span>
					</p>
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							render={<Link to="/admin/products" />}
						>
							Manage products
						</Button>
						<Button
							variant="outline"
							size="sm"
							render={<Link to="/admin/orders" />}
						>
							View orders
						</Button>
						<Button variant="destructive" size="sm" onClick={() => clear()}>
							Clear token
						</Button>
					</div>
				</div>
			) : (
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						save(input);
						setInput("");
					}}
				>
					<div className="grid gap-2">
						<Label htmlFor="admin_token">Bearer token</Label>
						<Input
							id="admin_token"
							type="password"
							autoComplete="off"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Paste token"
						/>
					</div>
					<Button type="submit" disabled={!input.trim()}>
						Save token
					</Button>
				</form>
			)}
		</Panel>
	);
}

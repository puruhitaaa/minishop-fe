import { Button } from "@minishop-fe/ui/components/button";
import { Input } from "@minishop-fe/ui/components/input";
import { Label } from "@minishop-fe/ui/components/label";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { useAdminToken } from "@/hooks/use-admin-token";

export const Route = createFileRoute("/admin/")({
  component: AdminHomePage,
});

function AdminHomePage() {
  const { token, ready, save, clear } = useAdminToken();
  const [input, setInput] = useState("");

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="max-w-lg space-y-4 rounded-lg border p-4">
      <h2 className="font-medium">Operator token</h2>
      <p className="text-sm text-muted-foreground">
        Paste a demo bearer token for internal API routes. Cleared when the tab session ends.
      </p>

      {token ? (
        <div className="space-y-3">
          <p className="text-sm">
            Token saved <span className="text-muted-foreground">({token.slice(0, 8)}…)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" render={<Link to="/admin/products" />}>
              Manage products
            </Button>
            <Button variant="outline" size="sm" render={<Link to="/admin/orders" />}>
              View orders
            </Button>
            <Button variant="destructive" size="sm" onClick={() => clear()}>
              Clear token
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-3"
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
    </div>
  );
}
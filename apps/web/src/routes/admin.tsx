import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AdminNav } from "@/components/admin-nav";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="container mx-auto max-w-6xl space-y-4 px-4 py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium">Admin</h1>
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Demo only — bearer token in sessionStorage, not production auth.
        </p>
        <AdminNav />
      </div>
      <Outlet />
    </div>
  );
}
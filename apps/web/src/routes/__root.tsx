import { Toaster } from "@minishop-fe/ui/components/sonner";
import { ThemeProvider } from "@minishop-fe/ui/components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";

import Header from "../components/header";
import { CartProvider } from "../contexts/cart-context";
import appCss from "../index.css?url";
import { createAppQueryClient } from "../lib/query-client";

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "MiniShop",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	const [queryClient] = useState(createAppQueryClient);

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<QueryClientProvider client={queryClient}>
						<CartProvider>
							<div className="grid min-h-[100dvh] grid-rows-[auto_1fr]">
								<Header />
								<main className="surface-grid min-h-0 overflow-x-clip">
									<Outlet />
								</main>
							</div>
						</CartProvider>
					</QueryClientProvider>
				</ThemeProvider>
				<Toaster richColors />
				<TanStackRouterDevtools position="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}

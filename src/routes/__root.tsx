import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Header from "../components/Header";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { AuthProvider } from "../lib/auth";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
				title: "DreamMoments",
			},
			{
				name: "description",
				content:
					"AI-powered wedding invitations for Malaysian and Singaporean Chinese couples.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const showDevtools = import.meta.env.DEV;

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<AuthProvider>
					<a href="#main-content" className="dm-skip-link">
						Skip to main content
					</a>
					<Header />
					{/* biome-ignore lint/correctness/useUniqueElementIds: Root layout renders once; skip link requires stable ID */}
					<main id="main-content" tabIndex={-1} className="pt-20">
						{children}
					</main>
				</AuthProvider>
				{showDevtools && (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}

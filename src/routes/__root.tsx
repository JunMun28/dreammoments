import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	HeadContent,
	Scripts,
	useLocation,
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
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Reenie+Beanie&family=Noto+Serif+SC:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&family=Sacramento&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
	errorComponent: RootErrorFallback,
});

function RootErrorFallback({ error, reset }: ErrorComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-dm-bg px-6">
			<div className="max-w-md text-center">
				<h1 className="font-heading text-2xl font-semibold text-dm-ink">
					Something went wrong
				</h1>
				<p className="mt-3 text-sm text-dm-muted">
					An unexpected error occurred. Please refresh the page to try again.
				</p>
				{import.meta.env.DEV && error instanceof Error && (
					<pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-dm-surface-muted p-4 text-left text-xs text-dm-error">
						{error.message}
					</pre>
				)}
				<button
					type="button"
					onClick={reset}
					className="mt-6 rounded-full bg-dm-accent-strong px-6 py-2 text-xs uppercase tracking-[0.2em] text-dm-on-accent"
				>
					Refresh Page
				</button>
			</div>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const showDevtools = import.meta.env.DEV;
	const { pathname } = useLocation();
	const isEditor = pathname.startsWith("/editor/");

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
					{!isEditor && <Header />}
					{/* biome-ignore lint/correctness/useUniqueElementIds: Root layout renders once; skip link requires stable ID */}
					<main
						id="main-content"
						tabIndex={-1}
						className={isEditor ? "" : "pt-20"}
					>
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

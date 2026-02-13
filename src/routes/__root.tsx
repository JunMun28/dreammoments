import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	HeadContent,
	Link,
	Scripts,
	useLocation,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import Header from "../components/Header";
import { ToastProvider } from "../components/ui/Toast";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { AuthProvider } from "../lib/auth";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	headers: () => ({
		"X-Frame-Options": "DENY",
		"X-Content-Type-Options": "nosniff",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
		"Content-Security-Policy":
			"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://api.stripe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com;",
		...(import.meta.env.PROD
			? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" }
			: {}),
	}),
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
				rel: "manifest",
				href: "/manifest.json",
			},
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
				rel: "preload",
				as: "style",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Reenie+Beanie&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&family=Sacramento&family=Pinyon+Script&family=Manrope:wght@300;400;500;600;700&display=swap",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Reenie+Beanie&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&family=Sacramento&family=Pinyon+Script&family=Manrope:wght@300;400;500;600;700&display=swap",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
	errorComponent: RootErrorFallback,
	notFoundComponent: () => (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<h1 className="font-display text-4xl font-bold text-[color:var(--dm-ink)]">
				404
			</h1>
			<p className="text-lg text-[color:var(--dm-muted)]">
				This page doesn't exist.
			</p>
			<Link
				to="/"
				className="rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
			>
				Back to Home
			</Link>
		</div>
	),
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
	const { pathname } = useLocation();
	const router = useRouter();
	const isFullScreen =
		pathname.startsWith("/editor/") || pathname.startsWith("/invite/");
	const isHome = pathname === "/";

	useEffect(() => {
		const unsubscribe = router.subscribe("onResolved", () => {
			document.getElementById("main-content")?.focus({ preventScroll: true });
		});
		return unsubscribe;
	}, [router]);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<AuthProvider>
					<ToastProvider>
						<a href="#main-content" className="dm-skip-link">
							Skip to main content
						</a>
						{!isFullScreen && !isHome && <Header />}
						{/* biome-ignore lint/correctness/useUniqueElementIds: Root layout renders once; skip link requires stable ID */}
						<main
							id="main-content"
							tabIndex={-1}
							className={isFullScreen || isHome ? "" : "pt-20"}
						>
							{children}
						</main>
					</ToastProvider>
				</AuthProvider>
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{ position: "bottom-right" }}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				)}
				{import.meta.env.DEV && (
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: dev-only cleanup to prevent stale SW issues across localhost projects
						dangerouslySetInnerHTML={{
							__html: `if("serviceWorker"in navigator){navigator.serviceWorker.getRegistrations().then(function(registrations){for(const registration of registrations){registration.unregister()}})}`,
						}}
					/>
				)}
				<Scripts />
				{!import.meta.env.DEV && (
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: inline SW registration script
						dangerouslySetInnerHTML={{
							__html: `if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js")})}`,
						}}
					/>
				)}
			</body>
		</html>
	);
}

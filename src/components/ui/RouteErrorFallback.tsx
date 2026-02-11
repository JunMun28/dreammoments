import { type ErrorComponentProps, Link } from "@tanstack/react-router";

export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-dm-bg px-6">
			<div className="max-w-md text-center">
				<h1 className="font-heading text-2xl font-semibold text-dm-ink">
					Something went wrong
				</h1>
				<p className="mt-3 text-sm text-dm-muted">
					An unexpected error occurred. Please try again.
				</p>
				{import.meta.env.DEV && error instanceof Error && (
					<pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-dm-surface-muted p-4 text-left text-xs text-dm-error">
						{error.message}
					</pre>
				)}
				<div className="mt-6 flex justify-center gap-3">
					<button
						type="button"
						onClick={reset}
						className="rounded-full bg-dm-accent-strong px-6 py-2 text-xs uppercase tracking-[0.2em] text-dm-on-accent"
					>
						Try Again
					</button>
					<Link
						to="/"
						className="rounded-full border border-dm-border px-6 py-2 text-xs uppercase tracking-[0.2em] text-dm-ink"
					>
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}

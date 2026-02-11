import { LoadingSpinner } from "./LoadingSpinner";

export function RouteLoadingSpinner() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-dm-bg">
			<div className="flex flex-col items-center gap-4">
				<LoadingSpinner size="lg" />
				<p className="animate-pulse text-sm text-dm-muted">Loading...</p>
			</div>
		</div>
	);
}

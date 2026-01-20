import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
	component: CatchAllNotFound,
});

function CatchAllNotFound() {
	return (
		<main className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
			<h1 className="mb-4 text-4xl font-bold text-gray-800">Page Not Found</h1>
			<p className="mb-8 max-w-md text-gray-600">
				Sorry, we couldn't find the page you're looking for. It may have been
				moved or doesn't exist.
			</p>
			<Link
				to="/"
				className="inline-flex items-center rounded-lg bg-rose-600 px-6 py-3 font-medium text-white transition-colors hover:bg-rose-700"
			>
				Return Home
			</Link>
		</main>
	);
}

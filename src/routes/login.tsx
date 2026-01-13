import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useId } from "react";
import { authClient } from "../lib/auth";

interface LoginSearch {
	redirect?: string;
	template?: string;
}

export const Route = createFileRoute("/login")({
	component: Login,
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
		template: typeof search.template === "string" ? search.template : undefined,
	}),
});

export function Login() {
	const googleTitleId = useId();
	const search = useSearch({ from: "/login" });

	const handleGoogleLogin = async () => {
		try {
			// Build callback URL with redirect param if present
			let callbackURL = "/auth/callback";
			const params = new URLSearchParams();

			if (search.redirect) {
				params.set("redirect", search.redirect);
			} else if (search.template) {
				// If coming from template preview, redirect to builder with template
				params.set("redirect", `/builder?template=${search.template}`);
			}

			if (params.toString()) {
				callbackURL += `?${params.toString()}`;
			}

			await authClient.signIn.social({
				provider: "google",
				callbackURL,
			});
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-serif text-stone-900">
						Welcome to DreamMoments
					</h2>
					<p className="mt-2 text-sm text-stone-600">
						Sign in to start planning your perfect day
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<button
						onClick={handleGoogleLogin}
						type="button"
						className="group relative w-full flex justify-center py-3 px-4 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all"
					>
						<span className="absolute left-0 inset-y-0 flex items-center pl-3">
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
								width="24"
								height="24"
								xmlns="http://www.w3.org/2000/svg"
								aria-labelledby={googleTitleId}
							>
								<title id={googleTitleId}>Google Logo</title>
								<g transform="matrix(1, 0, 0, 1, 27.009001, -39.23856)">
									<path
										fill="#4285F4"
										d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
									/>
									<path
										fill="#34A853"
										d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
									/>
									<path
										fill="#FBBC05"
										d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
									/>
									<path
										fill="#EA4335"
										d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
									/>
								</g>
							</svg>
						</span>
						Sign in with Google
					</button>
				</div>
			</div>
		</div>
	);
}

import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSession } from "../lib/auth";
import { syncUserFromNeonAuth } from "../lib/user-sync";

interface CallbackSearch {
	redirect?: string;
	error?: string;
}

export const Route = createFileRoute("/auth/callback")({
	component: AuthCallback,
	validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
		error: typeof search.error === "string" ? search.error : undefined,
	}),
});

export function AuthCallback() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/auth/callback" });
	const [error, setError] = useState<string | null>(
		// Check for OAuth error in query params immediately
		search.error
			? search.error === "access_denied"
				? "Access was denied. Please try signing in again."
				: `Authentication failed: ${search.error}`
			: null,
	);

	useEffect(() => {
		// Skip processing if there's already an error from query params
		if (search.error) {
			return;
		}

		const handleCallback = async () => {
			try {
				// Get the session from Neon Auth (it handles OAuth exchange)
				const result = await getSession();

				if (!result.data?.user) {
					// No session - redirect to login
					navigate({ to: "/login" });
					return;
				}

				const { user } = result.data;

				// Sync user to local database
				await syncUserFromNeonAuth({
					data: {
						neonAuthId: user.id,
						email: user.email,
					},
				});

				// Redirect to intended destination or home
				const redirectTo = search.redirect || "/";
				navigate({ to: redirectTo });
			} catch (err) {
				console.error("Auth callback error:", err);
				setError("Something went wrong during sign in.");
			}
		};

		handleCallback();
	}, [navigate, search.redirect, search.error]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
				<div className="max-w-md w-full text-center space-y-4">
					<div className="text-red-600 text-lg">{error}</div>
					<button
						type="button"
						onClick={() => navigate({ to: "/login" })}
						className="text-stone-600 hover:text-stone-900 underline"
					>
						Return to login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
			<div className="max-w-md w-full text-center space-y-4">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto" />
				<p className="text-stone-600">Completing sign in...</p>
			</div>
		</div>
	);
}

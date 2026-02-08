import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { googleCallbackFn } from "@/api/auth";
import {
	DEFAULT_AUTH_REDIRECT,
	readRedirectFromStateSearch,
	sanitizeRedirect,
} from "../../lib/auth-redirect";
import { createUser, setCurrentUserId } from "../../lib/data";
import { getStore, updateStore } from "../../lib/store";
import type { Store } from "../../lib/types";

export const Route = createFileRoute("/auth/callback")({
	component: CallbackScreen,
});

function CallbackScreen() {
	const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function handleCallback() {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			const stateRedirect = readRedirectFromStateSearch(window.location.search);

			if (!code) {
				// No code present, check for error from Google
				const googleError = params.get("error");
				if (googleError) {
					setError(`Google sign-in was cancelled or failed: ${googleError}`);
					return;
				}
				// No code and no error -- just redirect
				setRedirectTarget(stateRedirect);
				return;
			}

			try {
				const result = await googleCallbackFn({
					data: {
						code,
						redirectTo: stateRedirect,
					},
				});

				if ("error" in result) {
					setError(result.error);
					return;
				}

				// Store the JWT token
				window.localStorage.setItem("dm-auth-token", result.token);

				// Sync user to localStorage store for legacy compatibility
				syncCallbackUser(result.user);

				setRedirectTarget(
					sanitizeRedirect(result.redirectTo) || DEFAULT_AUTH_REDIRECT,
				);
			} catch {
				// Server function unavailable -- fall back to legacy behavior
				createUser({
					email: "google.user@dreammoments.app",
					name: "Google User",
					authProvider: "google",
				});
				setRedirectTarget(stateRedirect);
			}
		}

		handleCallback();
	}, []);

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)] px-6">
				<div className="mx-auto max-w-md space-y-4 text-center">
					<p className="text-xs uppercase tracking-[0.4em] text-[#b91c1c]">
						Sign In Error
					</p>
					<p className="text-sm text-[color:var(--dm-muted)]">{error}</p>
					<a
						href="/auth/login"
						className="inline-block rounded-full border border-[color:var(--dm-border)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
					>
						Back to Sign In
					</a>
				</div>
			</div>
		);
	}

	if (redirectTarget) {
		return <Navigate to={redirectTarget} />;
	}

	// Loading state while we process the callback
	return (
		<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)]">
			<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-muted)]">
				Signing you in...
			</p>
		</div>
	);
}

/**
 * Sync the authenticated user from the Google callback into the
 * localStorage store so legacy dashboard/editor code can find them.
 */
function syncCallbackUser(user: {
	id: string;
	email: string;
	name?: string | null;
	avatarUrl?: string | null;
	authProvider: string;
	plan: string;
	createdAt: string;
	updatedAt: string;
}) {
	if (typeof window === "undefined") return;

	const store = getStore();
	const exists = store.users.some((u) => u.id === user.id);

	if (!exists) {
		updateStore((s: Store) => ({
			...s,
			users: [
				...s.users,
				{
					id: user.id,
					email: user.email,
					name: user.name ?? undefined,
					avatarUrl: user.avatarUrl ?? undefined,
					authProvider: user.authProvider as "google" | "email",
					plan: (user.plan ?? "free") as "free" | "premium",
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			],
		}));
	}

	setCurrentUserId(user.id);
}

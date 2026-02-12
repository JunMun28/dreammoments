import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { googleCallbackFn } from "@/api/auth";
import {
	DEFAULT_AUTH_REDIRECT,
	sanitizeRedirect,
} from "../../lib/auth-redirect";
import { setCurrentUserId } from "../../lib/data";
import { getStore, updateStore } from "../../lib/store";
import type { Store } from "../../lib/types";

export const Route = createFileRoute("/auth/callback")({
	component: CallbackScreen,
});

const CALLBACK_TIMEOUT_MS = 20_000;
const SLOW_THRESHOLD_MS = 10_000;

function mapGoogleError(errorCode: string): string {
	switch (errorCode) {
		case "access_denied":
			return "You cancelled the sign-in request.";
		case "invalid_scope":
			return "Sign-in permissions were not accepted. Please try again.";
		case "server_error":
			return "Google is experiencing issues. Please try again later.";
		default:
			return `Google sign-in failed (${errorCode}). Please try again.`;
	}
}

function CallbackScreen() {
	const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [timedOut, setTimedOut] = useState(false);
	const [slow, setSlow] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const slowTimer = setTimeout(() => {
			if (!cancelled) {
				setSlow(true);
			}
		}, SLOW_THRESHOLD_MS);

		const timer = setTimeout(() => {
			if (!cancelled) {
				setTimedOut(true);
			}
		}, CALLBACK_TIMEOUT_MS);

		async function handleCallback() {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");
			const stateToken = params.get("state");

			if (!code) {
				const googleError = params.get("error");
				if (googleError) {
					if (!cancelled) setError(mapGoogleError(googleError));
					return;
				}
				if (!cancelled) setRedirectTarget(DEFAULT_AUTH_REDIRECT);
				return;
			}

			if (!stateToken) {
				setError("Missing OAuth state. Please try signing in again.");
				return;
			}

			try {
				const result = await googleCallbackFn({
					data: {
						code,
						stateToken,
					},
				});

				if (cancelled) return;

				if ("error" in result) {
					setError(result.error);
					return;
				}

				window.localStorage.setItem("dm-auth-token", result.token);

				syncCallbackUser(result.user);

				setRedirectTarget(
					sanitizeRedirect(result.redirectTo) || DEFAULT_AUTH_REDIRECT,
				);
			} catch {
				if (!cancelled) {
					setError(
						"Unable to complete sign-in. The server may be unavailable. Please try again later.",
					);
				}
			}
		}

		handleCallback();
		return () => {
			cancelled = true;
			clearTimeout(timer);
			clearTimeout(slowTimer);
		};
	}, []);

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)] px-6">
				<div className="mx-auto max-w-md space-y-4 text-center">
					<p className="text-xs uppercase tracking-[0.4em] text-dm-error">
						Sign In Error
					</p>
					<p className="text-sm text-[color:var(--dm-muted)]" role="alert">
						{error}
					</p>
					<Link
						to="/auth/login"
						className="inline-block rounded-full border border-[color:var(--dm-border)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
					>
						Back to Sign In
					</Link>
				</div>
			</div>
		);
	}

	if (redirectTarget) {
		return <Navigate to={redirectTarget} />;
	}

	if (timedOut) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)] px-6">
				<div className="mx-auto max-w-md space-y-4 text-center">
					<p className="text-xs uppercase tracking-[0.4em] text-dm-error">
						Sign In Timeout
					</p>
					<p className="text-sm text-[color:var(--dm-muted)]">
						Sign-in is taking longer than expected. Please try again.
					</p>
					<Link
						to="/auth/login"
						className="inline-block rounded-full border border-[color:var(--dm-border)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
					>
						Try Again
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<svg
					className="h-8 w-8 animate-spin text-[color:var(--dm-accent-strong)]"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
				<p className="text-[color:var(--dm-muted)]">Signing you in...</p>
				{slow && (
					<p className="text-xs text-[color:var(--dm-muted)]">
						Taking longer than expected...
					</p>
				)}
			</div>
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

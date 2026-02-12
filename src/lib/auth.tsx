import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	createGoogleAuthStateFn,
	getSessionFn,
	loginFn,
	logoutFn,
	requestPasswordResetFn,
	signupFn,
} from "@/api/auth";
import { sanitizeRedirect } from "./auth-redirect";
import { createUser, setCurrentUserId } from "./data";
import { getStore, updateStore } from "./store";
import type { User } from "./types";

/** Refresh the access token 10 minutes before the 1-hour expiry */
const TOKEN_REFRESH_INTERVAL_MS = 50 * 60 * 1000;

// ---------------------------------------------------------------------------
// Token storage helpers (client-side only)
// ---------------------------------------------------------------------------

const TOKEN_KEY = "dm-auth-token";

function getStoredToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
	if (typeof window === "undefined") return;
	if (token) {
		window.localStorage.setItem(TOKEN_KEY, token);
	} else {
		window.localStorage.removeItem(TOKEN_KEY);
	}
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<{
	user?: User;
	loading: boolean;
	sessionExpired: boolean;
	signInWithGoogle: (redirectTo?: string) => Promise<void>;
	signUpWithEmail: (payload: {
		email: string;
		password: string;
		name?: string;
	}) => Promise<string | undefined>;
	signInWithEmail: (payload: {
		email: string;
		password: string;
	}) => Promise<string | undefined>;
	resetPassword: (payload: { email: string }) => Promise<string | undefined>;
	refreshUser: () => Promise<void>;
	signOut: () => void;
} | null>(null);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
	| string
	| undefined;
const googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI as
	| string
	| undefined;

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [serverUser, setServerUser] = useState<User | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [useServerAuth, setUseServerAuth] = useState(false);
	const [sessionExpired, setSessionExpired] = useState(false);
	const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Legacy localStorage-based user (fallback when server auth is not available)
	const legacyUserId =
		typeof window !== "undefined"
			? getStore().sessions.currentUserId
			: undefined;
	const legacyUser =
		typeof window !== "undefined"
			? getStore().users.find((item) => item.id === legacyUserId)
			: undefined;

	// The active user is the server-backed user if available, else the legacy one
	const user = useServerAuth ? serverUser : (serverUser ?? legacyUser);

	useEffect(() => {
		let cancelled = false;

		async function restoreSession() {
			const token = getStoredToken();

			try {
				const result = await getSessionFn({
					data: { token: token ?? undefined },
				});
				if (cancelled) return;

				if (result.user) {
					setServerUser(result.user as User);
					setUseServerAuth(true);
					if (result.newToken) setStoredToken(result.newToken);
					syncUserToLocalStore(result.user as User);
				} else {
					setStoredToken(null);
					setSessionExpired(true);
				}
			} catch {
				// Server unavailable, fall back to localStorage
			}

			if (!cancelled) setLoading(false);
		}

		restoreSession();
		return () => {
			cancelled = true;
		};
	}, []);

	// Proactive token refresh: refresh every 50 minutes to stay ahead of 1hr expiry
	useEffect(() => {
		if (!serverUser) {
			if (refreshTimerRef.current) {
				clearInterval(refreshTimerRef.current);
				refreshTimerRef.current = null;
			}
			return;
		}

		refreshTimerRef.current = setInterval(async () => {
			const token = getStoredToken();
			try {
				const result = await getSessionFn({
					data: { token: token ?? undefined },
				});
				if (result.user) {
					setServerUser(result.user as User);
					if (result.newToken) setStoredToken(result.newToken);
					syncUserToLocalStore(result.user as User);
				} else {
					setStoredToken(null);
					setServerUser(undefined);
					setSessionExpired(true);
				}
			} catch {
				// Silently fail - will retry on next interval
			}
		}, TOKEN_REFRESH_INTERVAL_MS);

		return () => {
			if (refreshTimerRef.current) {
				clearInterval(refreshTimerRef.current);
				refreshTimerRef.current = null;
			}
		};
	}, [serverUser]);

	const signInWithGoogle = useCallback(async (redirectTo?: string) => {
		if (googleClientId && googleRedirectUri) {
			const { stateToken } = await createGoogleAuthStateFn({
				data: { redirectTo: sanitizeRedirect(redirectTo) },
			});
			const params = new URLSearchParams({
				client_id: googleClientId,
				redirect_uri: googleRedirectUri,
				response_type: "code",
				scope: "openid email profile",
				prompt: "select_account",
				state: stateToken,
			});
			window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
			return;
		}
		// Fallback for development without Google OAuth configured
		createUser({
			email: "google.user@dreammoments.app",
			name: "Google User",
			authProvider: "google",
		});
	}, []);

	const handleAuthSuccess = useCallback(
		(result: { user: User; token: string; refreshToken?: string }) => {
			setStoredToken(result.token);
			setServerUser(result.user);
			setUseServerAuth(true);
			setSessionExpired(false);
			syncUserToLocalStore(result.user);
		},
		[],
	);

	const signUpWithEmail = useCallback(
		async ({
			email,
			password,
			name,
		}: {
			email: string;
			password: string;
			name?: string;
		}): Promise<string | undefined> => {
			try {
				const result = await signupFn({ data: { email, password, name } });
				if ("error" in result) return result.error;
				handleAuthSuccess(
					result as { user: User; token: string; refreshToken: string },
				);
				return undefined;
			} catch {
				return "Something went wrong. Please try again.";
			}
		},
		[handleAuthSuccess],
	);

	const signInWithEmail = useCallback(
		async ({
			email,
			password,
		}: {
			email: string;
			password: string;
		}): Promise<string | undefined> => {
			try {
				const result = await loginFn({ data: { email, password } });
				if ("error" in result) return result.error;
				handleAuthSuccess(
					result as { user: User; token: string; refreshToken: string },
				);
				return undefined;
			} catch {
				return "Something went wrong. Please try again.";
			}
		},
		[handleAuthSuccess],
	);

	const resetPassword = useCallback(
		async ({ email }: { email: string }): Promise<string | undefined> => {
			try {
				const result = await requestPasswordResetFn({ data: { email } });
				if ("error" in result) return result.error;
				return undefined;
			} catch {
				return "Something went wrong. Please try again.";
			}
		},
		[],
	);

	const refreshUser = useCallback(async () => {
		const token = getStoredToken();
		try {
			const result = await getSessionFn({
				data: { token: token ?? undefined },
			});
			if (result.user) {
				setServerUser(result.user as User);
				setUseServerAuth(true);
				if (result.newToken) setStoredToken(result.newToken);
				syncUserToLocalStore(result.user as User);
			}
		} catch {
			// Silently fail - session will remain as-is
		}
	}, []);

	const signOut = useCallback(() => {
		const token = getStoredToken();

		setStoredToken(null);
		setServerUser(undefined);
		setUseServerAuth(false);
		setSessionExpired(false);
		setCurrentUserId(null);

		logoutFn({ data: { token: token ?? undefined } }).catch(() => {});
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				sessionExpired,
				signInWithGoogle,
				signUpWithEmail,
				signInWithEmail,
				resetPassword,
				refreshUser,
				signOut,
			}}
		>
			{sessionExpired && !user && (
				<div
					role="alert"
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
				>
					<div className="mx-4 w-full max-w-sm rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6 text-center shadow-lg">
						<p className="text-sm font-medium text-[color:var(--dm-ink)]">
							Your session has expired. Please log in again.
						</p>
						<div className="mt-4 flex gap-3 justify-center">
							<button
								type="button"
								onClick={() => setSessionExpired(false)}
								className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
							>
								Dismiss
							</button>
							<a
								href="/auth/login"
								className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
							>
								Log In
							</a>
						</div>
					</div>
				</div>
			)}
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("AuthProvider missing");
	return context;
}

/**
 * Sync a server-authenticated user into the localStorage store
 * so that legacy code (dashboard, editor, etc.) can find the user.
 */
function syncUserToLocalStore(user: {
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
		updateStore((s) => ({
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

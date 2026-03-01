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
	token: string | null;
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
	const [sessionExpired, setSessionExpired] = useState(false);
	const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const user = serverUser;

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
					if (result.newToken) setStoredToken(result.newToken);
				} else {
					setStoredToken(null);
					setSessionExpired(true);
				}
			} catch {
				// Server unavailable
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
		// Dev fallback without Google OAuth configured
		window.location.href = sanitizeRedirect(redirectTo);
	}, []);

	const handleAuthSuccess = useCallback(
		(result: { user: User; token: string; refreshToken?: string }) => {
			setStoredToken(result.token);
			setServerUser(result.user);
			setSessionExpired(false);
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
				if (result.newToken) setStoredToken(result.newToken);
			}
		} catch {
			// Silently fail - session will remain as-is
		}
	}, []);

	const signOut = useCallback(() => {
		const token = getStoredToken();

		setStoredToken(null);
		setServerUser(undefined);
		setSessionExpired(false);

		logoutFn({ data: { token: token ?? undefined } }).catch(() => {});
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				token: getStoredToken(),
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
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("AuthProvider missing");
	return context;
}

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	getSessionFn,
	loginFn,
	logoutFn,
	resetPasswordFn,
	signupFn,
} from "@/api/auth";
import { sanitizeRedirect } from "./auth-redirect";
import { createUser, setCurrentUserId } from "./data";
import { getStore, updateStore } from "./store";
import type { User } from "./types";

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
	signInWithGoogle: (redirectTo?: string) => void;
	signUpWithEmail: (payload: {
		email: string;
		password: string;
		name?: string;
	}) => Promise<string | undefined>;
	signInWithEmail: (payload: {
		email: string;
		password: string;
	}) => Promise<string | undefined>;
	resetPassword: (payload: {
		email: string;
		password: string;
	}) => Promise<string | undefined>;
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

	// On mount, try to restore session from stored JWT
	useEffect(() => {
		let cancelled = false;

		async function restoreSession() {
			const token = getStoredToken();
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const result = await getSessionFn({ data: { token } });
				if (cancelled) return;

				if (result.user) {
					setServerUser(result.user as User);
					setUseServerAuth(true);

					// If the server gave us a refreshed token, store it
					if (result.newToken) {
						setStoredToken(result.newToken);
					}

					// Also sync to localStorage store so legacy code works
					syncUserToLocalStore(result.user as User);
				} else {
					// Token invalid, clear it
					setStoredToken(null);
				}
			} catch {
				// Server function unavailable, fall back to localStorage
			}

			if (!cancelled) {
				setLoading(false);
			}
		}

		restoreSession();
		return () => {
			cancelled = true;
		};
	}, []);

	const signInWithGoogle = useCallback((redirectTo?: string) => {
		if (googleClientId && googleRedirectUri) {
			const params = new URLSearchParams({
				client_id: googleClientId,
				redirect_uri: googleRedirectUri,
				response_type: "code",
				scope: "openid email profile",
				prompt: "select_account",
			});
			if (redirectTo) {
				params.set("state", sanitizeRedirect(redirectTo));
			}
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

				if ("error" in result) {
					return result.error;
				}

				// Store the JWT token
				setStoredToken(result.token);
				setServerUser(result.user as User);
				setUseServerAuth(true);

				// Sync to localStorage store for legacy compatibility
				syncUserToLocalStore(result.user as User);

				return undefined;
			} catch {
				// If server function fails, fall back to localStorage-based auth
				return signUpWithEmailFallback({ email, password, name });
			}
		},
		[],
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

				if ("error" in result) {
					return result.error;
				}

				// Store the JWT token
				setStoredToken(result.token);
				setServerUser(result.user as User);
				setUseServerAuth(true);

				// Sync to localStorage store for legacy compatibility
				syncUserToLocalStore(result.user as User);

				return undefined;
			} catch {
				// If server function fails, fall back to localStorage-based auth
				return signInWithEmailFallback({ email, password });
			}
		},
		[],
	);

	const resetPassword = useCallback(
		async ({
			email,
			password,
		}: {
			email: string;
			password: string;
		}): Promise<string | undefined> => {
			try {
				const result = await resetPasswordFn({ data: { email, password } });

				if ("error" in result) {
					return result.error;
				}

				return undefined;
			} catch {
				// Fallback: validate locally
				if (password.length < 8) {
					return "Password must be at least 8 characters";
				}
				return undefined;
			}
		},
		[],
	);

	const signOut = useCallback(() => {
		// Clear JWT token
		setStoredToken(null);
		setServerUser(undefined);
		setUseServerAuth(false);

		// Also clear legacy localStorage session
		setCurrentUserId(null);

		// Fire-and-forget server logout
		logoutFn().catch(() => {
			// Ignore errors on logout
		});
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				signInWithGoogle,
				signUpWithEmail,
				signInWithEmail,
				resetPassword,
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

// ---------------------------------------------------------------------------
// Legacy fallback helpers (localStorage-based, used when server is unavailable)
// Uses bcryptjs even in fallback mode for proper password hashing.
// ---------------------------------------------------------------------------

async function hashPasswordSecure(value: string): Promise<string> {
	const bcrypt = await import("bcryptjs");
	return bcrypt.default.hash(value, 12);
}

async function verifyPasswordSecure(
	value: string,
	hash: string,
): Promise<boolean> {
	const bcrypt = await import("bcryptjs");
	return bcrypt.default.compare(value, hash);
}

function signUpWithEmailFallback({
	email,
	password,
	name,
}: {
	email: string;
	password: string;
	name?: string;
}): Promise<string | undefined> {
	return (async () => {
		if (password.length < 8) return "Password must be at least 8 characters";
		if (getStore().users.some((u) => u.email === email))
			return "Email already registered";

		const hash = await hashPasswordSecure(password);
		updateStore((store) => ({
			...store,
			passwords: { ...store.passwords, [email]: hash },
		}));
		createUser({ email, name, authProvider: "email" });
		return undefined;
	})();
}

function signInWithEmailFallback({
	email,
	password,
}: {
	email: string;
	password: string;
}): Promise<string | undefined> {
	return (async () => {
		const storedHash = getStore().passwords[email];
		if (!storedHash) return "Account not found";

		const valid = await verifyPasswordSecure(password, storedHash);
		if (!valid) return "Invalid password";

		createUser({ email, authProvider: "email" });
		return undefined;
	})();
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

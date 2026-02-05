import { createContext, useContext } from "react";
import { createUser, setCurrentUserId } from "./data";
import { getStore, updateStore, useStore } from "./store";
import type { User } from "./types";

const AuthContext = createContext<{
	user?: User;
	signInWithGoogle: () => void;
	signUpWithEmail: (payload: {
		email: string;
		password: string;
		name?: string;
	}) => string | undefined;
	signInWithEmail: (payload: {
		email: string;
		password: string;
	}) => string | undefined;
	resetPassword: (payload: {
		email: string;
		password: string;
	}) => string | undefined;
	signOut: () => void;
} | null>(null);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
	| string
	| undefined;
const googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI as
	| string
	| undefined;

const hashPassword = (value: string) => {
	if (typeof btoa !== "undefined") return btoa(value);
	return value.split("").reverse().join("");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const userId = useStore((store) => store.sessions.currentUserId);
	const user = useStore((store) =>
		store.users.find((item) => item.id === userId),
	);

	const signInWithGoogle = () => {
		if (googleClientId && googleRedirectUri) {
			const params = new URLSearchParams({
				client_id: googleClientId,
				redirect_uri: googleRedirectUri,
				response_type: "code",
				scope: "openid email profile",
				prompt: "select_account",
			});
			window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
			return;
		}
		createUser({
			email: "google.user@dreammoments.app",
			name: "Google User",
			authProvider: "google",
		});
	};

	const signUpWithEmail = ({
		email,
		password,
		name,
	}: {
		email: string;
		password: string;
		name?: string;
	}) => {
		if (password.length < 8) return "Password must be at least 8 characters";
		if (getStore().users.some((user) => user.email === email))
			return "Email already registered";
		updateStore((store) => ({
			...store,
			passwords: { ...store.passwords, [email]: hashPassword(password) },
		}));
		createUser({ email, name, authProvider: "email" });
	};

	const signInWithEmail = ({
		email,
		password,
	}: {
		email: string;
		password: string;
	}) => {
		const hash = hashPassword(password);
		const storedHash = getStore().passwords[email];
		if (!storedHash) return "Account not found";
		if (storedHash && storedHash !== hash) return "Invalid password";
		createUser({ email, authProvider: "email" });
	};

	const resetPassword = ({
		email,
		password,
	}: {
		email: string;
		password: string;
	}) => {
		if (password.length < 8) return "Password must be at least 8 characters";
		updateStore((store) => ({
			...store,
			passwords: { ...store.passwords, [email]: hashPassword(password) },
		}));
	};

	const signOut = () => {
		setCurrentUserId(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
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

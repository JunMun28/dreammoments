import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "../lib/auth";

/**
 * Logout button component that handles user sign out.
 *
 * Only renders when user is authenticated.
 * On click, calls signOut to invalidate session, then redirects to home.
 *
 * @example
 * ```tsx
 * <LogoutButton />
 * ```
 */
export function LogoutButton() {
	const session = useSession();
	const navigate = useNavigate();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	// Don't render if not authenticated or still loading
	if (session.isPending || !session.data) {
		return null;
	}

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await signOut();
			navigate({ to: "/" });
		} catch (error) {
			console.error("Logout failed:", error);
			setIsLoggingOut(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={isLoggingOut}
			className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Sign out"
		>
			<LogOut size={18} />
			<span className="hidden sm:inline">Sign out</span>
		</button>
	);
}

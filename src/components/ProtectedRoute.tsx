import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { useSession } from "../lib/auth";

interface ProtectedRouteProps {
	children: ReactNode;
	/** Path to redirect to if not authenticated. Defaults to "/login" */
	redirectTo?: string;
	/** Custom loading component. Defaults to simple loading text */
	loadingFallback?: ReactNode;
}

/**
 * Wrapper component that protects routes requiring authentication.
 *
 * - Shows loading state while checking session
 * - Redirects to login if not authenticated
 * - Renders children if authenticated
 *
 * @example
 * ```tsx
 * // In a route component
 * function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
	children,
	redirectTo = "/login",
	loadingFallback,
}: ProtectedRouteProps) {
	const session = useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!session.isPending && !session.data) {
			navigate({ to: redirectTo, replace: true });
		}
	}, [session.isPending, session.data, navigate, redirectTo]);

	if (session.isPending) {
		return (
			loadingFallback ?? (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-stone-600">Loading...</div>
				</div>
			)
		);
	}

	if (!session.data) {
		// Return null while redirecting
		return null;
	}

	return <>{children}</>;
}

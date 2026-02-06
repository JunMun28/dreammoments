import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
	DEFAULT_AUTH_REDIRECT,
	readRedirectFromStateSearch,
} from "../../lib/auth-redirect";
import { createUser } from "../../lib/data";

export const Route = createFileRoute("/auth/callback")({
	component: CallbackScreen,
});

function CallbackScreen() {
	const redirectTarget =
		typeof window === "undefined"
			? DEFAULT_AUTH_REDIRECT
			: readRedirectFromStateSearch(window.location.search);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		if (code) {
			createUser({
				email: "google.user@dreammoments.app",
				name: "Google User",
				authProvider: "google",
			});
		}
	}, []);

	return <Navigate to={redirectTarget} />;
}

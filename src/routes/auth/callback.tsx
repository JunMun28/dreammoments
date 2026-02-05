import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { createUser } from "../../lib/data";

export const Route = createFileRoute("/auth/callback")({
	component: CallbackScreen,
});

function CallbackScreen() {
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

	return <Navigate to="/dashboard" />;
}

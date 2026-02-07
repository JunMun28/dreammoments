import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createInvitation, createUser, getCurrentUserId } from "../../lib/data";

export const Route = createFileRoute("/editor/new")({
	component: NewEditorRedirect,
});

/** Bypass login for testing: create demo user + invitation when not logged in. */
function ensureDemoUserAndInvitation(): string | null {
	let userId = getCurrentUserId();
	if (!userId) {
		const user = createUser({
			email: "demo@test.local",
			name: "Demo",
			authProvider: "email",
		});
		userId = user.id;
	}
	const params = new URLSearchParams(
		typeof window === "undefined" ? "" : window.location.search,
	);
	const templateId = params.get("template") ?? "blush-romance";
	const invitation = createInvitation(userId, templateId);
	return invitation.id;
}

function NewEditorRedirect() {
	const [invitationId, setInvitationId] = useState<string | null>(null);

	useEffect(() => {
		const id = ensureDemoUserAndInvitation();
		setInvitationId(id);
	}, []);

	if (!invitationId) return null;
	return <Navigate to={`/editor/${invitationId}`} />;
}

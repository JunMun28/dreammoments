import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$invitationId")({
	component: LegacyEditorRedirect,
});

function LegacyEditorRedirect() {
	const { invitationId } = Route.useParams();
	return (
		<Navigate to="/editor/canvas/$invitationId" params={{ invitationId }} />
	);
}

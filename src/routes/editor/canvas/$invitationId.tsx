import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { asCanvasDocument } from "@/lib/canvas/document";
import { migrateInvitationContentToCanvas } from "@/lib/canvas/migrate";
import { getCurrentUser, updateInvitation } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/editor/canvas/$invitationId")({
	component: CanvasEditorRoute,
});

function CanvasEditorRoute() {
	const { invitationId } = Route.useParams();
	const user = getCurrentUser();
	const invitation = useStore((store) =>
		store.invitations.find((item) => item.id === invitationId),
	);
	const existingCanvas = useMemo(
		() => (invitation ? asCanvasDocument(invitation.content) : null),
		[invitation],
	);

	const canvasDocument = useMemo(() => {
		if (!invitation) return null;
		return (
			existingCanvas ??
			migrateInvitationContentToCanvas(
				invitation.content,
				invitation.templateId,
			)
		);
	}, [existingCanvas, invitation]);

	useEffect(() => {
		if (!invitation || !canvasDocument || existingCanvas) return;
		updateInvitation(invitation.id, {
			content: canvasDocument as unknown as never,
		});
	}, [invitation, canvasDocument, existingCanvas]);

	if (!user) return <Navigate to="/auth/login" />;
	if (!invitation || invitation.userId !== user.id) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
				<p className="text-sm text-[color:var(--dm-muted)]">
					Invitation not found.
				</p>
				<Link
					to="/dashboard"
					className="mt-4 inline-flex rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.16em]"
				>
					Back
				</Link>
			</div>
		);
	}
	if (!canvasDocument) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)]">
				<p className="text-xs uppercase tracking-[0.18em] text-[color:var(--dm-muted)]">
					Loading canvas...
				</p>
			</div>
		);
	}

	return (
		<CanvasEditor
			invitationId={invitation.id}
			title={invitation.title || "Canvas invitation"}
			initialDocument={canvasDocument}
			previewSlug={invitation.slug}
		/>
	);
}

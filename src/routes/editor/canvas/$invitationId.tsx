import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { useInvitation } from "@/hooks/useInvitations";
import { useAuth } from "@/lib/auth";
import { asCanvasDocument } from "@/lib/canvas/document";
import { migrateInvitationContentToCanvas } from "@/lib/canvas/migrate";

export const Route = createFileRoute("/editor/canvas/$invitationId")({
	component: CanvasEditorRoute,
});

function CanvasEditorRoute() {
	const { invitationId } = Route.useParams();
	const { user, loading: authLoading } = useAuth();
	const { data: invitation, isLoading } = useInvitation(invitationId);

	const canvasDocument = useMemo(() => {
		if (!invitation) return null;
		return (
			asCanvasDocument(invitation.content) ??
			migrateInvitationContentToCanvas(
				invitation.content,
				invitation.templateId,
			)
		);
	}, [invitation]);

	if (authLoading || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)]">
				<p className="text-xs uppercase tracking-[0.18em] text-[color:var(--dm-muted)]">
					Loading canvas...
				</p>
			</div>
		);
	}

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

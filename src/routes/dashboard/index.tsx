import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Heart, Mail, Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShareModal from "../../components/share/ShareModal";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../lib/auth";
import { deleteInvitation, getAnalytics, listGuests } from "../../lib/data";
import { useStore } from "../../lib/store";
import type { Invitation, InvitationStatus } from "../../lib/types";
import { templates } from "../../templates";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardScreen,
});

const statusLabels: Record<InvitationStatus, string> = {
	draft: "Draft",
	published: "Published",
	archived: "Archived",
};

function ConfirmDeleteDialog({
	title,
	onConfirm,
	onCancel,
}: {
	title: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		cancelRef.current?.focus();
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancel();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onCancel]);

	return (
		<div
			className="dm-inline-edit"
			onPointerDown={(e) => {
				if (e.target === e.currentTarget) onCancel();
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Confirm deletion"
		>
			<div
				ref={dialogRef}
				className="w-full max-w-sm rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6 shadow-lg"
			>
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
					Delete Invitation
				</p>
				<p className="mt-3 text-sm text-[color:var(--dm-ink)]">
					Are you sure you want to delete{" "}
					<span className="font-semibold">{title}</span>? This action cannot be
					undone.
				</p>
				<div className="mt-5 flex gap-3">
					<button
						ref={cancelRef}
						type="button"
						className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
						onClick={onCancel}
					>
						Cancel
					</button>
					<button
						type="button"
						className="flex-1 rounded-full bg-dm-error px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
						onClick={onConfirm}
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}

function DashboardScreen() {
	const { user } = useAuth();
	const { addToast } = useToast();
	const invitations = useStore((store) =>
		store.invitations.filter((item) => item.userId === user?.id),
	);
	const [shareOpen, setShareOpen] = useState(false);
	const [selected, setSelected] = useState<Invitation | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);

	const handleDeleteConfirm = useCallback(() => {
		if (deleteTarget) {
			deleteInvitation(deleteTarget.id);
			addToast({ type: "success", message: "Invitation deleted" });
			setDeleteTarget(null);
		}
	}, [deleteTarget, addToast]);

	const sortedInvitations = useMemo(
		() =>
			[...invitations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
		[invitations],
	);

	if (!user) return <Navigate to="/auth/login" />;

	if (sortedInvitations.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)] px-6 py-10">
				<div className="mx-auto max-w-md text-center">
					<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--dm-peach)]/10">
						<div className="relative">
							<Heart
								className="h-10 w-10 text-[color:var(--dm-peach)]"
								aria-hidden="true"
							/>
							<Sparkles
								className="absolute -right-3 -top-3 h-5 w-5 text-[color:var(--dm-lavender)]"
								aria-hidden="true"
							/>
							<Mail
								className="absolute -bottom-2 -left-3 h-5 w-5 text-[color:var(--dm-sage)]"
								aria-hidden="true"
							/>
						</div>
					</div>
					<p className="mt-6 text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
						Welcome
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
						Create Your First Invitation
					</h1>
					<p className="mt-4 text-sm leading-relaxed text-[color:var(--dm-muted)]">
						Design a beautiful digital wedding invitation in minutes. Choose
						from our curated templates and personalize every detail.
					</p>
					<Link
						to="/editor/new"
						className="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					>
						<Sparkles className="h-4 w-4" aria-hidden="true" />
						Get Started
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
							Dashboard
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-[color:var(--dm-ink)]">
							My Invitations
						</h1>
						<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
							Manage drafts, RSVPs, and sharing.
						</p>
					</div>
					<Link
						to="/editor/new"
						className="rounded-full bg-[color:var(--dm-accent-strong)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					>
						New Invitation
					</Link>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{sortedInvitations.map((invitation) => {
						const templateName =
							templates.find(
								(template) => template.id === invitation.templateId,
							)?.name ?? invitation.templateId;
						const guests = listGuests(invitation.id);
						const analytics = getAnalytics(invitation.id);

						return (
							<div
								key={invitation.id}
								className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6"
							>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div>
										<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
											{templateName}
										</p>
										<h2 className="mt-2 text-xl font-semibold text-[color:var(--dm-ink)] break-words">
											{invitation.title}
										</h2>
										<p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
											{statusLabels[invitation.status]}
										</p>
									</div>
									<div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
										<Link
											to="/editor/$invitationId"
											params={{ invitationId: invitation.id }}
											className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
										>
											Edit
										</Link>
										<Link
											to="/invite/$slug"
											params={{ slug: invitation.slug }}
											className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
										>
											Preview
										</Link>
										<button
											type="button"
											className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
											onClick={() => {
												setSelected(invitation);
												setShareOpen(true);
											}}
										>
											Share
										</button>
										<button
											type="button"
											className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
											onClick={() => setDeleteTarget(invitation)}
										>
											Delete
										</button>
									</div>
								</div>
								<div className="mt-4 grid gap-3 sm:grid-cols-3">
									<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
											Views
										</p>
										{analytics.totalViews > 0 ? (
											<p className="mt-2 text-lg font-semibold tabular-nums text-[color:var(--dm-ink)]">
												{analytics.totalViews}
											</p>
										) : (
											<p className="mt-2 text-xs leading-relaxed text-[color:var(--dm-muted)]">
												Your invitation hasn't been viewed yet
											</p>
										)}
									</div>
									<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
											RSVPs
										</p>
										{guests.length > 0 ? (
											<p className="mt-2 text-lg font-semibold tabular-nums text-[color:var(--dm-ink)]">
												{guests.length}
											</p>
										) : (
											<div className="mt-2 flex items-center gap-1.5">
												<Send
													className="h-3 w-3 text-[color:var(--dm-muted)]"
													aria-hidden="true"
												/>
												<p className="text-xs leading-relaxed text-[color:var(--dm-muted)]">
													Share to collect RSVPs
												</p>
											</div>
										)}
									</div>
									<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
											Updated
										</p>
										<p className="mt-2 text-xs text-[color:var(--dm-muted)]">
											{new Date(invitation.updatedAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<ShareModal
				open={shareOpen}
				invitation={selected}
				onClose={() => setShareOpen(false)}
			/>

			{deleteTarget && (
				<ConfirmDeleteDialog
					title={deleteTarget.title}
					onConfirm={handleDeleteConfirm}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
}

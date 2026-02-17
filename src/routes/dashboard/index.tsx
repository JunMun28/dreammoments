import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import {
	Copy,
	Eye,
	Heart,
	Mail,
	Monitor,
	Send,
	Share2,
	Smartphone,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShareModal from "../../components/share/ShareModal";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { RouteErrorFallback } from "../../components/ui/RouteErrorFallback";
import { RouteLoadingSpinner } from "../../components/ui/RouteLoadingSpinner";
import { useToast } from "../../components/ui/Toast";
import {
	useDeleteInvitation,
	useInvitations,
} from "../../hooks/useInvitations";
import { useAuth } from "../../lib/auth";
import { summarizeInvitationContent } from "../../lib/canvas/document";
import {
	createInvitation,
	getAnalytics,
	listGuests,
	updateInvitation,
} from "../../lib/data";
import { useStore } from "../../lib/store";
import type { Invitation, InvitationStatus } from "../../lib/types";
import { cn } from "../../lib/utils";
import { templates } from "../../templates";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardScreen,
	pendingComponent: RouteLoadingSpinner,
	errorComponent: RouteErrorFallback,
});

const statusLabels: Record<InvitationStatus, string> = {
	draft: "Draft",
	published: "Published",
	archived: "Archived",
};

type PreviewViewport = "phone" | "desktop";

function getStatusClass(status: InvitationStatus) {
	if (status === "published") return "bg-dm-success/10 text-dm-success";
	if (status === "archived")
		return "bg-[color:var(--dm-border)] text-[color:var(--dm-muted)]";
	return "bg-[color:var(--dm-peach)]/10 text-[color:var(--dm-peach)]";
}

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
	const { user, loading } = useAuth();
	const { addToast } = useToast();
	const navigate = useNavigate();
	const { data: serverInvitations } = useInvitations();
	const localInvitations = useStore((store) =>
		store.invitations.filter((item) => item.userId === user?.id),
	);
	const invitations = serverInvitations ?? localInvitations;
	const deleteMutation = useDeleteInvitation();
	const [shareOpen, setShareOpen] = useState(false);
	const [selected, setSelected] = useState<Invitation | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "draft" | "published" | "archived"
	>("all");
	const [page, setPage] = useState(1);
	const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
	const [previewInvitationId, setPreviewInvitationId] = useState<string | null>(
		null,
	);
	const [previewViewport, setPreviewViewport] =
		useState<PreviewViewport>("phone");
	const perPage = 6;

	const handleDeleteConfirm = useCallback(async () => {
		if (!deleteTarget) return;
		try {
			await deleteMutation.mutateAsync(deleteTarget.id);
			addToast({ type: "success", message: "Invitation deleted" });
		} catch {
			addToast({
				type: "error",
				message: "Failed to delete invitation. Please try again.",
			});
		} finally {
			setDeleteTarget(null);
		}
	}, [deleteTarget, addToast, deleteMutation]);

	const handleDuplicate = useCallback(
		async (invitation: Invitation) => {
			setDuplicatingId(invitation.id);
			try {
				const newInv = createInvitation(
					invitation.userId,
					invitation.templateId,
				);
				updateInvitation(newInv.id, {
					title: `${invitation.title} (Copy)`,
					content: invitation.content,
					sectionVisibility: invitation.sectionVisibility,
					designOverrides: invitation.designOverrides,
				});
				addToast({
					type: "success",
					message: "Invitation duplicated — opening editor",
				});
				await navigate({
					to: "/editor/canvas/$invitationId",
					params: { invitationId: newInv.id },
				});
			} finally {
				setDuplicatingId(null);
			}
		},
		[addToast, navigate],
	);

	const filteredInvitations = useMemo(() => {
		return invitations.filter((inv) => {
			const matchesSearch = inv.title
				?.toLowerCase()
				.includes(search.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || inv.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [invitations, search, statusFilter]);

	const sortedInvitations = useMemo(
		() =>
			[...filteredInvitations].sort((a, b) =>
				b.updatedAt.localeCompare(a.updatedAt),
			),
		[filteredInvitations],
	);

	const totalPages = Math.max(1, Math.ceil(sortedInvitations.length / perPage));
	const paginatedInvitations = sortedInvitations.slice(
		(page - 1) * perPage,
		page * perPage,
	);

	// Reset to page 1 when filters change
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-run when search/statusFilter change
	useEffect(() => {
		setPage(1);
	}, [search, statusFilter]);

	useEffect(() => {
		setPage((current) => Math.min(current, totalPages));
	}, [totalPages]);

	useEffect(() => {
		if (sortedInvitations.length === 0) {
			setPreviewInvitationId(null);
			return;
		}
		const exists = sortedInvitations.some(
			(invitation) => invitation.id === previewInvitationId,
		);
		if (!exists) {
			setPreviewInvitationId(sortedInvitations[0].id);
		}
	}, [sortedInvitations, previewInvitationId]);

	useEffect(() => {
		if (paginatedInvitations.length === 0) return;
		const existsOnPage = paginatedInvitations.some(
			(invitation) => invitation.id === previewInvitationId,
		);
		if (!existsOnPage) {
			setPreviewInvitationId(paginatedInvitations[0].id);
		}
	}, [paginatedInvitations, previewInvitationId]);

	const activeInvitation = useMemo(() => {
		if (!previewInvitationId) return null;
		return (
			sortedInvitations.find(
				(invitation) => invitation.id === previewInvitationId,
			) ?? null
		);
	}, [sortedInvitations, previewInvitationId]);

	if (!user && !loading) return <Navigate to="/auth/login" />;

	if (loading) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
				<div className="mx-auto max-w-[1220px] space-y-8">
					<div>
						<div className="mb-2 h-4 w-20 animate-pulse rounded bg-[color:var(--dm-border)]" />
						<div className="mb-2 h-8 w-48 animate-pulse rounded bg-[color:var(--dm-border)]" />
						<div className="h-4 w-64 animate-pulse rounded bg-[color:var(--dm-border)]" />
					</div>
					<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="animate-pulse rounded-3xl border border-[color:var(--dm-border)] p-6"
								>
									<div className="mb-3 h-4 w-24 rounded bg-[color:var(--dm-border)]" />
									<div className="mb-3 h-8 w-2/3 rounded bg-[color:var(--dm-border)]" />
									<div className="h-24 rounded-2xl bg-[color:var(--dm-border)]" />
								</div>
							))}
						</div>
						<div className="animate-pulse rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
							<div className="mb-4 h-5 w-28 rounded bg-[color:var(--dm-border)]" />
							<div className="h-[520px] rounded-3xl bg-[color:var(--dm-border)]" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) return <Navigate to="/auth/login" />;

	if (invitations.length === 0) {
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
						Design a stunning Chinese wedding invitation in minutes. Choose from
						templates crafted for Malaysian and Singaporean couples, with
						bilingual support, double happiness motifs, and hongbao-inspired
						themes.
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
		<div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(255,240,245,0.85),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(240,249,255,0.8),transparent_35%),var(--dm-bg)] px-4 py-8 sm:px-6 sm:py-10">
			<div className="mx-auto max-w-[1220px] space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
							Dashboard
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-[color:var(--dm-ink)]">
							My Invitations
						</h1>
						<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
							Manage drafts, track RSVPs, and preview your card before sharing.
						</p>
					</div>
					<Link
						to="/editor/new"
						className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--dm-accent-strong)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					>
						New Invitation
					</Link>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<div className="rounded-full border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						{sortedInvitations.length} invitations
					</div>
					<div className="rounded-full border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						Page {page} / {totalPages}
					</div>
				</div>

				<div className="flex flex-col gap-3 rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4 sm:flex-row sm:items-center">
					<input
						placeholder="Search invitations..."
						aria-label="Search invitations"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="h-11 min-w-0 flex-1 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-sm text-[color:var(--dm-ink)]"
						autoComplete="off"
						type="search"
					/>
					<div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
						{(["all", "draft", "published", "archived"] as const).map(
							(status) => (
								<button
									key={status}
									type="button"
									onClick={() => setStatusFilter(status)}
									className={`min-h-11 rounded-full px-3 py-2 ${
										statusFilter === status
											? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
											: "border border-[color:var(--dm-border)] text-[color:var(--dm-ink)]"
									}`}
								>
									{status === "all" ? "All" : statusLabels[status]}
								</button>
							),
						)}
					</div>
				</div>

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
					<div className="space-y-4">
						{paginatedInvitations.length === 0 &&
							(search || statusFilter !== "all") && (
								<div className="flex flex-col items-center justify-center rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-6 py-16 text-center">
									<p className="text-sm text-[color:var(--dm-muted)]">
										No invitations match your search or filter.
									</p>
									<button
										type="button"
										className="mt-4 min-h-11 rounded-full border border-[color:var(--dm-border)] px-5 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
										onClick={() => {
											setSearch("");
											setStatusFilter("all");
										}}
									>
										Clear Filters
									</button>
								</div>
							)}
						{paginatedInvitations.map((invitation) => {
							const summary = summarizeInvitationContent(invitation.content);
							const templateName =
								templates.find(
									(template) => template.id === invitation.templateId,
								)?.name ?? invitation.templateId;
							const guests = listGuests(invitation.id);
							const analytics = getAnalytics(invitation.id);
							const isActive = invitation.id === activeInvitation?.id;

							return (
								<article
									key={invitation.id}
									className={cn(
										"rounded-3xl border bg-[color:var(--dm-surface)] p-5 shadow-sm",
										isActive
											? "border-[color:var(--dm-accent-strong)] ring-2 ring-[color:var(--dm-accent-strong)]/10"
											: "border-[color:var(--dm-border)]",
									)}
								>
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div className="min-w-0 flex-1">
											<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
												{templateName}
											</p>
											<h2 className="mt-2 break-words text-xl font-semibold text-[color:var(--dm-ink)]">
												{invitation.title}
											</h2>
											<span
												className={cn(
													"mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs uppercase tracking-[0.2em]",
													getStatusClass(invitation.status),
												)}
											>
												{statusLabels[invitation.status]}
											</span>
										</div>
										<button
											type="button"
											className={cn(
												"inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em]",
												isActive
													? "border-[color:var(--dm-accent-strong)] text-[color:var(--dm-accent-strong)]"
													: "border-[color:var(--dm-border)] text-[color:var(--dm-ink)]",
											)}
											onClick={() => setPreviewInvitationId(invitation.id)}
										>
											<Eye className="h-3.5 w-3.5" aria-hidden="true" />
											Preview
										</button>
									</div>

									<div className="mt-4 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-4">
										<p className="text-sm font-medium text-[color:var(--dm-ink)]">
											{summary.title}
										</p>
										<p className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
											{summary.date || "Date not set"}
										</p>
										<p className="mt-2 max-h-8 overflow-hidden text-xs text-[color:var(--dm-muted)]">
											{summary.tagline || "No tagline"}
										</p>
									</div>

									<div className="mt-4 grid gap-2 sm:grid-cols-2">
										<Link
											to="/editor/canvas/$invitationId"
											params={{ invitationId: invitation.id }}
											className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
										>
											Edit
										</Link>
										<button
											type="button"
											className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
											onClick={() => {
												setSelected(invitation);
												setShareOpen(true);
											}}
										>
											<Share2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
											Share
										</button>
										<Link
											to="/invite/$slug"
											params={{ slug: invitation.slug }}
											className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
										>
											Open Live
										</Link>
										<button
											type="button"
											className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
											onClick={() => handleDuplicate(invitation)}
											disabled={duplicatingId === invitation.id}
										>
											<Copy className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
											{duplicatingId === invitation.id
												? "Duplicating..."
												: "Duplicate"}
										</button>
									</div>

									<div className="mt-4 grid gap-3 sm:grid-cols-3">
										<div className="rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4">
											<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
												Views
											</p>
											<p className="mt-2 text-lg font-semibold tabular-nums text-[color:var(--dm-ink)]">
												{analytics.totalViews}
											</p>
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
													<p className="text-xs text-[color:var(--dm-muted)]">
														No RSVPs yet
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

									<button
										type="button"
										className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-dm-error/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-dm-error hover:bg-dm-error/5"
										onClick={() => setDeleteTarget(invitation)}
										disabled={deleteMutation.isPending}
									>
										<Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
										{deleteMutation.isPending &&
										deleteTarget?.id === invitation.id
											? "Deleting..."
											: "Delete"}
									</button>
								</article>
							);
						})}
					</div>

					<aside className="xl:sticky xl:top-6 xl:h-fit">
						<div className="overflow-hidden rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] shadow-[0_20px_70px_-35px_rgba(0,0,0,0.45)]">
							{activeInvitation ? (
								<>
									<div className="border-b border-[color:var(--dm-border)] p-5">
										<p className="text-xs uppercase tracking-[0.35em] text-[color:var(--dm-accent-strong)]">
											Live Preview
										</p>
										<h3 className="mt-2 break-words text-xl font-semibold text-[color:var(--dm-ink)]">
											{activeInvitation.title}
										</h3>
										<div className="mt-3 flex flex-wrap items-center gap-2">
											<span
												className={cn(
													"rounded-full px-2.5 py-0.5 text-xs uppercase tracking-[0.2em]",
													getStatusClass(activeInvitation.status),
												)}
											>
												{statusLabels[activeInvitation.status]}
											</span>
											<span className="rounded-full border border-[color:var(--dm-border)] px-2.5 py-0.5 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
												{
													templates.find(
														(template) =>
															template.id === activeInvitation.templateId,
													)?.name
												}
											</span>
										</div>
										<div className="mt-4 grid grid-cols-2 gap-2">
											<button
												type="button"
												className={cn(
													"inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-3 text-xs uppercase tracking-[0.2em]",
													previewViewport === "phone"
														? "border-[color:var(--dm-accent-strong)] text-[color:var(--dm-accent-strong)]"
														: "border-[color:var(--dm-border)] text-[color:var(--dm-ink)]",
												)}
												onClick={() => setPreviewViewport("phone")}
												aria-pressed={previewViewport === "phone"}
											>
												<Smartphone
													className="h-3.5 w-3.5"
													aria-hidden="true"
												/>
												Phone
											</button>
											<button
												type="button"
												className={cn(
													"inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-3 text-xs uppercase tracking-[0.2em]",
													previewViewport === "desktop"
														? "border-[color:var(--dm-accent-strong)] text-[color:var(--dm-accent-strong)]"
														: "border-[color:var(--dm-border)] text-[color:var(--dm-ink)]",
												)}
												onClick={() => setPreviewViewport("desktop")}
												aria-pressed={previewViewport === "desktop"}
											>
												<Monitor className="h-3.5 w-3.5" aria-hidden="true" />
												Desktop
											</button>
										</div>
									</div>
									<div className="bg-[linear-gradient(135deg,rgba(255,241,246,0.6),rgba(241,245,249,0.7))] p-4 sm:p-5">
										<div
											className={cn(
												"mx-auto overflow-hidden rounded-[26px] border border-white/80 bg-[color:var(--dm-surface)] shadow-2xl",
												previewViewport === "phone"
													? "max-w-[340px]"
													: "max-w-full",
											)}
											style={
												(activeInvitation.designOverrides ?? {}) as Record<
													string,
													string
												>
											}
										>
											<div
												className={cn(
													"pointer-events-none overflow-hidden",
													previewViewport === "phone"
														? "h-[560px]"
														: "h-[520px]",
												)}
											>
												<InvitationRenderer
													templateId={activeInvitation.templateId}
													content={activeInvitation.content}
													hiddenSections={activeInvitation.sectionVisibility}
													mode="preview"
												/>
											</div>
										</div>
									</div>
								</>
							) : (
								<div className="flex min-h-[620px] flex-col items-center justify-center px-6 text-center">
									<p className="text-sm text-[color:var(--dm-muted)]">
										No invitation to preview.
									</p>
									<p className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
										Clear filters or create a new invitation.
									</p>
								</div>
							)}
						</div>
					</aside>
				</div>

				{totalPages > 1 && (
					<div className="mt-2 flex items-center justify-center gap-2">
						<button
							type="button"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="min-h-11 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)] disabled:opacity-40"
						>
							Previous
						</button>
						<span className="text-sm text-[color:var(--dm-muted)]">
							Page {page} of {totalPages}
						</span>
						<button
							type="button"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
							className="min-h-11 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)] disabled:opacity-40"
						>
							Next
						</button>
					</div>
				)}

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
		</div>
	);
}

import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { RouteLoadingSpinner } from "../../components/ui/RouteLoadingSpinner";
import { buildSampleContent } from "../../data/sample-invitation";
import { useAuth } from "../../lib/auth";
import { createInvitation } from "../../lib/data";
import { templates } from "../../templates";
import type { TemplateConfig } from "../../templates/types";

export const Route = createFileRoute("/editor/new")({
	component: TemplateSelectionPage,
	pendingComponent: RouteLoadingSpinner,
});

/** Map template category to a human-readable label */
const categoryLabels: Record<string, string> = {
	chinese: "Chinese",
	garden: "Garden",
	western: "Western",
};

/** Map template id to preview image path */
const templatePreviewImages: Record<string, string> = {};

function TemplateCard({
	template,
	onClick,
}: {
	template: TemplateConfig;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="group cursor-pointer text-left transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dm-primary)]"
			aria-label={`Preview ${template.name} template`}
		>
			{/* Preview image */}
			<div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[color:var(--dm-border)]">
				{templatePreviewImages[template.id] ? (
					<img
						src={templatePreviewImages[template.id]}
						alt={`${template.name} template preview`}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div
						className="h-full w-full"
						style={{
							background: `linear-gradient(135deg, ${template.tokens.colors.background} 0%, ${template.tokens.colors.primary} 100%)`,
						}}
					/>
				)}
			</div>

			{/* Template name + category */}
			<div className="mt-3 px-0.5">
				<h2 className="text-sm font-semibold text-[color:var(--dm-ink)]">
					{template.name}
				</h2>
				<p className="mt-0.5 text-xs text-[color:var(--dm-muted)]">
					{categoryLabels[template.category] ?? template.category}
				</p>
			</div>
		</button>
	);
}

function TemplatePreviewModal({
	templateId,
	onClose,
	onSelect,
	isCreating,
}: {
	templateId: string;
	onClose: () => void;
	onSelect: (templateId: string) => void;
	isCreating: boolean;
}) {
	const content = buildSampleContent(templateId);
	const template = templates.find((t) => t.id === templateId);
	const sectionVisibility = template
		? Object.fromEntries(
				template.sections.map((s) => [s.id, !s.defaultVisible]),
			)
		: {};

	return (
		<div
			className="fixed inset-0 z-[var(--dm-z-modal)] flex flex-col bg-black/50 backdrop-blur-sm"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="dialog"
			aria-modal="true"
			aria-label={`Preview ${template?.name ?? "template"}`}
		>
			<div className="flex items-center justify-between border-b border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] px-6 py-3">
				<span className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
					Preview &mdash; {template?.name}
				</span>
				<div className="flex items-center gap-3">
					<button
						type="button"
						disabled={isCreating}
						onClick={(e) => {
							e.stopPropagation();
							onSelect(templateId);
						}}
						className="rounded-full bg-[color:var(--dm-accent-strong)] px-5 py-2 text-xs uppercase tracking-[0.15em] text-[color:var(--dm-on-accent)] transition-opacity disabled:opacity-50"
					>
						{isCreating ? "Creating..." : "Use This Template"}
					</button>
					<button
						type="button"
						onClick={onClose}
						className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--dm-muted)] transition-colors hover:bg-[color:var(--dm-border)] hover:text-[color:var(--dm-ink)]"
						aria-label="Close preview"
					>
						<X size={16} />
					</button>
				</div>
			</div>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation for modal content */}
			<div
				className="flex-1 overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={() => {}}
			>
				<InvitationRenderer
					templateId={templateId}
					content={content}
					hiddenSections={sectionVisibility}
				/>
			</div>
		</div>
	);
}

function TemplateSelectionPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [creatingId, setCreatingId] = useState<string | null>(null);
	const [previewId, setPreviewId] = useState<string | null>(null);

	const handlePreview = useCallback((templateId: string) => {
		setPreviewId(templateId);
	}, []);

	if (loading) return <RouteLoadingSpinner />;
	if (!user) return <Navigate to="/auth/login" />;

	const handleSelect = (templateId: string) => {
		if (creatingId) return;
		setCreatingId(templateId);

		try {
			const invitation = createInvitation(user.id, templateId);
			navigate({
				to: "/editor/canvas/$invitationId",
				params: { invitationId: invitation.id },
			});
		} catch {
			setCreatingId(null);
		}
	};

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-8">
				{/* Header */}
				<div className="text-center">
					<Link
						to="/dashboard"
						className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)] transition-colors hover:text-[color:var(--dm-ink)]"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M19 12H5" />
							<path d="m12 19-7-7 7-7" />
						</svg>
						Back to Dashboard
					</Link>
					<h1 className="mt-4 font-heading text-3xl font-semibold text-[color:var(--dm-ink)] sm:text-4xl">
						Choose Your Template
					</h1>
					<p className="mt-3 text-sm text-[color:var(--dm-muted)]">
						Pick a design that matches your ceremony mood. You can customise
						every detail after.
					</p>
				</div>

				{/* Template grid: 4 columns on desktop, 2 on mobile */}
				<div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
					{templates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							onClick={() => handlePreview(template.id)}
						/>
					))}
				</div>
			</div>

			{previewId && (
				<TemplatePreviewModal
					templateId={previewId}
					onClose={() => setPreviewId(null)}
					onSelect={handleSelect}
					isCreating={creatingId === previewId}
				/>
			)}
		</div>
	);
}

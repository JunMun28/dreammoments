import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../lib/auth";
import { createInvitation } from "../../lib/data";
import { templates } from "../../templates";
import type { TemplateConfig } from "../../templates/types";

export const Route = createFileRoute("/editor/new")({
	component: TemplateSelectionPage,
});

/** Map template category to a human-readable label */
const categoryLabels: Record<string, string> = {
	chinese: "Chinese",
	garden: "Garden",
	western: "Western",
};

function TemplateColorPreview({
	tokens,
}: {
	tokens: TemplateConfig["tokens"];
}) {
	const colors = [
		tokens.colors.primary,
		tokens.colors.secondary,
		tokens.colors.accent,
		tokens.colors.background,
	];
	return (
		<div className="flex gap-1.5" aria-hidden="true">
			{colors.map((color) => (
				<div
					key={color}
					className="h-5 w-5 rounded-full border border-[color:var(--dm-border)]"
					style={{ background: color }}
				/>
			))}
		</div>
	);
}

function TemplateCard({
	template,
	onSelect,
	isCreating,
}: {
	template: TemplateConfig;
	onSelect: (templateId: string) => void;
	isCreating: boolean;
}) {
	return (
		<div className="group rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6 transition-shadow duration-300 hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.07)]">
			{/* Color preview strip */}
			<div
				className="mb-5 flex h-32 items-end rounded-2xl p-4"
				style={{
					background: `linear-gradient(135deg, ${template.tokens.colors.background} 0%, ${template.tokens.colors.primary} 100%)`,
				}}
			>
				<div
					className="rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
					style={{
						background: template.tokens.colors.accent,
						color: template.tokens.colors.text,
					}}
				>
					{template.nameZh}
				</div>
			</div>

			{/* Template info */}
			<div className="mb-4 flex items-start justify-between gap-3">
				<div>
					<h2 className="font-heading text-xl font-semibold text-[color:var(--dm-ink)]">
						{template.name}
					</h2>
					<p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						{categoryLabels[template.category] ?? template.category}
					</p>
				</div>
				<TemplateColorPreview tokens={template.tokens} />
			</div>

			<p className="mb-5 text-sm leading-relaxed text-[color:var(--dm-muted)]">
				{template.description}
			</p>

			{/* Section count + tone */}
			<div className="mb-5 flex flex-wrap gap-2">
				<span className="inline-flex items-center rounded-full border border-[color:var(--dm-border)] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
					{template.sections.length} sections
				</span>
				<span className="inline-flex items-center rounded-full border border-[color:var(--dm-border)] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[color:var(--dm-muted)]">
					{template.aiConfig.defaultTone} tone
				</span>
			</div>

			<button
				type="button"
				disabled={isCreating}
				onClick={() => onSelect(template.id)}
				className="w-full rounded-full bg-[color:var(--dm-accent-strong)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] transition-opacity disabled:opacity-50"
			>
				{isCreating ? (
					<span className="inline-flex items-center gap-2">
						<svg
							className="h-4 w-4 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="3"
								strokeDasharray="31.4 31.4"
								strokeLinecap="round"
							/>
						</svg>
						Creating...
					</span>
				) : (
					"Use This Template"
				)}
			</button>
		</div>
	);
}

function TemplateSelectionPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [creatingId, setCreatingId] = useState<string | null>(null);

	if (!user) return <Navigate to="/auth/login" />;

	const handleSelect = (templateId: string) => {
		if (creatingId) return;
		setCreatingId(templateId);

		try {
			const invitation = createInvitation(user.id, templateId);
			navigate({
				to: "/editor/$invitationId",
				params: { invitationId: invitation.id },
			});
		} catch {
			setCreatingId(null);
		}
	};

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
			<div className="mx-auto max-w-5xl space-y-8">
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

				{/* Template grid: 2 columns on desktop, 1 on mobile */}
				<div className="grid gap-6 sm:grid-cols-2">
					{templates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							onSelect={handleSelect}
							isCreating={creatingId === template.id}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

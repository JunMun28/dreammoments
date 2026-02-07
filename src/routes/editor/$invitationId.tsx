import {
	createFileRoute,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { EditorLayout } from "../../components/editor/EditorLayout";
import { EditorPreviewFrame } from "../../components/editor/EditorPreviewFrame";
import { EditorToolbar } from "../../components/editor/EditorToolbar";
import { FieldRenderer } from "../../components/editor/FieldRenderer";
import MobileBottomSheet from "../../components/editor/MobileBottomSheet";
import { SectionPillBar } from "../../components/editor/SectionPillBar";
import { ToggleSwitch } from "../../components/editor/ToggleSwitch";
import { useAutoSave } from "../../components/editor/hooks/useAutoSave";
import {
	getValueByPath,
	setValueByPath,
	useEditorState,
} from "../../components/editor/hooks/useEditorState";
import { useMediaQuery } from "../../components/editor/hooks/useMediaQuery";
import { usePreviewScroll } from "../../components/editor/hooks/usePreviewScroll";
import { useSectionProgress } from "../../components/editor/hooks/useSectionProgress";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import {
	FullPageLoader,
	LoadingSpinner,
} from "../../components/ui/LoadingSpinner";
import { buildSampleContent } from "../../data/sample-invitation";
import { generateAiContent } from "../../lib/ai";
import {
	aiUsageLimit,
	getCurrentUser,
	incrementAiUsage,
	markAiGenerationAccepted,
	publishInvitation,
	recordAiGeneration,
	updateInvitation,
} from "../../lib/data";
import { uploadImage } from "../../lib/storage";
import { useStore } from "../../lib/store";
import type { InvitationContent } from "../../lib/types";
import { templates } from "../../templates";
import type { SectionConfig, TemplateConfig } from "../../templates/types";

export const Route = createFileRoute("/editor/$invitationId")({
	component: EditorScreen,
});

type InlineEditState = {
	fieldPath: string;
	value: string;
};

type AiPanelState = {
	open: boolean;
	sectionId: string;
	prompt: string;
	type: "schedule" | "faq" | "story" | "tagline" | "style" | "translate";
	result?: Record<string, unknown>;
	generationId?: string;
	error?: string;
};

const lightTemplates = new Set([
	"garden-romance",
	"eternal-elegance",
	"blush-romance",
]);

function getListItems(
	sectionId: string,
	draft: InvitationContent,
): Array<Record<string, unknown>> {
	const section = (draft as unknown as Record<string, unknown>)[sectionId];
	if (!section || typeof section !== "object") return [];
	const sectionObj = section as Record<string, unknown>;
	const items =
		sectionId === "story"
			? sectionObj.milestones
			: sectionId === "schedule"
				? sectionObj.events
				: sectionId === "faq"
					? sectionObj.items
					: sectionId === "gallery"
						? sectionObj.photos
						: sectionObj.members;
	return (Array.isArray(items) ? items : []) as Array<
		Record<string, unknown>
	>;
}

function updateListItems(
	draft: InvitationContent,
	sectionId: string,
	nextItems: Array<Record<string, unknown>>,
): InvitationContent {
	const next = structuredClone(draft);
	if (sectionId === "story")
		next.story.milestones = nextItems as typeof next.story.milestones;
	if (sectionId === "schedule")
		next.schedule.events = nextItems as typeof next.schedule.events;
	if (sectionId === "faq")
		next.faq.items = nextItems as typeof next.faq.items;
	if (sectionId === "gallery")
		next.gallery.photos = nextItems as typeof next.gallery.photos;
	if (sectionId === "entourage")
		next.entourage.members = nextItems as typeof next.entourage.members;
	return next;
}

export function EditorScreen() {
	const { invitationId } = Route.useParams();
	const navigate = useNavigate();
	const rawId = useId();
	const inlineEditTitleId = `inline-edit-title-${rawId.replaceAll(":", "")}`;
	const aiPanelTitleId = `ai-panel-title-${rawId.replaceAll(":", "")}`;
	const upgradeTitleId = `upgrade-title-${rawId.replaceAll(":", "")}`;

	const invitation = useStore((store) =>
		store.invitations.find((item) => item.id === invitationId),
	);
	const user = getCurrentUser();

	const isMobile = useMediaQuery("(max-width: 767px)");
	const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

	const template = useMemo<TemplateConfig | undefined>(
		() => templates.find((item) => item.id === invitation?.templateId),
		[invitation?.templateId],
	);
	const isLightTemplate = lightTemplates.has(template?.id ?? "blush-romance");
	const initialContent = useMemo(
		() => invitation?.content ?? buildSampleContent("blush-romance"),
		[invitation?.content],
	);

	// Core editor state (draft, undo/redo, field changes)
	const editor = useEditorState({
		initialContent,
		initialVisibility: invitation?.sectionVisibility ?? {},
		initialSection: template?.sections[0]?.id ?? "hero",
	});

	// Refs for auto-save
	const previewRef = useRef<HTMLDivElement | null>(null);
	const draftRef = useRef(editor.draft);
	const visibilityRef = useRef(editor.sectionVisibility);
	useEffect(() => {
		draftRef.current = editor.draft;
	}, [editor.draft]);
	useEffect(() => {
		visibilityRef.current = editor.sectionVisibility;
	}, [editor.sectionVisibility]);

	// Auto-save
	const { autosaveAt, saveStatus } = useAutoSave({
		invitationId: invitation?.id ?? "",
		draftRef,
		visibilityRef,
	});

	// Section progress
	const sectionProgress = useSectionProgress({
		sections: template?.sections ?? [],
		content: editor.draft,
		sectionVisibility: editor.sectionVisibility,
	});

	// Preview scroll sync
	const onActiveSectionChange = useCallback(
		(sectionId: string) => editor.setActiveSection(sectionId),
		[editor.setActiveSection],
	);
	const { scrollToSection } = usePreviewScroll({
		previewRef,
		onActiveSectionChange,
	});

	// Local UI state
	const [previewMode, setPreviewMode] = useState(false);
	const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
	const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);
	const [aiPanel, setAiPanel] = useState<AiPanelState>({
		open: false,
		sectionId: "schedule",
		prompt: "",
		type: "schedule",
	});
	const [aiGenerating, setAiGenerating] = useState(false);
	const [uploadingField, setUploadingField] = useState<string | null>(null);
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);

	const styleOverrides = (invitation?.designOverrides ?? {}) as Record<
		string,
		string
	>;

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	// Sync when invitation changes
	useEffect(() => {
		if (!invitation) return;
		editor.setDraft(invitation.content);
		editor.setSectionVisibility(invitation.sectionVisibility);
		editor.setActiveSection(template?.sections[0]?.id ?? "hero");
	}, [invitation?.id, template?.sections[0]?.id]);

	// Guards
	if (!user) return <Navigate to="/auth/login" />;
	if (!isHydrated) return <FullPageLoader message="Loading editor..." />;
	if (!invitation) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
				<p className="text-sm text-[color:var(--dm-muted)]">
					Invitation not found.
				</p>
			</div>
		);
	}

	const planLimit = aiUsageLimit(user.plan);
	const remainingAi = Math.max(0, planLimit - invitation.aiGenerationsUsed);
	const activeSectionConfig: SectionConfig | undefined =
		template?.sections.find((s) => s.id === editor.activeSection);

	// Handlers
	const handleImageUpload = async (fieldPath: string, file: File) => {
		setUploadingField(fieldPath);
		try {
			const uploaded = await uploadImage(file);
			editor.handleFieldChange(fieldPath, uploaded.url);
		} finally {
			setUploadingField(null);
		}
	};

	const handlePublish = () => {
		if (user.plan !== "premium") {
			setUpgradeOpen(true);
			return;
		}
		const slug = prompt("Set your custom slug", invitation.slug);
		publishInvitation(invitation.id, { slug: slug ?? invitation.slug });
	};

	const handleShare = () => {
		updateInvitation(invitation.id, { status: "published" });
		navigate({ to: `/dashboard/${invitation.id}`, search: { share: "true" } });
	};

	const openAiPanel = (sectionId: string) => {
		const defaultType =
			sectionId === "schedule"
				? "schedule"
				: sectionId === "faq"
					? "faq"
					: sectionId === "story"
						? "story"
						: sectionId === "hero"
							? "tagline"
							: "style";
		setAiPanel({ open: true, sectionId, prompt: "", type: defaultType });
	};

	const handleAiGenerate = async () => {
		if (remainingAi <= 0) {
			setAiPanel((prev) => ({
				...prev,
				error: "AI limit reached. Upgrade for more.",
			}));
			return;
		}
		setAiPanel((prev) => ({ ...prev, error: undefined }));
		setAiGenerating(true);
		try {
			const result = (await generateAiContent({
				type: aiPanel.type,
				sectionId: aiPanel.sectionId,
				prompt: aiPanel.prompt,
				context: editor.draft,
			})) as Record<string, unknown>;
			const generation = recordAiGeneration(
				invitation.id,
				aiPanel.sectionId,
				aiPanel.prompt,
				result,
			);
			incrementAiUsage(invitation.id);
			setAiPanel((prev) => ({
				...prev,
				result,
				generationId: generation.id,
			}));
		} finally {
			setAiGenerating(false);
		}
	};

	const handleAiApply = () => {
		if (!aiPanel.result) return;
		const next = structuredClone(editor.draft);
		if (aiPanel.type === "style") {
			const overrides = (aiPanel.result?.cssVars ?? aiPanel.result) as Record<
				string,
				string
			>;
			updateInvitation(invitation.id, { designOverrides: overrides });
		} else if (aiPanel.type === "translate") {
			next.announcement.formalText = String(aiPanel.result.translation ?? "");
			editor.updateDraft(next);
		} else if (aiPanel.sectionId === "schedule") {
			next.schedule.events = (aiPanel.result.events ??
				[]) as InvitationContent["schedule"]["events"];
			editor.updateDraft(next);
		} else if (aiPanel.sectionId === "faq") {
			next.faq.items = (aiPanel.result.items ??
				[]) as InvitationContent["faq"]["items"];
			editor.updateDraft(next);
		} else if (aiPanel.sectionId === "story") {
			next.story.milestones = (aiPanel.result.milestones ??
				[]) as InvitationContent["story"]["milestones"];
			editor.updateDraft(next);
		} else if (aiPanel.sectionId === "hero") {
			next.hero.tagline = String(aiPanel.result.tagline ?? "");
			editor.updateDraft(next);
		}
		if (aiPanel.generationId) markAiGenerationAccepted(aiPanel.generationId);
		setAiPanel((prev) => ({ ...prev, result: undefined }));
	};

	const handleInlineEdit = (fieldPath: string) => {
		setInlineEdit({
			fieldPath,
			value: String(getValueByPath(editor.draft, fieldPath) ?? ""),
		});
	};

	const handleInlineSave = () => {
		if (!inlineEdit) return;
		const next = setValueByPath(
			editor.draft,
			inlineEdit.fieldPath,
			inlineEdit.value,
		);
		editor.updateDraft(next);
		setInlineEdit(null);
	};

	const handleSectionChange = (sectionId: string) => {
		editor.setActiveSection(sectionId);
		scrollToSection(sectionId);
	};

	const handleSectionSelectFromPreview = (sectionId: string) => {
		editor.setActiveSection(sectionId);
		if (isMobile) setMobileEditorOpen(true);
	};

	// Pill bar sections with completion data
	const pillSections = useMemo(
		() =>
			(template?.sections ?? []).map((s) => ({
				id: s.id,
				label: s.id,
				completion: sectionProgress[s.id] ?? 0,
			})),
		[template?.sections, sectionProgress],
	);

	// Context panel content: section fields
	const contextPanelContent = (
		<div className="space-y-4 p-5">
			{/* Section visibility toggle */}
			<ToggleSwitch
				label={`Show ${editor.activeSection}`}
				checked={editor.sectionVisibility[editor.activeSection] ?? true}
				onChange={(checked) =>
					editor.setSectionVisibility((prev) => ({
						...prev,
						[editor.activeSection]: checked,
					}))
				}
			/>

			{/* AI Helper button */}
			<button
				type="button"
				className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--dm-border)] px-4 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)] active:bg-[color:var(--dm-surface-muted)]"
				onClick={() => {
					if (isMobile) setMobileEditorOpen(false);
					openAiPanel(editor.activeSection);
				}}
			>
				AI Helper
			</button>

			{/* Section fields */}
			<div className="space-y-4">
				{activeSectionConfig?.fields.map((field) => {
					const fieldPath = `${activeSectionConfig.id}.${field.id}`;
					const value = getValueByPath(editor.draft, fieldPath);
					return (
						<FieldRenderer
							key={field.id}
							sectionId={activeSectionConfig.id}
							field={field}
							value={value}
							onChange={editor.handleFieldChange}
							onBlur={(path) => {
								const val = getValueByPath(editor.draft, path);
								editor.setErrors((prev) => {
									const error =
										field.required && !val?.trim()
											? `${field.label} is required`
											: "";
									return { ...prev, [path]: error };
								});
							}}
							error={editor.errors[fieldPath]}
							uploadingField={uploadingField}
							onImageUpload={(path, file) => void handleImageUpload(path, file)}
							listItems={getListItems(activeSectionConfig.id, editor.draft)}
							onListItemsChange={(items) => {
								const next = updateListItems(
									editor.draft,
									activeSectionConfig.id,
									items,
								);
								editor.updateDraft(next);
							}}
						/>
					);
				})}
			</div>
		</div>
	);

	// Build the toolbar
	const toolbar = (
		<EditorToolbar
			title={invitation.title}
			canUndo={editor.canUndo}
			canRedo={editor.canRedo}
			onUndo={editor.handleUndo}
			onRedo={editor.handleRedo}
			onPreview={() => setPreviewMode(true)}
			onPublish={handlePublish}
			saveStatus={saveStatus}
			autosaveAt={autosaveAt}
			isMobile={isMobile}
		/>
	);

	// Build the preview
	const preview = (
		<EditorPreviewFrame
			templateId={template?.id ?? "blush-romance"}
			content={editor.draft}
			hiddenSections={editor.hiddenSections}
			activeSection={editor.activeSection}
			styleOverrides={styleOverrides}
			onSectionSelect={handleSectionSelectFromPreview}
			onAiClick={openAiPanel}
			onInlineEdit={handleInlineEdit}
			previewRef={previewRef}
		/>
	);

	// Build the pill bar
	const pillBar = (
		<SectionPillBar
			sections={pillSections}
			activeSection={editor.activeSection}
			onSectionChange={handleSectionChange}
		/>
	);

	// Build the context panel (wrapped in bottom sheet for mobile)
	const contextPanel = isMobile ? (
		<MobileBottomSheet
			open={mobileEditorOpen}
			onClose={() => setMobileEditorOpen(false)}
			title="Section Editor"
			snapPoints={[40, 50, 85]}
			initialSnap={1}
		>
			{contextPanelContent}
		</MobileBottomSheet>
	) : (
		contextPanelContent
	);

	return (
		<>
			<EditorLayout
				toolbar={toolbar}
				preview={preview}
				pillBar={pillBar}
				contextPanel={contextPanel}
				isMobile={isMobile}
				isTablet={isTablet}
				bottomSheetOpen={mobileEditorOpen}
			/>

			{/* Inline edit dialog */}
			{inlineEdit && (
				<div
					className="dm-inline-edit"
					role="dialog"
					aria-modal="true"
					aria-labelledby={inlineEditTitleId}
				>
					<div className="dm-inline-card">
						<p
							id={inlineEditTitleId}
							className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]"
						>
							Quick Edit
						</p>
						<input
							value={inlineEdit.value}
							aria-label="Quick Edit Value"
							name="inlineEditValue"
							onChange={(event) =>
								setInlineEdit((prev) =>
									prev ? { ...prev, value: event.target.value } : prev,
								)
							}
							className="mt-3 h-12 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 text-base text-[color:var(--dm-ink)]"
						/>
						<div className="mt-4 flex gap-3">
							<button
								type="button"
								className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={() => setInlineEdit(null)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
								onClick={handleInlineSave}
							>
								Apply
							</button>
						</div>
					</div>
				</div>
			)}

			{/* AI panel dialog */}
			{aiPanel.open && (
				<div
					className="dm-inline-edit"
					role="dialog"
					aria-modal="true"
					aria-labelledby={aiPanelTitleId}
				>
					<div className="dm-inline-card">
						<p
							id={aiPanelTitleId}
							className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]"
						>
							AI Assistant
						</p>
						<select
							value={aiPanel.type}
							aria-label="AI Task"
							name="aiTask"
							onChange={(event) =>
								setAiPanel((prev) => ({
									...prev,
									type: event.target.value as AiPanelState["type"],
								}))
							}
							className="mt-3 h-10 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-3 text-base text-[color:var(--dm-ink)]"
						>
							<option value="schedule">Schedule</option>
							<option value="faq">FAQ</option>
							<option value="story">Love Story</option>
							<option value="tagline">Tagline</option>
							<option value="translate">Translate</option>
							<option value="style">Style Adjustment</option>
						</select>
						<textarea
							value={aiPanel.prompt}
							aria-label="AI Prompt"
							name="aiPrompt"
							autoComplete="off"
							onChange={(event) =>
								setAiPanel((prev) => ({
									...prev,
									prompt: event.target.value,
								}))
							}
							placeholder='Describe what you want (e.g., "Romantic schedule")...'
							className="mt-3 min-h-[120px] w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-3 text-base text-[color:var(--dm-ink)]"
						/>
						{aiPanel.error ? (
							<output
								className="mt-2 text-xs text-[#b91c1c]"
								aria-live="polite"
							>
								{aiPanel.error}
							</output>
						) : null}
						<div className="mt-4 flex flex-wrap gap-3">
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)] disabled:cursor-not-allowed disabled:opacity-50"
								onClick={handleAiGenerate}
								disabled={aiGenerating || !aiPanel.prompt.trim()}
							>
								{aiGenerating && <LoadingSpinner size="sm" />}
								{aiGenerating ? "Generating..." : "Generate"}
							</button>
							<button
								type="button"
								className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:cursor-not-allowed disabled:opacity-50"
								onClick={handleAiApply}
								disabled={!aiPanel.result || aiGenerating}
							>
								Apply
							</button>
							<button
								type="button"
								className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={() =>
									setAiPanel((prev) => ({ ...prev, open: false }))
								}
								disabled={aiGenerating}
							>
								Close
							</button>
						</div>
						{aiPanel.result ? (
							<pre className="mt-4 max-h-40 overflow-auto rounded-2xl bg-[color:var(--dm-surface)] p-3 text-[11px] text-[color:var(--dm-muted)]">
								{JSON.stringify(aiPanel.result, null, 2)}
							</pre>
						) : null}
					</div>
				</div>
			)}

			{/* Preview mode overlay */}
			{previewMode && (
				<div
					className={`dm-preview ${
						isLightTemplate ? "dm-shell-light" : "dm-shell-dark"
					}`}
				>
					<div className="dm-preview-toolbar">
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
							onClick={() => setPreviewMode(false)}
							aria-label="Switch to edit mode"
						>
							Back to Edit
						</button>
						<button
							type="button"
							className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
							onClick={handleShare}
						>
							Share
						</button>
					</div>
					<div className="dm-preview-body" style={styleOverrides}>
						<InvitationRenderer
							templateId={template?.id ?? "blush-romance"}
							content={editor.draft}
							hiddenSections={editor.hiddenSections}
							mode="preview"
						/>
					</div>
				</div>
			)}

			{/* Upgrade dialog */}
			{upgradeOpen && (
				<div
					className="dm-inline-edit"
					role="dialog"
					aria-modal="true"
					aria-labelledby={upgradeTitleId}
				>
					<div className="dm-inline-card">
						<p
							id={upgradeTitleId}
							className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]"
						>
							Upgrade to Premium
						</p>
						<ul className="mt-3 space-y-2 text-sm text-[color:var(--dm-muted)]">
							<li>Custom URL slug</li>
							<li>100 AI generations</li>
							<li>CSV import + export</li>
							<li>Advanced analytics</li>
						</ul>
						<div className="mt-4 flex gap-3">
							<button
								type="button"
								className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={() => {
									publishInvitation(invitation.id, { randomize: true });
									setUpgradeOpen(false);
								}}
							>
								Continue Free
							</button>
							<button
								type="button"
								className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
								onClick={() => navigate({ to: "/upgrade" })}
							>
								Upgrade
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

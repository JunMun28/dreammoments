import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { AiAssistantDrawer } from "../../components/editor/AiAssistantDrawer";
import { ContextPanel } from "../../components/editor/ContextPanel";
import { EditorLayout } from "../../components/editor/EditorLayout";
import { EditorPreviewFrame } from "../../components/editor/EditorPreviewFrame";
import { EditorToolbar } from "../../components/editor/EditorToolbar";
import { useAiAssistant } from "../../components/editor/hooks/useAiAssistant";
import { useAutoSave } from "../../components/editor/hooks/useAutoSave";
import { useFocusTrap } from "../../components/editor/hooks/useFocusTrap";
import {
	getValueByPath,
	setValueByPath,
	useEditorState,
} from "../../components/editor/hooks/useEditorState";
import { useInlineEdit } from "../../components/editor/hooks/useInlineEdit";
import { useKeyboardShortcuts } from "../../components/editor/hooks/useKeyboardShortcuts";
import { useMediaQuery } from "../../components/editor/hooks/useMediaQuery";
import { usePreviewScroll } from "../../components/editor/hooks/usePreviewScroll";
import { useSectionProgress } from "../../components/editor/hooks/useSectionProgress";
import InlineEditOverlay from "../../components/editor/InlineEditOverlay";
import {
	LayoutToggle,
	type PreviewLayout,
} from "../../components/editor/LayoutToggle";
import MobileBottomSheet from "../../components/editor/MobileBottomSheet";
import MobileSectionNav from "../../components/editor/MobileSectionNav";
import { SectionPillBar } from "../../components/editor/SectionPillBar";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { FullPageLoader } from "../../components/ui/LoadingSpinner";
import { buildSampleContent } from "../../data/sample-invitation";
import {
	aiUsageLimit,
	createUser,
	getCurrentUser,
	publishInvitation,
	updateInvitation,
} from "../../lib/data";
import { uploadImage } from "../../lib/storage";
import { useStore } from "../../lib/store";
import { templates } from "../../templates";
import type { SectionConfig, TemplateConfig } from "../../templates/types";

export const Route = createFileRoute("/editor/$invitationId")({
	component: EditorScreen,
});

const lightTemplates = new Set([
	"garden-romance",
	"eternal-elegance",
	"blush-romance",
]);

export function EditorScreen() {
	const { invitationId } = Route.useParams();
	const navigate = useNavigate();
	const rawId = useId();
	const upgradeTitleId = `upgrade-title-${rawId.replaceAll(":", "")}`;
	const slugInputId = `slug-input-${rawId.replaceAll(":", "")}`;

	const invitation = useStore((store) =>
		store.invitations.find((item) => item.id === invitationId),
	);
	const [loginBypassDone, setLoginBypassDone] = useState(false);
	const user = getCurrentUser();

	// DEV-only bypass: create a demo user so the editor loads without login.
	// Gated behind import.meta.env.DEV to prevent unauthenticated user creation in production.
	useEffect(() => {
		if (user) return;
		if (!import.meta.env.DEV) return;
		createUser({
			email: "demo@test.local",
			name: "Demo",
			authProvider: "email",
		});
		setLoginBypassDone(true);
	}, [user]);

	const isMobile = useMediaQuery("(max-width: 767px)");
	const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
	const isTabletLandscape = useMediaQuery(
		"(orientation: landscape) and (min-width: 768px) and (max-width: 1023px)",
	);
	const isMobileLandscape = useMediaQuery(
		"(max-height: 500px) and (orientation: landscape) and (max-width: 767px)",
	);

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
		version: editor.version,
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

	// Inline edit hook (replaces manual state)
	const {
		inlineEdit,
		openInlineEdit,
		closeInlineEdit,
		updateInlineValue,
		saveInlineEdit,
	} = useInlineEdit();

	// AI assistant hook (replaces manual state + handlers)
	const aiAssistant = useAiAssistant({
		invitationId: invitation?.id ?? "",
		aiGenerationsUsed: invitation?.aiGenerationsUsed ?? 0,
		planLimit: aiUsageLimit(user?.plan ?? "free"),
		draft: editor.draft,
		onApplyResult: (next) => editor.updateDraft(next),
		onApplyStyleOverrides: (overrides) => {
			if (invitation) {
				updateInvitation(invitation.id, { designOverrides: overrides });
			}
		},
	});

	// Local UI state
	const [previewMode, setPreviewMode] = useState(false);
	const [previewLayout, setPreviewLayout] = useState<PreviewLayout>("web");
	const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
	const [mobileSnapIndex, setMobileSnapIndex] = useState(1);
	const [uploadingField, setUploadingField] = useState<string | null>(null);
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [panelCollapsed, setPanelCollapsed] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);
	const [slugDialogOpen, setSlugDialogOpen] = useState(false);
	const [slugValue, setSlugValue] = useState("");

	// Refs for focus trap containers
	const previewDialogRef = useRef<HTMLDivElement | null>(null);
	const slugDialogRef = useRef<HTMLDivElement | null>(null);
	const upgradeDialogRef = useRef<HTMLDivElement | null>(null);
	const shortcutsDialogRef = useRef<HTMLDivElement | null>(null);

	const styleOverrides = (invitation?.designOverrides ?? {}) as Record<
		string,
		string
	>;

	// Keyboard shortcuts (desktop only)
	const { showHelp: showShortcutsHelp, setShowHelp: setShowShortcutsHelp } =
		useKeyboardShortcuts(
			{
				onUndo: () => editor.handleUndo(),
				onRedo: () => editor.handleRedo(),
				onSave: () => {
					/* auto-save handles this; force-save could trigger manual save */
				},
				onCollapsePanel: () => setPanelCollapsed(true),
				onExpandPanel: () => setPanelCollapsed(false),
				onTogglePreview: () => setPreviewMode((prev) => !prev),
			},
			{ enabled: !isMobile },
		);

	// Focus traps for dialogs
	useFocusTrap(previewDialogRef, {
		enabled: previewMode,
		onEscape: () => setPreviewMode(false),
	});
	useFocusTrap(slugDialogRef, {
		enabled: slugDialogOpen,
		onEscape: () => setSlugDialogOpen(false),
	});
	useFocusTrap(upgradeDialogRef, {
		enabled: upgradeOpen,
		onEscape: () => setUpgradeOpen(false),
	});
	useFocusTrap(shortcutsDialogRef, {
		enabled: showShortcutsHelp,
		onEscape: () => setShowShortcutsHelp(false),
	});

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	// Sync when invitation changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: editor setters are stable refs; re-run only on invitation/template change
	useEffect(() => {
		if (!invitation) return;
		editor.setDraft(invitation.content);
		editor.setSectionVisibility(invitation.sectionVisibility);
		editor.setActiveSection(template?.sections[0]?.id ?? "hero");
	}, [invitation?.id, template?.sections[0]?.id]);

	// Pill bar sections (must run before any conditional return to satisfy hooks order)
	const pillSections = useMemo(
		() =>
			(template?.sections ?? []).map((s) => ({
				id: s.id,
				label: s.id,
				completion: sectionProgress[s.id] ?? 0,
			})),
		[template?.sections, sectionProgress],
	);

	// Guards (login bypass for testing: show loader until demo user is created)
	if (!user && !loginBypassDone)
		return <FullPageLoader message="Loading editor..." />;
	if (!user) return <Navigate to="/auth/login" />;
	if (!isHydrated) return <FullPageLoader message="Loading editor..." />;
	if (!invitation) {
		return (
			<div className="min-h-screen bg-dm-bg px-6 py-10">
				<p className="text-sm text-dm-muted">Invitation not found.</p>
			</div>
		);
	}

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
		setSlugValue(invitation.slug);
		setSlugDialogOpen(true);
	};

	const handleSlugConfirm = () => {
		publishInvitation(invitation.id, {
			slug: slugValue.trim() || invitation.slug,
		});
		setSlugDialogOpen(false);
	};

	const handleShare = () => {
		updateInvitation(invitation.id, { status: "published" });
		navigate({ to: `/dashboard/${invitation.id}`, search: { share: "true" } });
	};

	const handleInlineEdit = (fieldPath: string) => {
		openInlineEdit(
			fieldPath,
			String(getValueByPath(editor.draft, fieldPath) ?? ""),
		);
	};

	const handleInlineSave = () => {
		if (!inlineEdit) return;
		const fieldPath = inlineEdit.fieldPath;
		const value = saveInlineEdit();
		const next = setValueByPath(editor.draft, fieldPath, value);
		editor.updateDraft(next);
	};

	const handleSectionChange = (sectionId: string) => {
		editor.setActiveSection(sectionId);
		scrollToSection(sectionId);
	};

	const handleSectionSelectFromPreview = (sectionId: string) => {
		editor.setActiveSection(sectionId);
		if (isMobile) {
			setMobileSnapIndex(1); // 60% snap for comfortable editing
			setMobileEditorOpen(true);
		}
	};

	const handleOpenAiPanel = (sectionId: string) => {
		if (isMobile) setMobileEditorOpen(false);
		aiAssistant.openAiPanel(sectionId);
	};

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

	// Build the preview (with Web/Mobile layout toggle)
	const preview = (
		<div className="flex h-full flex-col">
			<div className="flex shrink-0 justify-center border-b border-dm-border bg-dm-bg py-3">
				<LayoutToggle layout={previewLayout} onChange={setPreviewLayout} />
			</div>
			<div className="min-h-0 flex-1 p-4">
				<EditorPreviewFrame
					templateId={template?.id ?? "blush-romance"}
					content={editor.draft}
					hiddenSections={editor.hiddenSections}
					activeSection={editor.activeSection}
					styleOverrides={styleOverrides}
					onSectionSelect={handleSectionSelectFromPreview}
					onAiClick={handleOpenAiPanel}
					onInlineEdit={handleInlineEdit}
					previewRef={previewRef}
					previewLayout={previewLayout}
				/>
			</div>
		</div>
	);

	// Build the pill bar (SectionPillBar for desktop/tablet, MobileSectionNav for mobile)
	const pillBar = isMobile ? (
		<MobileSectionNav
			sections={pillSections}
			activeSection={editor.activeSection}
			onSectionChange={handleSectionChange}
		/>
	) : (
		<SectionPillBar
			sections={pillSections}
			activeSection={editor.activeSection}
			onSectionChange={handleSectionChange}
		/>
	);

	// Build the context panel
	const contextPanelInner = (
		<ContextPanel
			sectionId={editor.activeSection}
			sectionConfig={activeSectionConfig}
			draft={editor.draft}
			sectionVisibility={editor.sectionVisibility}
			errors={editor.errors}
			uploadingField={uploadingField}
			onFieldChange={editor.handleFieldChange}
			onFieldBlur={(path) => {
				const field = activeSectionConfig?.fields.find(
					(f) => `${activeSectionConfig.id}.${f.id}` === path,
				);
				const val = getValueByPath(editor.draft, path);
				editor.setErrors((prev) => {
					const error =
						field?.required && !val?.trim() ? `${field.label} is required` : "";
					return { ...prev, [path]: error };
				});
			}}
			onImageUpload={(path, file) => void handleImageUpload(path, file)}
			onVisibilityChange={(sectionId, visible) =>
				editor.setSectionVisibility((prev) => ({
					...prev,
					[sectionId]: visible,
				}))
			}
			onAiClick={handleOpenAiPanel}
			completion={sectionProgress[editor.activeSection] ?? 0}
			collapsed={!isMobile && panelCollapsed}
			onToggleCollapse={() => setPanelCollapsed((prev) => !prev)}
			sections={template?.sections}
			onSectionChange={handleSectionChange}
		/>
	);

	const contextPanel = isMobile ? (
		<MobileBottomSheet
			open={mobileEditorOpen}
			onClose={() => setMobileEditorOpen(false)}
			title="Section Editor"
			snapPoints={[30, 60, 90]}
			initialSnap={1}
			activeSnapIndex={mobileSnapIndex}
			onSnapChange={setMobileSnapIndex}
			isDirty={editor.version > 0}
		>
			{contextPanelInner}
		</MobileBottomSheet>
	) : (
		contextPanelInner
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
				isTabletLandscape={isTabletLandscape}
				isMobileLandscape={isMobileLandscape}
				panelCollapsed={panelCollapsed}
				bottomSheetOpen={mobileEditorOpen}
			/>

			{/* Inline edit overlay (positioned popover on desktop, bottom bar on mobile) */}
			{inlineEdit && (
				<InlineEditOverlay
					fieldPath={inlineEdit.fieldPath}
					value={inlineEdit.value}
					rect={inlineEdit.rect}
					isMobile={isMobile}
					onChange={updateInlineValue}
					onSave={handleInlineSave}
					onCancel={closeInlineEdit}
				/>
			)}

			{/* AI assistant drawer (right drawer on desktop, bottom sheet on mobile) */}
			<AiAssistantDrawer
				open={aiAssistant.aiPanel.open}
				sectionId={aiAssistant.aiPanel.sectionId}
				prompt={aiAssistant.aiPanel.prompt}
				type={aiAssistant.aiPanel.type}
				result={aiAssistant.aiPanel.result}
				error={aiAssistant.aiPanel.error}
				generating={aiAssistant.aiGenerating}
				remainingAi={aiAssistant.remainingAi}
				isMobile={isMobile}
				onClose={aiAssistant.closeAiPanel}
				onPromptChange={aiAssistant.setAiPrompt}
				onTypeChange={aiAssistant.setAiType}
				onGenerate={() => void aiAssistant.generate()}
				onApply={aiAssistant.applyResult}
			/>

			{/* Preview mode overlay */}
			{previewMode && (
				<div
					ref={previewDialogRef}
					role="dialog"
					aria-modal="true"
					aria-label="Invitation preview"
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
					ref={upgradeDialogRef}
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

			{/* Keyboard shortcuts help */}
			{showShortcutsHelp && (
				<div
					ref={shortcutsDialogRef}
					className="dm-inline-edit"
					role="dialog"
					aria-modal="true"
					aria-label="Keyboard shortcuts"
				>
					<div className="dm-inline-card">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
							Keyboard Shortcuts
						</p>
						<dl className="mt-3 space-y-2 text-sm">
							{[
								["Cmd/Ctrl+Z", "Undo"],
								["Cmd/Ctrl+Shift+Z", "Redo"],
								["Cmd/Ctrl+S", "Force save"],
								["[", "Collapse panel"],
								["]", "Expand panel"],
								["Cmd/Ctrl+P", "Toggle preview"],
								["?", "Toggle this help"],
							].map(([key, desc]) => (
								<div key={key} className="flex justify-between">
									<dt className="font-mono text-xs text-[color:var(--dm-muted)]">
										{key}
									</dt>
									<dd className="text-xs text-[color:var(--dm-ink)]">{desc}</dd>
								</div>
							))}
						</dl>
						<button
							type="button"
							className="mt-4 w-full rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
							onClick={() => setShowShortcutsHelp(false)}
						>
							Close
						</button>
					</div>
				</div>
			)}

			{/* Custom slug input dialog (replaces native prompt()) */}
			{slugDialogOpen && (
				<div
					ref={slugDialogRef}
					className="dm-inline-edit"
					role="dialog"
					aria-modal="true"
					aria-label="Set custom slug"
				>
					<div className="dm-inline-card">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
							Set Your Custom URL
						</p>
						<label
							htmlFor={slugInputId}
							className="mt-3 block text-sm text-[color:var(--dm-muted)]"
						>
							Invitation slug
						</label>
						<input
							id={slugInputId}
							type="text"
							value={slugValue}
							onChange={(e) => setSlugValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSlugConfirm();
							}}
							className="mt-1 w-full rounded-lg border border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] px-3 py-2 text-sm text-[color:var(--dm-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60"
							autoComplete="off"
						/>
						<div className="mt-4 flex gap-3">
							<button
								type="button"
								className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={() => setSlugDialogOpen(false)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
								onClick={handleSlugConfirm}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

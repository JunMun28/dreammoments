import {
	createFileRoute,
	type ErrorComponentProps,
	Link,
	Navigate,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiAssistantDrawer } from "../../components/editor/AiAssistantDrawer";
import { ContextPanel } from "../../components/editor/ContextPanel";
import { EditorLayout } from "../../components/editor/EditorLayout";
import { EditorPreviewFrame } from "../../components/editor/EditorPreviewFrame";
import { EditorToolbar } from "../../components/editor/EditorToolbar";
import {
	type AiTaskType,
	useAiAssistant,
} from "../../components/editor/hooks/useAiAssistant";
import { useAutoSave } from "../../components/editor/hooks/useAutoSave";
import {
	getValueByPath,
	setValueByPath,
	useEditorState,
} from "../../components/editor/hooks/useEditorState";
import { useFormScrollSpy } from "../../components/editor/hooks/useFormScrollSpy";
import { useInlineEdit } from "../../components/editor/hooks/useInlineEdit";
import { useKeyboardShortcuts } from "../../components/editor/hooks/useKeyboardShortcuts";
import { useMediaQuery } from "../../components/editor/hooks/useMediaQuery";
import { usePreviewScroll } from "../../components/editor/hooks/usePreviewScroll";
import { useSectionProgress } from "../../components/editor/hooks/useSectionProgress";
import {
	useSlugValidation,
	validateSlug,
} from "../../components/editor/hooks/useSlugValidation";
import InlineEditOverlay from "../../components/editor/InlineEditOverlay";
import { KeyboardShortcutsHelp } from "../../components/editor/KeyboardShortcutsHelp";
import type { PreviewLayout } from "../../components/editor/LayoutToggle";
import { MobileAllSectionsPanel } from "../../components/editor/MobileAllSectionsPanel";
import MobileBottomSheet from "../../components/editor/MobileBottomSheet";
import MobileSectionNav from "../../components/editor/MobileSectionNav";
import { OnboardingTour } from "../../components/editor/OnboardingTour";
import { PreviewDialog } from "../../components/editor/PreviewDialog";
import { PublishDialog } from "../../components/editor/PublishDialog";
import { SectionPillBar } from "../../components/editor/SectionPillBar";
import { SectionRail } from "../../components/editor/SectionRail";
import { SlugEditor } from "../../components/editor/SlugEditor";
import { UpgradePrompt } from "../../components/editor/UpgradePrompt";
import ShareModal from "../../components/share/ShareModal";
import { FullPageLoader } from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/Toast";
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
import {
	getSectionLabel,
	type SectionConfig,
	type TemplateConfig,
} from "../../templates/types";

function EditorErrorFallback({ reset }: ErrorComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-dm-bg px-6">
			<div className="max-w-md text-center">
				<h1 className="font-heading text-2xl font-semibold text-dm-ink">
					Editor encountered an error
				</h1>
				<p className="mt-3 text-sm text-dm-muted">
					Something went wrong in the editor. Your changes are auto-saved.
				</p>
				{import.meta.env.DEV && (
					<p className="mt-2 text-xs text-dm-error">
						Check the browser console for details.
					</p>
				)}
				<div className="mt-6 flex justify-center gap-3">
					<button
						type="button"
						onClick={reset}
						className="rounded-full bg-dm-accent-strong px-6 py-2 text-xs uppercase tracking-[0.2em] text-dm-on-accent"
					>
						Refresh Editor
					</button>
					<Link
						to="/dashboard"
						className="rounded-full border border-dm-border px-6 py-2 text-xs uppercase tracking-[0.2em] text-dm-ink"
					>
						Back to Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/editor/$invitationId")({
	component: EditorScreen,
	errorComponent: EditorErrorFallback,
});

const lightTemplates = new Set([
	"garden-romance",
	"eternal-elegance",
	"blush-romance",
]);

function EditorScreen() {
	const { invitationId } = Route.useParams();

	const { addToast } = useToast();
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

	// Mobile bottom sheet state (declared early so useFormScrollSpy can depend on it)
	const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
	const [mobileSnapIndex, setMobileSnapIndex] = useState(1);

	// Refs for auto-save and form scroll
	const previewRef = useRef<HTMLDivElement | null>(null);
	const formScrollRef = useRef<HTMLDivElement | null>(null);
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
		onSaveError: (message) =>
			addToast({ type: "error", message: `Save failed: ${message}` }),
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

	// Form scroll-spy (for mobile all-sections panel)
	const { scrollToFormSection } = useFormScrollSpy({
		scrollContainerRef: formScrollRef,
		onActiveSectionChange,
		enabled: mobileEditorOpen,
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
		onGenerateSuccess: () =>
			addToast({ type: "success", message: "AI content generated!" }),
		onGenerateError: (message) => addToast({ type: "error", message }),
	});

	// Local UI state
	const [previewMode, setPreviewMode] = useState(false);
	const previewLayout: PreviewLayout = "web";
	const [uploadingField, setUploadingField] = useState<string | null>(null);
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [panelCollapsed, setPanelCollapsed] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);
	const [slugDialogOpen, setSlugDialogOpen] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [publishSuccess, setPublishSuccess] = useState(false);

	// Slug validation hook
	const slug = useSlugValidation({ invitationId: invitation?.id ?? "" });

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
				label: getSectionLabel(s.id),
				completion: sectionProgress[s.id] ?? 0,
			})),
		[template?.sections, sectionProgress],
	);

	// Guards (login bypass for testing: show loader until demo user is created)
	if (!user && !loginBypassDone)
		return <FullPageLoader message="Loading editor..." />;
	if (!user) return <Navigate to="/auth/login" />;
	if (!isHydrated) return <FullPageLoader message="Loading editor..." />;
	if (!invitation || invitation.userId !== user.id) {
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
		slug.reset(invitation.slug);
		setSlugDialogOpen(true);
	};

	const handleSlugConfirm = () => {
		const trimmed = slug.slugValue.trim();
		const error = validateSlug(trimmed);
		if (error) return;
		if (slug.slugAvailability === "taken") return;

		publishInvitation(invitation.id, {
			slug: trimmed || invitation.slug,
		});
		setSlugDialogOpen(false);
		setPublishSuccess(true);
		addToast({ type: "success", message: "Invitation published!" });
	};

	const handleContinueFree = () => {
		publishInvitation(invitation.id, { randomize: true });
		setUpgradeOpen(false);
		setPublishSuccess(true);
		addToast({ type: "success", message: "Invitation published!" });
	};

	const handleShare = () => {
		setPublishSuccess(false);
		setShareModalOpen(true);
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

	const handleMobileSectionChange = (sectionId: string) => {
		editor.setActiveSection(sectionId);
		scrollToFormSection(sectionId);
		scrollToSection(sectionId);
	};

	const handleSectionSelectFromPreview = (sectionId: string) => {
		editor.setActiveSection(sectionId);
		if (isMobile || isTablet) {
			setMobileSnapIndex(2); // 95% snap for full-screen editing
			setMobileEditorOpen(true);
			requestAnimationFrame(() => scrollToFormSection(sectionId));
		}
	};

	const handleOpenAiPanel = (sectionId: string, type?: AiTaskType) => {
		if (isMobile || isTablet) setMobileEditorOpen(false);
		aiAssistant.openAiPanel(sectionId, type);
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

	// Build the preview
	const preview = (
		<div className="flex h-full flex-col">
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
	const externalPillBar = (
		<MobileSectionNav
			sections={pillSections}
			activeSection={editor.activeSection}
			onSectionChange={handleSectionChange}
		/>
	);
	const sheetPillBar = (
		<MobileSectionNav
			sections={pillSections}
			activeSection={editor.activeSection}
			onSectionChange={handleMobileSectionChange}
			embedded
		/>
	);
	const pillBar =
		isMobile || isTablet ? (
			externalPillBar
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
			collapsed={!(isMobile || isTablet) && panelCollapsed}
			onToggleCollapse={() => setPanelCollapsed((prev) => !prev)}
		/>
	);

	const contextPanel =
		isMobile || isTablet ? (
			<MobileBottomSheet
				open={mobileEditorOpen}
				onClose={() => setMobileEditorOpen(false)}
				headerContent={sheetPillBar}
				snapPoints={[30, 60, 95]}
				initialSnap={2}
				activeSnapIndex={mobileSnapIndex}
				onSnapChange={setMobileSnapIndex}
				isDirty={editor.version > 0}
			>
				<MobileAllSectionsPanel
					sections={template?.sections ?? []}
					draft={editor.draft}
					sectionVisibility={editor.sectionVisibility}
					sectionProgress={sectionProgress}
					errors={editor.errors}
					uploadingField={uploadingField}
					onFieldChange={editor.handleFieldChange}
					onFieldBlur={(path) => {
						const section = template?.sections.find(
							(s) => s.id === editor.activeSection,
						);
						const field = section?.fields.find(
							(f) => `${section.id}.${f.id}` === path,
						);
						const val = getValueByPath(editor.draft, path);
						editor.setErrors((prev) => {
							const error =
								field?.required && !val?.trim()
									? `${field.label} is required`
									: "";
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
					scrollContainerRef={formScrollRef}
				/>
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
				sectionRail={
					!isMobile && !isTablet ? (
						<SectionRail
							sections={pillSections}
							activeSection={editor.activeSection}
							onSectionChange={handleSectionChange}
						/>
					) : undefined
				}
				isMobile={isMobile}
				isTablet={isTablet}
				panelCollapsed={panelCollapsed}
				bottomSheetOpen={mobileEditorOpen}
				onOpenBottomSheet={() => setMobileEditorOpen(true)}
			/>

			<OnboardingTour />

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
				aiGenerationsUsed={aiAssistant.aiGenerationsUsed}
				planLimit={aiAssistant.planLimit}
				isMobile={isMobile}
				onClose={aiAssistant.closeAiPanel}
				onPromptChange={aiAssistant.setAiPrompt}
				onTypeChange={aiAssistant.setAiType}
				onGenerate={() => void aiAssistant.generate()}
				onApply={aiAssistant.applyResult}
			/>

			{/* Preview mode overlay */}
			<PreviewDialog
				open={previewMode}
				onClose={() => setPreviewMode(false)}
				templateId={template?.id ?? "blush-romance"}
				content={editor.draft}
				hiddenSections={editor.hiddenSections}
				isLightTemplate={isLightTemplate}
				styleOverrides={styleOverrides}
				onShare={handleShare}
			/>

			{/* Upgrade dialog */}
			<UpgradePrompt
				open={upgradeOpen}
				onClose={() => setUpgradeOpen(false)}
				onContinueFree={handleContinueFree}
			/>

			{/* Keyboard shortcuts help */}
			<KeyboardShortcutsHelp
				open={showShortcutsHelp}
				onClose={() => setShowShortcutsHelp(false)}
			/>

			{/* Custom slug input dialog */}
			<SlugEditor
				open={slugDialogOpen}
				onClose={() => setSlugDialogOpen(false)}
				slugValue={slug.slugValue}
				slugError={slug.slugError}
				slugAvailability={slug.slugAvailability}
				slugIsValid={slug.slugIsValid}
				onSlugChange={slug.setSlugValue}
				onConfirm={handleSlugConfirm}
			/>

			{/* Publish success celebration */}
			<PublishDialog
				open={publishSuccess}
				onClose={() => setPublishSuccess(false)}
				slug={invitation.slug}
				onShare={handleShare}
			/>

			{/* Share modal */}
			<ShareModal
				open={shareModalOpen}
				invitation={invitation}
				onClose={() => setShareModalOpen(false)}
			/>
		</>
	);
}

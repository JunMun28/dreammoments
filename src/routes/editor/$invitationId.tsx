import {
	createFileRoute,
	type ErrorComponentProps,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { checkSlugAvailabilityFn } from "../../api/invitations";
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
import { useFocusTrap } from "../../components/editor/hooks/useFocusTrap";
import { useFormScrollSpy } from "../../components/editor/hooks/useFormScrollSpy";
import { useInlineEdit } from "../../components/editor/hooks/useInlineEdit";
import { useKeyboardShortcuts } from "../../components/editor/hooks/useKeyboardShortcuts";
import { useMediaQuery } from "../../components/editor/hooks/useMediaQuery";
import { usePreviewScroll } from "../../components/editor/hooks/usePreviewScroll";
import { useSectionProgress } from "../../components/editor/hooks/useSectionProgress";
import InlineEditOverlay from "../../components/editor/InlineEditOverlay";
import type { PreviewLayout } from "../../components/editor/LayoutToggle";
import { MobileAllSectionsPanel } from "../../components/editor/MobileAllSectionsPanel";
import MobileBottomSheet from "../../components/editor/MobileBottomSheet";
import MobileSectionNav from "../../components/editor/MobileSectionNav";
import { SectionPillBar } from "../../components/editor/SectionPillBar";
import ShareModal from "../../components/share/ShareModal";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { FullPageLoader } from "../../components/ui/LoadingSpinner";
import { buildSampleContent } from "../../data/sample-invitation";
import {
	aiUsageLimit,
	createUser,
	getCurrentUser,
	PUBLIC_BASE_URL,
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

// ── Slug validation ─────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const SLUG_MIN = 3;
const SLUG_MAX = 50;
const RESERVED_SLUGS = new Set([
	"admin",
	"api",
	"auth",
	"dashboard",
	"editor",
	"upgrade",
	"invite",
	"login",
	"signup",
	"settings",
	"help",
	"support",
	"about",
	"privacy",
	"terms",
]);

function validateSlug(slug: string): string {
	if (!slug) return "";
	if (slug.length < SLUG_MIN)
		return `Slug must be at least ${SLUG_MIN} characters`;
	if (slug.length > SLUG_MAX)
		return `Slug must be at most ${SLUG_MAX} characters`;
	if (!SLUG_REGEX.test(slug))
		return "Only lowercase letters, numbers, and hyphens allowed. Must start and end with a letter or number.";
	if (RESERVED_SLUGS.has(slug)) return `"${slug}" is a reserved word`;
	return "";
}

export function EditorScreen() {
	const { invitationId } = Route.useParams();
	const navigate = useNavigate();
	const rawId = useId();
	const upgradeTitleId = `upgrade-title-${rawId.replaceAll(":", "")}`;
	const slugInputId = `slug-input-${rawId.replaceAll(":", "")}`;
	const slugFeedbackId = useId();

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
	});

	// Local UI state
	const [previewMode, setPreviewMode] = useState(false);
	const previewLayout: PreviewLayout = "web";
	const [uploadingField, setUploadingField] = useState<string | null>(null);
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [panelCollapsed, setPanelCollapsed] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);
	const [slugDialogOpen, setSlugDialogOpen] = useState(false);
	const [slugValue, setSlugValue] = useState("");
	const [slugError, setSlugError] = useState("");
	const [slugAvailability, setSlugAvailability] = useState<
		"idle" | "checking" | "available" | "taken"
	>("idle");
	const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [publishSuccess, setPublishSuccess] = useState(false);

	// Refs for focus trap containers
	const previewDialogRef = useRef<HTMLDivElement | null>(null);
	const slugDialogRef = useRef<HTMLDivElement | null>(null);
	const upgradeDialogRef = useRef<HTMLDivElement | null>(null);
	const shortcutsDialogRef = useRef<HTMLDivElement | null>(null);
	const publishSuccessRef = useRef<HTMLDivElement | null>(null);

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
	useFocusTrap(publishSuccessRef, {
		enabled: publishSuccess,
		onEscape: () => setPublishSuccess(false),
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
		setSlugError("");
		setSlugAvailability("idle");
		setSlugDialogOpen(true);
	};

	const handleSlugChange = (value: string) => {
		const normalized = value.toLowerCase().replace(/\s+/g, "-");
		setSlugValue(normalized);

		if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);

		const error = validateSlug(normalized);
		setSlugError(error);

		if (error || !normalized) {
			setSlugAvailability("idle");
			return;
		}

		setSlugAvailability("checking");
		slugCheckTimer.current = setTimeout(() => {
			const token = window.localStorage.getItem("dm-auth-token");
			if (!token) return;
			void checkSlugAvailabilityFn({
				data: { token, slug: normalized, invitationId: invitation.id },
			})
				.then((result: { available: boolean }) => {
					setSlugAvailability(result.available ? "available" : "taken");
				})
				.catch(() => {
					setSlugAvailability("idle");
				});
		}, 400);
	};

	const slugIsValid =
		!slugError &&
		(slugAvailability === "available" || slugAvailability === "idle");

	const handleSlugConfirm = () => {
		const trimmed = slugValue.trim();
		const error = validateSlug(trimmed);
		if (error) {
			setSlugError(error);
			return;
		}
		if (slugAvailability === "taken") return;

		publishInvitation(invitation.id, {
			slug: trimmed || invitation.slug,
		});
		setSlugDialogOpen(false);
		setPublishSuccess(true);
	};

	const handleContinueFree = () => {
		publishInvitation(invitation.id, { randomize: true });
		setUpgradeOpen(false);
		setPublishSuccess(true);
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
								onClick={handleContinueFree}
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
							onChange={(e) => handleSlugChange(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && slugIsValid) handleSlugConfirm();
							}}
							className={`mt-1 w-full rounded-lg bg-[color:var(--dm-bg)] px-3 py-2 text-sm text-[color:var(--dm-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60 ${
								slugError || slugAvailability === "taken"
									? "border border-[color:var(--dm-error)]"
									: slugAvailability === "available"
										? "border border-green-500"
										: "border border-[color:var(--dm-border)]"
							}`}
							aria-invalid={!!slugError || slugAvailability === "taken"}
							aria-describedby={slugFeedbackId}
							autoComplete="off"
						/>
						<p
							id={slugFeedbackId}
							className={`mt-1 text-xs ${
								slugError || slugAvailability === "taken"
									? "text-[color:var(--dm-error)]"
									: slugAvailability === "available"
										? "text-green-600"
										: slugAvailability === "checking"
											? "text-[color:var(--dm-muted)]"
											: "text-transparent"
							}`}
							aria-live="polite"
						>
							{slugError ||
								(slugAvailability === "taken"
									? "Already taken"
									: slugAvailability === "available"
										? "Available"
										: slugAvailability === "checking"
											? "Checking..."
											: "\u00A0")}
						</p>
						<div className="mt-3 flex gap-3">
							<button
								type="button"
								className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={() => setSlugDialogOpen(false)}
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={
									!!slugError ||
									slugAvailability === "taken" ||
									slugAvailability === "checking"
								}
								className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
								onClick={handleSlugConfirm}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Publish success celebration */}
			{publishSuccess && (
				<div
					ref={publishSuccessRef}
					className="dm-inline-edit"
					role="dialog"
					aria-modal="true"
					aria-label="Invitation published"
				>
					<div className="dm-inline-card text-center">
						<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--dm-sage)]/20 text-3xl">
							&#127881;
						</div>
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
							Your invitation is live!
						</p>
						<p className="mt-2 break-all text-sm text-[color:var(--dm-muted)]">
							{`${PUBLIC_BASE_URL}/invite/${invitation.slug}`}
						</p>
						<div className="mt-4 flex gap-3">
							<button
								type="button"
								className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={() => setPublishSuccess(false)}
							>
								Close
							</button>
							<button
								type="button"
								className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
								onClick={handleShare}
							>
								Share Now
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Share modal */}
			<ShareModal
				open={shareModalOpen}
				invitation={invitation}
				onClose={() => setShareModalOpen(false)}
			/>
		</>
	);
}

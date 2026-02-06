import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { buildSampleContent } from "../../data/sample-invitation";
import { generateAiContent } from "../../lib/ai";
import {
	aiUsageLimit,
	getCurrentUser,
	incrementAiUsage,
	markAiGenerationAccepted,
	publishInvitation,
	recordAiGeneration,
	setInvitationVisibility,
	updateInvitation,
	updateInvitationContent,
} from "../../lib/data";
import { uploadImage } from "../../lib/storage";
import { useStore } from "../../lib/store";
import type { InvitationContent } from "../../lib/types";
import { templates } from "../../templates";
import type {
	FieldConfig,
	SectionConfig,
	TemplateConfig,
} from "../../templates/types";

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

const listFieldMap: Record<
	string,
	{ label: string; fields: Array<{ key: string; label: string }> }
> = {
	story: {
		label: "Milestones",
		fields: [
			{ key: "date", label: "Date" },
			{ key: "title", label: "Title" },
			{ key: "description", label: "Description" },
		],
	},
	schedule: {
		label: "Events",
		fields: [
			{ key: "time", label: "Time" },
			{ key: "title", label: "Title" },
			{ key: "description", label: "Description" },
		],
	},
	faq: {
		label: "FAQ Items",
		fields: [
			{ key: "question", label: "Question" },
			{ key: "answer", label: "Answer" },
		],
	},
	gallery: {
		label: "Gallery",
		fields: [
			{ key: "url", label: "Image URL" },
			{ key: "caption", label: "Caption" },
		],
	},
	entourage: {
		label: "Entourage",
		fields: [
			{ key: "role", label: "Role" },
			{ key: "name", label: "Name" },
		],
	},
};

const lightTemplates = new Set([
	"garden-romance",
	"eternal-elegance",
	"blush-romance",
]);

function getDefaultSection(sectionId: string, content: InvitationContent) {
	return (content as Record<string, unknown>)[sectionId];
}

function getValueByPath(content: InvitationContent, path: string) {
	const parts = path.split(".");
	let current: unknown = content;
	for (const part of parts) {
		if (current == null) return "";
		if (typeof current !== "object") return "";
		current = (current as Record<string, unknown>)[part];
	}
	if (current == null) return "";
	if (typeof current === "string") return current;
	if (typeof current === "number") return String(current);
	if (typeof current === "boolean") return String(current);
	return "";
}

function setValueByPath(
	content: InvitationContent,
	path: string,
	value: unknown,
) {
	const next = structuredClone(content);
	const parts = path.split(".");
	let current = next as unknown as Record<string, unknown>;
	parts.slice(0, -1).forEach((part) => {
		const existing = current[part];
		if (existing == null || typeof existing !== "object") {
			current[part] = {};
		}
		current = current[part] as Record<string, unknown>;
	});
	current[parts.at(-1) as string] = value;
	return next;
}

function validateField(field: FieldConfig, value: string) {
	if (field.required && !value?.trim()) return `${field.label} is required`;
	if (field.type === "date" && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return "Use YYYY-MM-DD format";
	}
	if (field.id.toLowerCase().includes("email") && value) {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email";
	}
	return "";
}

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const media = window.matchMedia(query);
		const handler = () => setMatches(media.matches);
		handler();
		media.addEventListener("change", handler);
		return () => media.removeEventListener("change", handler);
	}, [query]);
	return matches;
}

export function EditorScreen() {
	const { invitationId } = Route.useParams();
	const navigate = useNavigate();
	const invitation = useStore((store) =>
		store.invitations.find((item) => item.id === invitationId),
	);
	const user = getCurrentUser();
	const isMobile = useMediaQuery("(max-width: 768px)");
	const template = useMemo<TemplateConfig | undefined>(
		() => templates.find((item) => item.id === invitation?.templateId),
		[invitation?.templateId],
	);
	const isLightTemplate = lightTemplates.has(template?.id ?? "blush-romance");
	const initialContent = useMemo(
		() => invitation?.content ?? buildSampleContent("blush-romance"),
		[invitation?.content],
	);
	const [draft, setDraft] = useState<InvitationContent>(initialContent);
	const [sectionVisibility, setSectionVisibility] = useState<
		Record<string, boolean>
	>(invitation?.sectionVisibility ?? {});
	const [activeSection, setActiveSection] = useState<string>(
		template?.sections[0]?.id ?? "hero",
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [history, setHistory] = useState<InvitationContent[]>([]);
	const [future, setFuture] = useState<InvitationContent[]>([]);
	const [previewMode, setPreviewMode] = useState(false);
	const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);
	const [aiPanel, setAiPanel] = useState<AiPanelState>({
		open: false,
		sectionId: "schedule",
		prompt: "",
		type: "schedule",
	});
	const [autosaveAt, setAutosaveAt] = useState<string>("");
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [lastSavedSnapshot, setLastSavedSnapshot] = useState(
		JSON.stringify(initialContent),
	);
	const styleOverrides = (invitation.designOverrides ?? {}) as Record<
		string,
		string
	>;

	const previewRef = useRef<HTMLDivElement | null>(null);
	const draftRef = useRef(draft);
	const visibilityRef = useRef(sectionVisibility);

	useEffect(() => {
		draftRef.current = draft;
	}, [draft]);

	useEffect(() => {
		visibilityRef.current = sectionVisibility;
	}, [sectionVisibility]);

	useEffect(() => {
		if (!invitation) return;
		setDraft(invitation.content);
		setSectionVisibility(invitation.sectionVisibility);
		setActiveSection(template?.sections[0]?.id ?? "hero");
		setHistory([]);
		setFuture([]);
	}, [invitation, template?.sections[0]?.id]);

	useEffect(() => {
		if (!invitation) return;
		const interval = window.setInterval(() => {
			updateInvitationContent(invitation.id, draftRef.current);
			setInvitationVisibility(invitation.id, visibilityRef.current);
			setAutosaveAt(new Date().toLocaleTimeString());
			setLastSavedSnapshot(JSON.stringify(draftRef.current));
		}, 30000);
		return () => window.clearInterval(interval);
	}, [invitation]);

	const hasUnsavedChanges = JSON.stringify(draft) !== lastSavedSnapshot;

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!hasUnsavedChanges) return;
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const handler = (event: BeforeUnloadEvent) => {
			if (!hasUnsavedChanges) return;
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [hasUnsavedChanges]);

	useEffect(() => {
		if (!previewRef.current) return;
		const root = previewRef.current;
		const sections = Array.from(
			root.querySelectorAll<HTMLElement>("[data-section]"),
		);
		if (!sections.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(
							entry.target.getAttribute("data-section") ?? "hero",
						);
					}
				});
			},
			{ root, threshold: 0.4 },
		);
		sections.forEach((section) => {
			observer.observe(section);
		});
		return () => observer.disconnect();
	}, []);

	const hiddenSections = useMemo(() => {
		const hidden: Record<string, boolean> = {};
		if (template?.sections) {
			template.sections.forEach((section) => {
				const isVisible = sectionVisibility[section.id] ?? true;
				hidden[section.id] = !isVisible;
			});
		}
		return hidden;
	}, [sectionVisibility, template?.sections]);

	if (!user) return <Navigate to="/auth/login" />;
	if (!invitation) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-10">
				<p className="text-sm text-[color:var(--dm-muted)]">
					Invitation not found.
				</p>
			</div>
		);
	}

	const canUndo = history.length > 0;
	const canRedo = future.length > 0;
	const planLimit = aiUsageLimit(user.plan);
	const remainingAi = Math.max(0, planLimit - invitation.aiGenerationsUsed);

	const updateDraft = (next: InvitationContent) => {
		setHistory((prev) => [...prev.slice(-19), draft]);
		setFuture([]);
		setDraft(next);
	};

	const handleUndo = () => {
		if (!canUndo) return;
		const previous = history[history.length - 1];
		setHistory((prev) => prev.slice(0, -1));
		setFuture((prev) => [draft, ...prev].slice(0, 20));
		setDraft(previous);
	};

	const handleRedo = () => {
		if (!canRedo) return;
		const next = future[0];
		setFuture((prev) => prev.slice(1));
		setHistory((prev) => [...prev.slice(-19), draft]);
		setDraft(next);
	};

	const handleFieldChange = (fieldPath: string, value: string | boolean) => {
		const normalized =
			typeof value === "string" && fieldPath.endsWith("maxPlusOnes")
				? Number(value || 0)
				: value;
		const next = setValueByPath(draft, fieldPath, normalized);
		updateDraft(next);
	};

	const handleInlineSave = () => {
		if (!inlineEdit) return;
		const next = setValueByPath(draft, inlineEdit.fieldPath, inlineEdit.value);
		updateDraft(next);
		setInlineEdit(null);
	};

	const handleImageUpload = async (fieldPath: string, file: File) => {
		const uploaded = await uploadImage(file);
		handleFieldChange(fieldPath, uploaded.url);
	};

	const handlePublish = () => {
		const isPremium = user.plan === "premium";
		if (!isPremium) {
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

	const activeSectionConfig: SectionConfig | undefined =
		template?.sections.find((section) => section.id === activeSection);

	const handleAiGenerate = async () => {
		if (remainingAi <= 0) {
			setAiPanel((prev) => ({
				...prev,
				error: "AI limit reached. Upgrade for more.",
			}));
			return;
		}
		setAiPanel((prev) => ({ ...prev, error: undefined }));
		const result = await generateAiContent({
			type: aiPanel.type,
			sectionId: aiPanel.sectionId,
			prompt: aiPanel.prompt,
			context: draft,
		});
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
	};

	const handleAiApply = () => {
		if (!aiPanel.result) return;
		const next = structuredClone(draft);
		if (aiPanel.type === "style") {
			const overrides = (aiPanel.result?.cssVars ?? aiPanel.result) as Record<
				string,
				string
			>;
			updateInvitation(invitation.id, { designOverrides: overrides });
		} else if (aiPanel.type === "translate") {
			next.announcement.formalText = String(aiPanel.result.translation ?? "");
			updateDraft(next);
		} else if (aiPanel.sectionId === "schedule") {
			next.schedule.events = (aiPanel.result.events ??
				[]) as InvitationContent["schedule"]["events"];
			updateDraft(next);
		} else if (aiPanel.sectionId === "faq") {
			next.faq.items = (aiPanel.result.items ??
				[]) as InvitationContent["faq"]["items"];
			updateDraft(next);
		} else if (aiPanel.sectionId === "story") {
			next.story.milestones = (aiPanel.result.milestones ??
				[]) as InvitationContent["story"]["milestones"];
			updateDraft(next);
		} else if (aiPanel.sectionId === "hero") {
			next.hero.tagline = String(aiPanel.result.tagline ?? "");
			updateDraft(next);
		}
		if (aiPanel.generationId) markAiGenerationAccepted(aiPanel.generationId);
		setAiPanel((prev) => ({ ...prev, result: undefined }));
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
		setAiPanel({
			open: true,
			sectionId,
			prompt: "",
			type: defaultType,
		});
	};

	const handleInlineEdit = (fieldPath: string) => {
		if (!isMobile) return;
		setInlineEdit({
			fieldPath,
			value: String(getValueByPath(draft, fieldPath) ?? ""),
		});
	};

	const renderListEditor = (sectionId: string) => {
		const listConfig = listFieldMap[sectionId];
		if (!listConfig) return null;
		const listValue = (getDefaultSection(sectionId, draft) ?? {}) as Record<
			string,
			unknown
		>;
		const items =
			sectionId === "story"
				? listValue.milestones
				: sectionId === "schedule"
					? listValue.events
					: sectionId === "faq"
						? listValue.items
						: sectionId === "gallery"
							? listValue.photos
							: listValue.members;
		const safeItems = (Array.isArray(items) ? items : []) as Array<
			Record<string, unknown>
		>;

		const updateItems = (nextItems: Array<Record<string, unknown>>) => {
			const next = structuredClone(draft);
			if (sectionId === "story") {
				next.story.milestones = nextItems as typeof next.story.milestones;
			}
			if (sectionId === "schedule") {
				next.schedule.events = nextItems as typeof next.schedule.events;
			}
			if (sectionId === "faq") {
				next.faq.items = nextItems as typeof next.faq.items;
			}
			if (sectionId === "gallery") {
				next.gallery.photos = nextItems as typeof next.gallery.photos;
			}
			if (sectionId === "entourage") {
				next.entourage.members = nextItems as typeof next.entourage.members;
			}
			updateDraft(next);
		};

		return (
			<div className="space-y-3">
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
					{listConfig.label}
				</p>
				{safeItems.map((item, index) => (
					<div
						key={`${sectionId}-${JSON.stringify(item)}`}
						className="grid gap-2 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4"
					>
						{listConfig.fields.map((field) => (
							<label
								key={field.key}
								className="grid gap-1 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
							>
								{field.label}
								<input
									name={`${sectionId}.${field.key}.${index}`}
									autoComplete="off"
									value={String(item[field.key] ?? "")}
									onChange={(event) => {
										const nextItems = safeItems.map((currentItem, itemIndex) =>
											itemIndex === index
												? { ...currentItem, [field.key]: event.target.value }
												: currentItem,
										);
										updateItems(nextItems);
									}}
									className="h-10 rounded-xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-3 text-base text-[color:var(--dm-ink)]"
								/>
							</label>
						))}
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
							onClick={() =>
								updateItems(safeItems.filter((_, i) => i !== index))
							}
						>
							Remove
						</button>
					</div>
				))}
				<button
					type="button"
					className="rounded-full border border-[color:var(--dm-accent-strong)]/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
					onClick={() =>
						updateItems([
							...safeItems,
							Object.fromEntries(
								listConfig.fields.map((field) => [field.key, ""]),
							),
						])
					}
				>
					Add Item
				</button>
			</div>
		);
	};

	const renderField = (sectionId: string, field: FieldConfig) => {
		const fieldPath = `${sectionId}.${field.id}`;
		const value = String(getValueByPath(draft, fieldPath) ?? "");
		const error = errors[fieldPath];

		if (field.type === "list") {
			return renderListEditor(sectionId);
		}

		if (field.type === "toggle") {
			const checked = Boolean(getValueByPath(draft, fieldPath));
			return (
				<label className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-3">
					<span className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						{field.label}
					</span>
					<input
						type="checkbox"
						checked={checked}
						onChange={(event) =>
							handleFieldChange(fieldPath, event.target.checked)
						}
						className="h-5 w-5"
					/>
				</label>
			);
		}

		if (field.type === "image") {
			return (
				<div className="space-y-2">
					<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						{field.label}
					</p>
					<input
						type="file"
						accept="image/*"
						name={fieldPath}
						aria-label={field.label}
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) void handleImageUpload(fieldPath, file);
						}}
						className="w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 py-3 text-base text-[color:var(--dm-ink)]"
					/>
					{value && (
						<img
							src={value}
							alt="Uploaded"
							width={320}
							height={128}
							className="h-32 w-full rounded-2xl object-cover"
							loading="lazy"
						/>
					)}
					{value ? (
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
							onClick={() => handleFieldChange(fieldPath, "")}
						>
							Remove Image
						</button>
					) : null}
				</div>
			);
		}

		const inputProps = {
			value,
			onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
				handleFieldChange(fieldPath, event.target.value),
			onBlur: () => {
				const nextError = validateField(field, value);
				setErrors((prev) => ({ ...prev, [fieldPath]: nextError }));
			},
			name: fieldPath,
			autoComplete: "off",
			className:
				"h-11 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60",
		};

		const inputId = fieldPath.replace(/\./g, "-");

		return (
			<div className="grid gap-2">
				<label
					htmlFor={inputId}
					className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
				>
					{field.label}
				</label>
				{field.type === "textarea" ? (
					<textarea
						{...inputProps}
						id={inputId}
						className="min-h-[110px] w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 py-3 text-base text-[color:var(--dm-ink)]"
					/>
				) : (
					<input
						{...inputProps}
						id={inputId}
						type={
							field.type === "date"
								? "date"
								: field.type === "time"
									? "time"
									: "text"
						}
					/>
				)}
				{error ? (
					<output className="text-[11px] text-[#b91c1c]" aria-live="polite">
						{error}
					</output>
				) : null}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-4 py-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
							Editor
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-[color:var(--dm-ink)]">
							{invitation.title}
						</h1>
					</div>
					<div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
						<Link
							to="/dashboard"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
						>
							Dashboard
						</Link>
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
							onClick={handleUndo}
							disabled={!canUndo}
						>
							Undo
						</button>
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
							onClick={handleRedo}
							disabled={!canRedo}
						>
							Redo
						</button>
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-[color:var(--dm-ink)]"
							onClick={() => setPreviewMode(true)}
						>
							Preview
						</button>
						<button
							type="button"
							className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-[color:var(--dm-on-accent)]"
							onClick={handlePublish}
						>
							Publish
						</button>
					</div>
				</div>
				{!previewMode && (
				<>
					<p className="text-xs text-[color:var(--dm-muted)]">
						AI Usage: {invitation.aiGenerationsUsed}/{planLimit} · Autosave{" "}
						{autosaveAt || "Pending"}
					</p>
					<div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
						<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-4 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)]">
							<div className="flex items-center justify-between">
								<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
									Live Preview
								</p>
								{isMobile && (
									<button
										type="button"
										className="rounded-full border border-[color:var(--dm-border)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
										onClick={() => setPreviewMode((prev) => !prev)}
									>
										{previewMode ? "Edit" : "Preview"}
									</button>
								)}
							</div>
							<div
								ref={previewRef}
								className="mt-4 overflow-y-auto rounded-3xl border border-[color:var(--dm-border)] lg:max-h-[calc(100vh-8rem)]"
								style={styleOverrides}
							>
								<InvitationRenderer
									templateId={template?.id ?? "blush-romance"}
									content={draft}
									hiddenSections={hiddenSections}
									mode="editor"
									onSectionSelect={(sectionId) => setActiveSection(sectionId)}
									onAiClick={openAiPanel}
									onInlineEdit={handleInlineEdit}
								/>
							</div>
						</div>

						{!isMobile || !previewMode ? (
							<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-5">
								<div className="flex items-center justify-between">
									<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
										Section Editor
									</p>
									<button
										type="button"
										className="rounded-full border border-[color:var(--dm-border)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
										onClick={() => openAiPanel(activeSection)}
									>
										AI Helper
									</button>
								</div>
								<div className="mt-4 space-y-4">
									<p className="text-sm text-[color:var(--dm-muted)]">
										Active: {activeSectionConfig?.id ?? activeSection}
									</p>
									<div className="space-y-3">
										{template?.sections.map((section) => (
											<label
												key={section.id}
												className="flex items-center justify-between rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
											>
												<span>{section.id}</span>
												<input
													type="checkbox"
													checked={sectionVisibility[section.id] ?? true}
													onChange={(event) =>
														setSectionVisibility((prev) => ({
															...prev,
															[section.id]: event.target.checked,
														}))
													}
												/>
											</label>
										))}
									</div>
									<div className="mt-6 space-y-4">
										{activeSectionConfig?.fields.map((field) => (
											<div key={field.id}>
												{renderField(activeSectionConfig.id, field)}
											</div>
										))}
									</div>
								</div>
							</div>
						) : null}
					</div>
				</>
			)}
			</div>

			{inlineEdit && (
				<div className="dm-inline-edit">
					<div className="dm-inline-card">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
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

			{aiPanel.open && (
				<div className="dm-inline-edit">
					<div className="dm-inline-card">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
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
								setAiPanel((prev) => ({ ...prev, prompt: event.target.value }))
							}
							placeholder="Describe what you want (e.g., “Romantic schedule”)…"
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
								className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={handleAiGenerate}
							>
								Generate
							</button>
							<button
								type="button"
								className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
								onClick={handleAiApply}
								disabled={!aiPanel.result}
							>
								Apply
							</button>
							<button
								type="button"
								className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
								onClick={() => setAiPanel((prev) => ({ ...prev, open: false }))}
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
							content={draft}
							hiddenSections={hiddenSections}
							mode="preview"
						/>
					</div>
				</div>
			)}

			{upgradeOpen && (
				<div className="dm-inline-edit">
					<div className="dm-inline-card">
						<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
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
		</div>
	);
}

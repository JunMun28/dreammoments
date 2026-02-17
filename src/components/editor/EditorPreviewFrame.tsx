import type { RefObject } from "react";
import { useState } from "react";
import type { InvitationContent } from "../../lib/types";
import { cn } from "../../lib/utils";
import InvitationRenderer from "../templates/InvitationRenderer";
import type { PreviewLayout } from "./LayoutToggle";

type BuilderViewport = "phone" | "web";

type EditorPreviewFrameProps = {
	templateId: string;
	content: InvitationContent;
	hiddenSections: Record<string, boolean>;
	activeSection: string;
	styleOverrides?: Record<string, string>;
	onSectionSelect: (sectionId: string) => void;
	onAiClick: (sectionId: string) => void;
	onInlineEdit: (fieldPath: string) => void;
	previewRef: RefObject<HTMLDivElement | null>;
	previewLayout?: PreviewLayout;
	showBuilderChrome?: boolean;
};

export function EditorPreviewFrame({
	templateId,
	content,
	hiddenSections,
	activeSection,
	styleOverrides,
	onSectionSelect,
	onAiClick,
	onInlineEdit,
	previewRef,
	previewLayout = "web",
	showBuilderChrome = false,
}: EditorPreviewFrameProps) {
	const isMobilePreview = previewLayout === "mobile";
	const [builderViewport, setBuilderViewport] = useState<BuilderViewport>(
		isMobilePreview ? "phone" : "web",
	);
	const [showGrid, setShowGrid] = useState(true);
	const frameIsPhone = builderViewport === "phone";

	if (!showBuilderChrome) {
		return (
			<div
				ref={previewRef}
				className={cn(
					"dm-scroll-hidden h-full rounded-3xl border border-dm-border mx-auto",
					isMobilePreview ? "max-w-[390px]" : "max-w-[900px]",
				)}
				style={{
					...styleOverrides,
					...(isMobilePreview ? { minHeight: "640px" } : {}),
				}}
				data-active-section={activeSection}
				data-preview-layout={previewLayout}
			>
				<InvitationRenderer
					templateId={templateId}
					content={content}
					hiddenSections={hiddenSections}
					mode="editor"
					onSectionSelect={onSectionSelect}
					onAiClick={onAiClick}
					onInlineEdit={onInlineEdit}
				/>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"relative h-full overflow-hidden rounded-3xl border border-dm-border",
				showGrid
					? "bg-[color:var(--dm-surface-muted)]"
					: "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(245,245,245,0.8))]",
			)}
		>
			<div className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full border border-dm-border bg-dm-bg/90 p-1 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.45)] backdrop-blur">
				<button
					type="button"
					onClick={() => setBuilderViewport("phone")}
					className={cn(
						"rounded-full px-3 py-1.5 text-xs font-medium transition",
						frameIsPhone
							? "bg-dm-ink text-white"
							: "text-dm-ink-muted hover:text-dm-ink",
					)}
				>
					Phone
				</button>
				<button
					type="button"
					onClick={() => setBuilderViewport("web")}
					className={cn(
						"rounded-full px-3 py-1.5 text-xs font-medium transition",
						!frameIsPhone
							? "bg-dm-ink text-white"
							: "text-dm-ink-muted hover:text-dm-ink",
					)}
				>
					Web
				</button>
				<button
					type="button"
					onClick={() => setShowGrid((prev) => !prev)}
					aria-pressed={showGrid}
					className={cn(
						"rounded-full px-3 py-1.5 text-xs font-medium transition",
						showGrid
							? "bg-dm-primary-soft text-dm-ink"
							: "text-dm-ink-muted hover:text-dm-ink",
					)}
				>
					Grid
				</button>
			</div>

			<div
				className={cn(
					"h-full overflow-auto px-6 pb-8 pt-20",
					showGrid &&
						"bg-[linear-gradient(90deg,_rgba(74,78,85,0.08)_1px,_transparent_1px),linear-gradient(180deg,_rgba(74,78,85,0.08)_1px,_transparent_1px)] bg-[length:24px_24px]",
				)}
			>
				<div
					className={cn(
						"mx-auto w-full transition-[max-width] duration-300",
						frameIsPhone ? "max-w-[390px]" : "max-w-[900px]",
					)}
				>
					<div
						ref={previewRef}
						className="dm-scroll-hidden overflow-y-auto rounded-[2rem] border border-dm-border bg-dm-surface shadow-[0_24px_80px_-34px_rgba(0,0,0,0.55)]"
						style={{
							...styleOverrides,
							height: frameIsPhone
								? "min(78dvh, 760px)"
								: "calc(100dvh - 220px)",
							minHeight: frameIsPhone ? "640px" : "560px",
						}}
						data-active-section={activeSection}
						data-preview-layout={frameIsPhone ? "mobile" : "web"}
					>
						<InvitationRenderer
							templateId={templateId}
							content={content}
							hiddenSections={hiddenSections}
							mode="editor"
							onSectionSelect={onSectionSelect}
							onAiClick={onAiClick}
							onInlineEdit={onInlineEdit}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

import type { RefObject } from "react";
import type { InvitationContent } from "../../lib/types";
import { cn } from "../../lib/utils";
import InvitationRenderer from "../templates/InvitationRenderer";
import type { PreviewLayout } from "./LayoutToggle";

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
}: EditorPreviewFrameProps) {
	const isMobilePreview = previewLayout === "mobile";

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

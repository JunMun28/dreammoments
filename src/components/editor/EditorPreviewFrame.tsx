import type { RefObject } from "react";
import type { InvitationContent } from "../../lib/types";
import InvitationRenderer from "../templates/InvitationRenderer";

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
}: EditorPreviewFrameProps) {
	return (
		<div
			ref={previewRef}
			className="h-full overflow-y-auto rounded-3xl border border-[color:var(--dm-border)]"
			style={styleOverrides}
			data-active-section={activeSection}
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

export default EditorPreviewFrame;

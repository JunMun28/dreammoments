import { useRef } from "react";
import { useFocusTrap } from "@/components/editor/hooks/useFocusTrap";
import InvitationRenderer from "@/components/templates/InvitationRenderer";

interface PreviewDialogProps {
	open: boolean;
	onClose: () => void;
	templateId: string;
	content: Record<string, unknown>;
	hiddenSections: string[];
	isLightTemplate: boolean;
	styleOverrides: Record<string, string>;
	onShare: () => void;
}

export function PreviewDialog({
	open,
	onClose,
	templateId,
	content,
	hiddenSections,
	isLightTemplate,
	styleOverrides,
	onShare,
}: PreviewDialogProps) {
	const dialogRef = useRef<HTMLDivElement | null>(null);

	useFocusTrap(dialogRef, {
		enabled: open,
		onEscape: onClose,
	});

	if (!open) return null;

	return (
		<div
			ref={dialogRef}
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
					onClick={onClose}
					aria-label="Switch to edit mode"
				>
					Back to Edit
				</button>
				<button
					type="button"
					className="rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					onClick={onShare}
				>
					Share
				</button>
			</div>
			<div className="dm-preview-body" style={styleOverrides}>
				<InvitationRenderer
					templateId={templateId}
					content={content}
					hiddenSections={hiddenSections}
					mode="preview"
				/>
			</div>
		</div>
	);
}

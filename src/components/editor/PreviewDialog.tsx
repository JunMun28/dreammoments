import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useRef, useState } from "react";
import { useFocusTrap } from "@/components/editor/hooks/useFocusTrap";
import InvitationRenderer from "@/components/templates/InvitationRenderer";
import type { InvitationContent } from "@/lib/types";
import { cn } from "@/lib/utils";

type DeviceFrame = "phone" | "tablet" | "desktop";

const DEVICE_WIDTHS: Record<DeviceFrame, string> = {
	phone: "max-w-[390px]",
	tablet: "max-w-[768px]",
	desktop: "max-w-full",
};

interface PreviewDialogProps {
	open: boolean;
	onClose: () => void;
	templateId: string;
	content: InvitationContent;
	hiddenSections: Record<string, boolean>;
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
	const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>("phone");

	useFocusTrap(dialogRef, {
		enabled: open,
		onEscape: onClose,
	});

	if (!open) return null;

	const deviceButtons: Array<{
		value: DeviceFrame;
		label: string;
		icon: typeof Smartphone;
	}> = [
		{ value: "phone", label: "Phone", icon: Smartphone },
		{ value: "tablet", label: "Tablet", icon: Tablet },
		{ value: "desktop", label: "Desktop", icon: Monitor },
	];

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
					className="min-h-11 min-w-11 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
					onClick={onClose}
					aria-label="Switch to edit mode"
				>
					Back to Edit
				</button>

				<div className="hidden items-center gap-1 rounded-full border border-[color:var(--dm-border)] p-1 md:flex">
					{deviceButtons.map(({ value, label, icon: Icon }) => (
						<button
							key={value}
							type="button"
							onClick={() => setDeviceFrame(value)}
							aria-pressed={deviceFrame === value}
							aria-label={`Preview as ${label}`}
							className={cn(
								"inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
								deviceFrame === value
									? "bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]"
									: "text-[color:var(--dm-muted)] hover:bg-[color:var(--dm-surface-muted)]",
							)}
						>
							<Icon className="h-4 w-4" aria-hidden="true" />
						</button>
					))}
				</div>

				<button
					type="button"
					className="min-h-11 min-w-11 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					onClick={onShare}
				>
					Share
				</button>
			</div>
			<div
				className={cn(
					"dm-preview-body mx-auto transition-all duration-300",
					DEVICE_WIDTHS[deviceFrame],
				)}
				style={styleOverrides}
			>
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

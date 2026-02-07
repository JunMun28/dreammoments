import type { ReactNode } from "react";

type EditorLayoutProps = {
	toolbar: ReactNode;
	preview: ReactNode;
	pillBar: ReactNode;
	contextPanel: ReactNode;
	sectionRail?: ReactNode;
	isMobile: boolean;
	isTablet: boolean;
	bottomSheetOpen: boolean;
};

export function EditorLayout({
	toolbar,
	preview,
	pillBar,
	contextPanel,
	sectionRail,
	isMobile,
	isTablet,
	bottomSheetOpen,
}: EditorLayoutProps) {
	// Mobile layout: toolbar (sticky top) + preview (flex-1) + pillBar (sticky bottom)
	if (isMobile) {
		return (
			<div className="flex h-[100dvh] flex-col bg-[color:var(--dm-bg)]">
				{/* Sticky toolbar at top */}
				<div className="shrink-0">{toolbar}</div>

				{/* Scrollable preview area */}
				<div className="min-h-0 flex-1">{preview}</div>

				{/* Sticky pill bar at bottom */}
				<div className="shrink-0 border-t border-[color:var(--dm-border)] bg-[color:var(--dm-bg)]">
					{pillBar}
				</div>

				{/* Bottom sheet overlays from bottom when open */}
				{bottomSheetOpen && contextPanel}
			</div>
		);
	}

	// Tablet layout: toolbar + preview + collapsible context panel
	if (isTablet) {
		return (
			<div className="flex h-[100dvh] flex-col bg-[color:var(--dm-bg)]">
				<div className="shrink-0">{toolbar}</div>
				<div className="flex min-h-0 flex-1">
					<div className="min-w-0 flex-1">{preview}</div>
					<div className="w-80 shrink-0 overflow-y-auto border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]">
						<div className="border-b border-[color:var(--dm-border)]">
							{pillBar}
						</div>
						{contextPanel}
					</div>
				</div>
			</div>
		);
	}

	// Desktop layout: toolbar + sectionRail + preview + contextPanel
	return (
		<div className="flex h-[100dvh] flex-col bg-[color:var(--dm-bg)]">
			<div className="shrink-0">{toolbar}</div>
			<div
				className="grid min-h-0 flex-1"
				style={{
					gridTemplateColumns: sectionRail ? "64px 1fr 380px" : "1fr 380px",
				}}
			>
				{sectionRail && (
					<div className="overflow-y-auto border-r border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)]">
						{sectionRail}
					</div>
				)}
				<div className="min-w-0 overflow-hidden">{preview}</div>
				<div className="overflow-y-auto border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]">
					<div className="border-b border-[color:var(--dm-border)]">
						{pillBar}
					</div>
					{contextPanel}
				</div>
			</div>
		</div>
	);
}

export default EditorLayout;

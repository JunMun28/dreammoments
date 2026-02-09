import type { ReactNode } from "react";

type EditorLayoutProps = {
	toolbar: ReactNode;
	preview: ReactNode;
	pillBar: ReactNode;
	contextPanel: ReactNode;
	sectionRail?: ReactNode;
	isMobile: boolean;
	isTablet: boolean;
	panelCollapsed?: boolean;
	bottomSheetOpen: boolean;
	onOpenBottomSheet?: () => void;
};

export function EditorLayout({
	toolbar,
	preview,
	pillBar,
	contextPanel,
	sectionRail,
	isMobile,
	isTablet,
	panelCollapsed = false,
	bottomSheetOpen,
	onOpenBottomSheet,
}: EditorLayoutProps) {
	// Non-desktop layout: toolbar (sticky top) + preview (flex-1) + pillBar (sticky bottom) + bottom sheet
	if (isMobile || isTablet) {
		return (
			<div className="flex h-[100dvh] flex-col bg-[color:var(--dm-bg)]">
				{/* Sticky toolbar at top */}
				<div
					className="shrink-0"
					style={{ paddingTop: "env(safe-area-inset-top)" }}
				>
					{toolbar}
				</div>

				{/* Scrollable preview area */}
				<div className="min-h-0 flex-1">{preview}</div>

				{/* Sticky pill bar at bottom (hidden when bottom sheet is open) */}
				{!bottomSheetOpen && (
					<div className="shrink-0 border-t border-[color:var(--dm-border)] bg-[color:var(--dm-bg)]">
						{pillBar}
					</div>
				)}

				{/* Floating edit FAB - visible only when bottom sheet is closed */}
				{!bottomSheetOpen && onOpenBottomSheet && (
					<button
						type="button"
						onClick={onOpenBottomSheet}
						className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.25)] transition-transform active:scale-95"
						style={{ marginBottom: "env(safe-area-inset-bottom)" }}
						aria-label="Open editor"
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							<path d="m15 5 4 4" />
						</svg>
					</button>
				)}

				{/* Bottom sheet overlays from bottom when open */}
				{bottomSheetOpen && contextPanel}
			</div>
		);
	}

	// Desktop / tablet landscape layout
	const panelWidth = panelCollapsed ? "40px" : "380px";
	const columns = sectionRail ? `64px 1fr ${panelWidth}` : `1fr ${panelWidth}`;

	return (
		<div className="flex h-[100dvh] flex-col bg-[color:var(--dm-bg)]">
			<div className="shrink-0">{toolbar}</div>
			<div
				className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1"
				style={{ gridTemplateColumns: columns }}
			>
				{sectionRail && (
					<div className="overflow-y-auto border-r border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)]">
						{sectionRail}
					</div>
				)}
				<div className="min-w-0 overflow-hidden">{preview}</div>
				<div className="flex flex-col overflow-hidden border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]">
					{!panelCollapsed && (
						<div className="shrink-0 border-b border-[color:var(--dm-border)]">
							{pillBar}
						</div>
					)}
					<div className="min-h-0 flex-1">{contextPanel}</div>
				</div>
			</div>
		</div>
	);
}

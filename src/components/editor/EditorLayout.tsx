import type { ReactNode } from "react";

type EditorLayoutProps = {
	toolbar: ReactNode;
	preview: ReactNode;
	pillBar: ReactNode;
	contextPanel: ReactNode;
	sectionRail?: ReactNode;
	isMobile: boolean;
	isTablet: boolean;
	isTabletLandscape?: boolean;
	isMobileLandscape?: boolean;
	panelCollapsed?: boolean;
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
	isTabletLandscape = false,
	isMobileLandscape = false,
	panelCollapsed = false,
	bottomSheetOpen,
}: EditorLayoutProps) {
	// Mobile landscape: split view (60% preview, 40% fields) - no bottom sheet
	if (isMobile && isMobileLandscape) {
		return (
			<div className="flex h-[100dvh] flex-col bg-[color:var(--dm-bg)]">
				<div className="shrink-0">{toolbar}</div>
				<div className="flex min-h-0 flex-1">
					<div className="min-w-0" style={{ flex: "0 0 60%" }}>
						{preview}
					</div>
					<div
						className="overflow-y-auto border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]"
						style={{ flex: "0 0 40%" }}
					>
						<div className="border-b border-[color:var(--dm-border)]">
							{pillBar}
						</div>
						{contextPanel}
					</div>
				</div>
			</div>
		);
	}

	// Mobile portrait layout: toolbar (sticky top) + preview (flex-1) + pillBar (sticky bottom)
	if (isMobile) {
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

				{/* Sticky pill bar at bottom */}
				<div className="shrink-0 border-t border-[color:var(--dm-border)] bg-[color:var(--dm-bg)]">
					{pillBar}
				</div>

				{/* Bottom sheet overlays from bottom when open */}
				{bottomSheetOpen && contextPanel}
			</div>
		);
	}

	// Tablet portrait: 2-column (preview + context panel)
	// Tablet landscape: use 3-column desktop layout
	if (isTablet && !isTabletLandscape) {
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
				<div className="overflow-y-auto border-l border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]">
					{!panelCollapsed && (
						<div className="border-b border-[color:var(--dm-border)]">
							{pillBar}
						</div>
					)}
					{contextPanel}
				</div>
			</div>
		</div>
	);
}

export default EditorLayout;

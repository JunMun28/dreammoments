import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EditorLayoutProps {
	/** Header content (logo, autosave, actions) */
	header: ReactNode;
	/** Left tool sidebar (narrow, icons only) */
	toolSidebar: ReactNode;
	/** Section thumbnails panel */
	thumbnails: ReactNode;
	/** Central canvas panel */
	canvas: ReactNode;
	/** Right properties panel */
	properties: ReactNode;
	/** Bottom filmstrip panel */
	filmstrip: ReactNode;
	/** Optional additional className */
	className?: string;
}

/**
 * Multi-panel editor layout container.
 * Implements a hunbei.com-style layout with 5 main panels:
 * - Header: Top bar spanning full width
 * - Tool Sidebar: Narrow left sidebar with tool icons
 * - Thumbnails: Section miniature previews
 * - Canvas: Central editable preview area
 * - Properties: Right context-sensitive panel
 * - Filmstrip: Bottom horizontal gallery strip
 */
export function EditorLayout({
	header,
	toolSidebar,
	thumbnails,
	canvas,
	properties,
	filmstrip,
	className,
}: EditorLayoutProps) {
	return (
		<div
			className={cn(
				"flex h-screen w-screen flex-col overflow-hidden bg-stone-100",
				className,
			)}
		>
			{/* Header - full width */}
			<header className="z-20 flex-shrink-0 border-b bg-white shadow-sm">
				{header}
			</header>

			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Tool Sidebar - narrow left panel */}
				<aside className="z-10 w-14 flex-shrink-0 border-r bg-white">
					{toolSidebar}
				</aside>

				{/* Section Thumbnails panel */}
				<aside className="hidden w-48 flex-shrink-0 overflow-y-auto border-r bg-white lg:block">
					{thumbnails}
				</aside>

				{/* Central Canvas */}
				<main className="flex-1 overflow-hidden">{canvas}</main>

				{/* Properties Panel - right sidebar */}
				<aside className="hidden w-80 flex-shrink-0 overflow-y-auto border-l bg-white xl:block">
					{properties}
				</aside>
			</div>

			{/* Filmstrip - bottom panel */}
			<footer className="z-10 h-28 flex-shrink-0 border-t bg-white">
				{filmstrip}
			</footer>
		</div>
	);
}

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useRef } from "react";
import { LongPagePreview } from "@/components/LongPagePreview";
import { Button } from "@/components/ui/button";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import { cn } from "@/lib/utils";

/**
 * Zoom level presets
 */
const ZOOM_PRESETS = [0.5, 0.8, 1.0, 1.5, 2.0];
const ZOOM_STEP = 0.1;

/**
 * Central canvas panel with zoomable preview.
 * Wraps LongPagePreview with zoom controls and section click handlers.
 */
export function CanvasPanel() {
	const {
		editorState,
		setZoomLevel,
		setActiveSection,
		setCanvasScrollPosition,
	} = useInvitationBuilder();
	const containerRef = useRef<HTMLDivElement>(null);

	const handleZoomIn = useCallback(() => {
		setZoomLevel(editorState.zoomLevel + ZOOM_STEP);
	}, [editorState.zoomLevel, setZoomLevel]);

	const handleZoomOut = useCallback(() => {
		setZoomLevel(editorState.zoomLevel - ZOOM_STEP);
	}, [editorState.zoomLevel, setZoomLevel]);

	const handleZoomReset = useCallback(() => {
		setZoomLevel(0.8);
	}, [setZoomLevel]);

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const scrollTop = e.currentTarget.scrollTop;
			setCanvasScrollPosition(scrollTop);

			// Detect which section is currently visible
			const sections = [
				"hero",
				"countdown",
				"gallery",
				"schedule",
				"venue",
				"notes",
				"rsvp",
			];
			for (const sectionId of sections) {
				const element = e.currentTarget.querySelector(`#${sectionId}`);
				if (element) {
					const rect = element.getBoundingClientRect();
					const containerRect = e.currentTarget.getBoundingClientRect();
					// Check if section is in the viewport
					if (
						rect.top <= containerRect.top + 200 &&
						rect.bottom >= containerRect.top
					) {
						setActiveSection(sectionId as typeof editorState.activeSection);
						break;
					}
				}
			}
		},
		[setCanvasScrollPosition, setActiveSection],
	);

	const zoomPercentage = Math.round(editorState.zoomLevel * 100);

	return (
		<div className="relative flex h-full flex-col bg-stone-200">
			{/* Canvas viewport */}
			<div
				ref={containerRef}
				className="flex-1 overflow-auto p-8"
				onScroll={handleScroll}
			>
				<div
					className="mx-auto origin-top transition-transform duration-200"
					style={{
						transform: `scale(${editorState.zoomLevel})`,
						width: `${100 / editorState.zoomLevel}%`,
						maxWidth: `${600 / editorState.zoomLevel}px`,
					}}
				>
					<div className="overflow-hidden rounded-lg shadow-2xl">
						<LongPagePreview viewportMode="desktop" showNav={false} />
					</div>
				</div>
			</div>

			{/* Zoom controls - bottom right */}
			<div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border bg-white p-2 shadow-md">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={handleZoomOut}
					disabled={editorState.zoomLevel <= 0.5}
				>
					<Minus className="h-4 w-4" />
					<span className="sr-only">Zoom out</span>
				</Button>

				<span className="min-w-[50px] text-center text-sm font-medium text-stone-600">
					{zoomPercentage}%
				</span>

				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={handleZoomIn}
					disabled={editorState.zoomLevel >= 2.0}
				>
					<Plus className="h-4 w-4" />
					<span className="sr-only">Zoom in</span>
				</Button>

				<div className="mx-1 h-6 w-px bg-stone-200" />

				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={handleZoomReset}
					title="Reset zoom to 80%"
				>
					<RotateCcw className="h-4 w-4" />
					<span className="sr-only">Reset zoom</span>
				</Button>
			</div>

			{/* Zoom presets - bottom left */}
			<div className="absolute bottom-4 left-4 hidden items-center gap-1 rounded-lg border bg-white p-1 shadow-md md:flex">
				{ZOOM_PRESETS.map((preset) => (
					<Button
						key={preset}
						variant="ghost"
						size="sm"
						className={cn(
							"h-7 px-2 text-xs",
							Math.abs(editorState.zoomLevel - preset) < 0.05
								? "bg-stone-100 text-stone-900"
								: "text-stone-500",
						)}
						onClick={() => setZoomLevel(preset)}
					>
						{preset * 100}%
					</Button>
				))}
			</div>
		</div>
	);
}

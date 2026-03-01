import {
	type CSSProperties,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { CanvasDocument } from "@/lib/canvas/types";
import { toCssProperties } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "./BlockRenderer";

export interface CanvasEngineProps {
	document: CanvasDocument;
	className?: string;
	animationsEnabled?: boolean;
}

export function CanvasEngine({
	document,
	className,
	animationsEnabled = true,
}: CanvasEngineProps) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const [visibleBlockIds, setVisibleBlockIds] = useState<Set<string>>(
		new Set(),
	);

	const animatedBlockIds = useMemo(
		() =>
			document.blockOrder.filter((blockId) => {
				const block = document.blocksById[blockId];
				return block?.animation && block.animation !== "none";
			}),
		[document],
	);

	useEffect(() => {
		if (!animationsEnabled) {
			setVisibleBlockIds(new Set(document.blockOrder));
			return;
		}
		if (animatedBlockIds.length === 0) return;
		if (typeof IntersectionObserver === "undefined") {
			setVisibleBlockIds(new Set(document.blockOrder));
			return;
		}
		const root = rootRef.current;
		if (!root) return;
		const observer = new IntersectionObserver(
			(entries) => {
				setVisibleBlockIds((prev) => {
					const next = new Set(prev);
					for (const entry of entries) {
						const blockId = entry.target.getAttribute("data-canvas-block-id");
						if (!blockId) continue;
						if (entry.isIntersecting) next.add(blockId);
					}
					return next;
				});
			},
			{
				root,
				threshold: 0.2,
			},
		);
		animatedBlockIds.forEach((blockId) => {
			const node = root.querySelector(`[data-canvas-block-id="${blockId}"]`);
			if (node) observer.observe(node);
		});
		return () => observer.disconnect();
	}, [animatedBlockIds, animationsEnabled, document.blockOrder]);

	const canvasBackground = document.designTokens.colors.background ?? "#ffffff";
	const canvasStyle: CSSProperties = {
		position: "relative",
		width: document.canvas.width,
		height: document.canvas.height,
		backgroundColor: canvasBackground,
		overflow: "hidden",
	};

	return (
		<div
			ref={rootRef}
			className={cn(
				"mx-auto rounded-lg border border-[color:var(--dm-border)] shadow-sm",
				className,
			)}
			style={canvasStyle}
			data-canvas-template={document.templateId}
		>
			{document.blockOrder.map((blockId) => {
				const block = document.blocksById[blockId];
				if (!block) return null;

				const blockStyle: CSSProperties = {
					position: "absolute",
					width: block.size.width,
					height: block.size.height,
					transform: `translate3d(${block.position.x}px, ${block.position.y}px, 0)`,
					zIndex: block.zIndex,
					...toCssProperties(block.style),
				};

				if (
					animationsEnabled &&
					block.animation &&
					block.animation !== "none"
				) {
					const inView = visibleBlockIds.has(block.id);
					if (!inView) {
						blockStyle.opacity = 0;
					} else if (block.animation === "fadeInUp") {
						blockStyle.animation = "dm-canvas-fade-in-up 520ms ease both";
					} else if (block.animation === "fadeIn") {
						blockStyle.animation = "dm-canvas-fade-in 500ms ease both";
					} else if (block.animation === "slideFromLeft") {
						blockStyle.animation = "dm-canvas-slide-left 520ms ease both";
					} else if (block.animation === "slideFromRight") {
						blockStyle.animation = "dm-canvas-slide-right 520ms ease both";
					} else if (block.animation === "scaleIn") {
						blockStyle.animation = "dm-canvas-scale-in 480ms ease both";
					} else if (block.animation === "parallax") {
						blockStyle.animation =
							"dm-canvas-parallax 2600ms ease-in-out infinite";
					}
				}

				if (block.locked) {
					blockStyle.pointerEvents = "none";
				}

				return (
					<div
						key={block.id}
						style={blockStyle}
						data-canvas-block-id={block.id}
						data-canvas-block-type={block.type}
					>
						<BlockRenderer block={block} />
					</div>
				);
			})}
		</div>
	);
}

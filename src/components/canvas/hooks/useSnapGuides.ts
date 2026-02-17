import { useCallback } from "react";
import type { Block, Position, Size } from "@/lib/canvas/types";

export interface GuideLine {
	axis: "x" | "y";
	position: number;
}

export interface SnapResult {
	position: Position;
	guides: GuideLine[];
}

function snapToGrid(value: number, grid: number): number {
	return Math.round(value / grid) * grid;
}

function near(a: number, b: number, threshold: number): boolean {
	return Math.abs(a - b) <= threshold;
}

export function useSnapGuides({
	grid = 8,
	threshold = 6,
}: {
	grid?: number;
	threshold?: number;
} = {}) {
	const calculateSnap = useCallback(
		({
			position,
			size,
			activeBlockId,
			blocks,
			disableSnap,
		}: {
			position: Position;
			size: Size;
			activeBlockId: string;
			blocks: Block[];
			disableSnap?: boolean;
		}): SnapResult => {
			if (disableSnap) {
				return { position, guides: [] };
			}

			let nextX = snapToGrid(position.x, grid);
			let nextY = snapToGrid(position.y, grid);
			const guides: GuideLine[] = [];

			for (const block of blocks) {
				if (block.id === activeBlockId) continue;

				const left = block.position.x;
				const right = block.position.x + block.size.width;
				const centerX = block.position.x + block.size.width / 2;
				const top = block.position.y;
				const bottom = block.position.y + block.size.height;
				const centerY = block.position.y + block.size.height / 2;

				const movingCenterX = position.x + size.width / 2;
				const movingCenterY = position.y + size.height / 2;
				const movingRight = position.x + size.width;
				const movingBottom = position.y + size.height;

				if (near(position.x, left, threshold)) {
					nextX = left;
					guides.push({ axis: "x", position: left });
				}
				if (near(movingRight, right, threshold)) {
					nextX = right - size.width;
					guides.push({ axis: "x", position: right });
				}
				if (near(movingCenterX, centerX, threshold)) {
					nextX = centerX - size.width / 2;
					guides.push({ axis: "x", position: centerX });
				}

				if (near(position.y, top, threshold)) {
					nextY = top;
					guides.push({ axis: "y", position: top });
				}
				if (near(movingBottom, bottom, threshold)) {
					nextY = bottom - size.height;
					guides.push({ axis: "y", position: bottom });
				}
				if (near(movingCenterY, centerY, threshold)) {
					nextY = centerY - size.height / 2;
					guides.push({ axis: "y", position: centerY });
				}
			}

			return {
				position: { x: nextX, y: nextY },
				guides,
			};
		},
		[grid, threshold],
	);

	return {
		calculateSnap,
	};
}

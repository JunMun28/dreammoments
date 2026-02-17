import { useEffect } from "react";
import type { Position } from "@/lib/canvas/types";

export interface UseCanvasKeyboardParams {
	enabled?: boolean;
	selectedBlockIds: string[];
	getPosition: (blockId: string) => Position | null;
	onMove: (blockId: string, position: Position) => void;
	onDelete: (blockId: string) => void;
	onUndo: () => void;
	onRedo: () => void;
	onEscape: () => void;
	onSelectAll?: () => void;
}

export function useCanvasKeyboard({
	enabled = true,
	selectedBlockIds,
	getPosition,
	onMove,
	onDelete,
	onUndo,
	onRedo,
	onEscape,
	onSelectAll,
}: UseCanvasKeyboardParams) {
	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			const active = document.activeElement;
			if (
				active &&
				(active.tagName === "INPUT" ||
					active.tagName === "TEXTAREA" ||
					(active as HTMLElement).isContentEditable)
			) {
				return;
			}

			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
				event.preventDefault();
				if (event.shiftKey) {
					onRedo();
				} else {
					onUndo();
				}
				return;
			}

			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
				if (!onSelectAll) return;
				event.preventDefault();
				onSelectAll();
				return;
			}

			if (event.key === "Escape") {
				event.preventDefault();
				onEscape();
				return;
			}

			if (event.key === "Backspace" || event.key === "Delete") {
				if (selectedBlockIds.length === 0) return;
				event.preventDefault();
				selectedBlockIds.forEach((blockId) => {
					onDelete(blockId);
				});
				return;
			}

			const isArrow =
				event.key === "ArrowUp" ||
				event.key === "ArrowDown" ||
				event.key === "ArrowLeft" ||
				event.key === "ArrowRight";
			if (!isArrow || selectedBlockIds.length === 0) return;
			event.preventDefault();

			const step = event.shiftKey ? 1 : 8;
			for (const blockId of selectedBlockIds) {
				const current = getPosition(blockId);
				if (!current) continue;
				let nextX = current.x;
				let nextY = current.y;
				if (event.key === "ArrowLeft") nextX -= step;
				if (event.key === "ArrowRight") nextX += step;
				if (event.key === "ArrowUp") nextY -= step;
				if (event.key === "ArrowDown") nextY += step;
				onMove(blockId, { x: nextX, y: nextY });
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		enabled,
		selectedBlockIds,
		getPosition,
		onMove,
		onDelete,
		onUndo,
		onRedo,
		onEscape,
		onSelectAll,
	]);
}

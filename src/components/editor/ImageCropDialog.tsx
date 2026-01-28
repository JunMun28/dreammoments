import { Crop, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * CE-032: Image Crop Dialog
 *
 * Dialog for cropping images on the canvas:
 * - View image with crop overlay
 * - Adjust crop area via drag
 * - Lock aspect ratio option
 * - Preset aspect ratios (Free, 1:1, 4:3, 16:9)
 * - Apply or cancel crop
 */

/**
 * Crop area definition
 */
export interface CropArea {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Aspect ratio presets
 */
const ASPECT_RATIOS = [
	{ id: "free", label: "Free", value: null },
	{ id: "square", label: "1:1", value: 1 },
	{ id: "4-3", label: "4:3", value: 4 / 3 },
	{ id: "16-9", label: "16:9", value: 16 / 9 },
];

interface ImageCropDialogProps {
	/** Whether the dialog is open */
	open: boolean;
	/** Source URL of the image to crop */
	imageSrc: string;
	/** Callback when crop is applied */
	onApply: (crop: CropArea) => void;
	/** Callback when dialog is cancelled */
	onCancel: () => void;
	/** Initial crop area (optional) */
	initialCrop?: CropArea;
}

/**
 * CE-032: Image cropping dialog with aspect ratio controls.
 */
export function ImageCropDialog({
	open,
	imageSrc,
	onApply,
	onCancel,
	initialCrop,
}: ImageCropDialogProps) {
	const defaultCrop: CropArea = { x: 0, y: 0, width: 100, height: 100 };
	const [crop, setCrop] = useState<CropArea>(initialCrop || defaultCrop);
	const [lockAspectRatio, setLockAspectRatio] = useState(false);
	const [activeAspect, setActiveAspect] = useState<string>("free");

	// Reset crop when dialog opens or initialCrop changes
	useEffect(() => {
		if (open) {
			setCrop(initialCrop || defaultCrop);
			setActiveAspect("free");
		}
	}, [open, initialCrop]);

	// Handle keyboard events
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onCancel();
			}
		},
		[onCancel],
	);

	useEffect(() => {
		if (open) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [open, handleKeyDown]);

	const handleAspectClick = (aspectId: string, aspectValue: number | null) => {
		setActiveAspect(aspectId);
		if (aspectValue !== null) {
			setLockAspectRatio(true);
			// Adjust crop to match aspect ratio
			const newHeight = crop.width / aspectValue;
			setCrop((prev) => ({
				...prev,
				height: Math.min(newHeight, 100 - prev.y),
			}));
		} else {
			setLockAspectRatio(false);
		}
	};

	const handleReset = () => {
		setCrop({ x: 0, y: 0, width: 100, height: 100 });
		setActiveAspect("free");
		setLockAspectRatio(false);
	};

	const handleApply = () => {
		onApply(crop);
	};

	if (!open) return null;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Crop className="h-5 w-5" />
						Crop Image
					</DialogTitle>
					<DialogDescription>
						Adjust the crop area and click Apply to crop the image.
					</DialogDescription>
				</DialogHeader>

				{/* Crop Preview Area */}
				<div className="relative mx-auto aspect-video w-full max-w-lg overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
					<img
						src={imageSrc}
						alt="Crop preview"
						className="h-full w-full object-contain"
					/>

					{/* Crop Overlay */}
					<div
						data-testid="crop-area"
						className="absolute border-2 border-dashed border-white bg-white/20"
						style={{
							left: `${crop.x}%`,
							top: `${crop.y}%`,
							width: `${crop.width}%`,
							height: `${crop.height}%`,
						}}
					>
						{/* Corner handles */}
						<div className="absolute -left-1 -top-1 h-3 w-3 rounded-sm bg-white shadow" />
						<div className="absolute -right-1 -top-1 h-3 w-3 rounded-sm bg-white shadow" />
						<div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-sm bg-white shadow" />
						<div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-sm bg-white shadow" />
					</div>
				</div>

				{/* Aspect Ratio Controls */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium">Aspect Ratio</Label>
						<div className="flex items-center gap-2">
							<Label htmlFor="lock-aspect" className="text-xs text-stone-500">
								Lock aspect ratio
							</Label>
							<Switch
								id="lock-aspect"
								checked={lockAspectRatio}
								onCheckedChange={setLockAspectRatio}
								aria-label="Lock aspect ratio"
							/>
						</div>
					</div>

					<div className="flex gap-2">
						{ASPECT_RATIOS.map((ratio) => (
							<button
								key={ratio.id}
								type="button"
								onClick={() => handleAspectClick(ratio.id, ratio.value)}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
									activeAspect === ratio.id
										? "bg-stone-900 text-white"
										: "bg-stone-100 text-stone-600 hover:bg-stone-200"
								}`}
								aria-label={
									ratio.id === "square" ? "1:1 (Square)" : ratio.label
								}
							>
								{ratio.label}
							</button>
						))}
					</div>
				</div>

				<DialogFooter className="flex justify-between sm:justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={handleReset}
						className="gap-2"
					>
						<RotateCcw className="h-4 w-4" />
						Reset
					</Button>

					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="button" onClick={handleApply}>
							Apply
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

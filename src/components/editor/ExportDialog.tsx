import type { Canvas } from "fabric";
import { Download } from "lucide-react";
import { type RefObject, useCallback, useEffect, useId, useState } from "react";
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
import { Slider } from "@/components/ui/slider";

type ExportFormat = "png" | "jpeg";

interface ExportDialogProps {
	/** Whether the dialog is open */
	open: boolean;
	/** Callback when open state changes */
	onOpenChange: (open: boolean) => void;
	/** Reference to the Fabric.js canvas */
	canvasRef: RefObject<Canvas | null>;
}

/**
 * CE-018: Export dialog for exporting canvas to PNG/JPEG image.
 *
 * Features:
 * - Format selection (PNG/JPEG)
 * - Quality slider for JPEG (1-100%)
 * - Live preview of export result
 * - Download button to save file
 */
export function ExportDialog({
	open,
	onOpenChange,
	canvasRef,
}: ExportDialogProps) {
	const qualitySliderId = useId();
	const [format, setFormat] = useState<ExportFormat>("png");
	const [quality, setQuality] = useState(80);
	const [previewUrl, setPreviewUrl] = useState<string>("");

	/**
	 * Generate preview image from canvas
	 */
	const generatePreview = useCallback(() => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const dataUrl = canvas.toDataURL({
			format: format,
			quality: format === "jpeg" ? quality / 100 : 1,
			multiplier: 1,
		});
		setPreviewUrl(dataUrl);
	}, [canvasRef, format, quality]);

	// Update preview when dialog opens or settings change
	useEffect(() => {
		if (open) {
			generatePreview();
		}
	}, [open, generatePreview]);

	/**
	 * Download the exported image
	 */
	const handleDownload = useCallback(() => {
		if (!previewUrl) return;

		// Create timestamp for filename
		const timestamp = new Date()
			.toISOString()
			.slice(0, 19)
			.replace(/[:-]/g, "");
		const filename = `canvas-export-${timestamp}.${format}`;

		// Create download link
		const link = document.createElement("a");
		link.href = previewUrl;
		link.download = filename;
		link.click();

		// Close dialog after download
		onOpenChange(false);
	}, [previewUrl, format, onOpenChange]);

	/**
	 * Handle format radio button change
	 */
	const handleFormatChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormat(e.target.value as ExportFormat);
		},
		[],
	);

	/**
	 * Handle quality slider change
	 */
	const handleQualityChange = useCallback((value: number[]) => {
		setQuality(value[0]);
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Export Canvas</DialogTitle>
					<DialogDescription>
						Export your canvas as an image file.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Format Selection */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Format</Label>
						<div className="flex gap-4">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="format"
									value="png"
									checked={format === "png"}
									onChange={handleFormatChange}
									className="text-stone-900"
								/>
								<span>PNG</span>
							</label>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="format"
									value="jpeg"
									checked={format === "jpeg"}
									onChange={handleFormatChange}
									className="text-stone-900"
								/>
								<span>JPEG</span>
							</label>
						</div>
					</div>

					{/* Quality Slider (JPEG only) */}
					{format === "jpeg" && (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label
									htmlFor={qualitySliderId}
									className="text-sm font-medium"
								>
									Quality
								</Label>
								<span className="text-sm text-stone-600">{quality}%</span>
							</div>
							<Slider
								id={qualitySliderId}
								min={1}
								max={100}
								step={1}
								value={[quality]}
								onValueChange={handleQualityChange}
								aria-label="Quality"
							/>
						</div>
					)}

					{/* Preview */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Preview</Label>
						<div className="flex justify-center rounded-lg border bg-stone-50 p-4">
							{previewUrl ? (
								<img
									src={previewUrl}
									alt="Export preview"
									data-testid="export-preview"
									className="max-h-48 max-w-full rounded shadow"
								/>
							) : (
								<div className="flex h-32 items-center justify-center text-sm text-stone-400">
									No preview available
								</div>
							)}
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleDownload} className="gap-2">
						<Download className="h-4 w-4" />
						Download
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

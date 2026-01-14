import { Download, QrCode } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface QrCodeDialogProps {
	/** The URL to encode in the QR code */
	url: string;
	/** Name of the group (displayed in dialog title) */
	groupName: string;
	/** QR code size in pixels (default: 256) */
	size?: number;
	/** Custom trigger element (default: QR code icon button) */
	children?: ReactNode;
}

/**
 * Dialog component displaying a QR code for an RSVP link with download options.
 *
 * Features:
 * - Generates QR code from URL
 * - Download as PNG or SVG
 * - Displays the URL for reference
 */
export function QrCodeDialog({
	url,
	groupName,
	size = 256,
	children,
}: QrCodeDialogProps) {
	const canvasId = `qr-code-canvas-${groupName.replace(/\s+/g, "-").toLowerCase()}`;

	const handleDownloadPng = () => {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!canvas) return;

		const pngUrl = canvas.toDataURL("image/png");
		const downloadLink = document.createElement("a");
		downloadLink.href = pngUrl;
		downloadLink.download = `rsvp-qr-${groupName.replace(/\s+/g, "-").toLowerCase()}.png`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	};

	const handleDownloadSvg = () => {
		// Get the SVG element
		const svgElement = document.querySelector(
			"[data-testid='qr-code-svg'], .qr-code-svg-container svg",
		);
		if (!svgElement) return;

		// Serialize SVG to string
		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(svgElement);

		// Create blob and download
		const blob = new Blob([svgString], { type: "image/svg+xml" });
		const downloadLink = document.createElement("a");
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = `rsvp-qr-${groupName.replace(/\s+/g, "-").toLowerCase()}.svg`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
		URL.revokeObjectURL(downloadLink.href);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				{children ?? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="QR Code"
					>
						<QrCode className="h-4 w-4" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>QR Code for {groupName}</DialogTitle>
					<DialogDescription>
						Guests can scan this code to access the RSVP page
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-4 py-4">
					{/* QR Code Display */}
					<div className="rounded-lg bg-white p-4 qr-code-svg-container">
						<QRCodeSVG value={url} size={size} level="M" marginSize={2} />
					</div>

					{/* Hidden canvas for PNG download */}
					<div className="hidden">
						<QRCodeCanvas
							id={canvasId}
							value={url}
							size={size}
							level="M"
							marginSize={2}
						/>
					</div>

					{/* URL display */}
					<p className="text-xs text-muted-foreground text-center break-all max-w-full px-2">
						{url}
					</p>

					{/* Download buttons */}
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleDownloadPng}
						>
							<Download className="h-4 w-4" />
							Download PNG
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleDownloadSvg}
						>
							<Download className="h-4 w-4" />
							Download SVG
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

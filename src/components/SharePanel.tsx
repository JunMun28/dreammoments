/**
 * Social sharing panel for wedding invitations
 * Supports WhatsApp, Telegram, copy link, and QR code display
 */

import { Check, Copy, ExternalLink, QrCode } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

interface SharePanelProps {
	/** URL to share */
	shareUrl: string;
	/** Title for the share */
	title?: string;
	/** Description/message for the share */
	message?: string;
	/** Accent color for styling */
	accentColor?: string;
	/** QR code image URL (optional - if provided, shows QR code) */
	qrCodeUrl?: string;
}

/**
 * Social sharing panel with multiple sharing options
 */
export function SharePanel({
	shareUrl,
	title = "You're Invited!",
	message = "We'd love for you to join us on our special day!",
	accentColor = "#b76e79",
	qrCodeUrl,
}: SharePanelProps) {
	const [copied, setCopied] = useState(false);

	// Copy link to clipboard
	const copyLink = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	}, [shareUrl]);

	// Generate WhatsApp share URL
	const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${message}\n\n${shareUrl}`)}`;

	// Generate Telegram share URL
	const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${title}\n\n${message}`)}`;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Share Your Invitation</CardTitle>
				<CardDescription>
					Send your wedding invitation to friends and family
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Copy link */}
				<div className="flex gap-2">
					<Input value={shareUrl} readOnly className="text-sm" />
					<Button
						variant="outline"
						size="icon"
						onClick={copyLink}
						className="shrink-0"
					>
						{copied ? (
							<Check className="h-4 w-4 text-green-500" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* Social share buttons */}
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						className="w-full justify-start"
						onClick={() => window.open(whatsAppUrl, "_blank")}
					>
						<div
							className="h-5 w-5 mr-2 rounded flex items-center justify-center text-white text-xs font-bold"
							style={{ backgroundColor: "#25D366" }}
						>
							W
						</div>
						WhatsApp
					</Button>

					<Button
						variant="outline"
						className="w-full justify-start"
						onClick={() => window.open(telegramUrl, "_blank")}
					>
						<div
							className="h-5 w-5 mr-2 rounded flex items-center justify-center text-white text-xs font-bold"
							style={{ backgroundColor: "#0088cc" }}
						>
							T
						</div>
						Telegram
					</Button>
				</div>

				{/* QR Code */}
				{qrCodeUrl && (
					<div className="pt-4 border-t">
						<p className="text-sm font-medium mb-3 flex items-center gap-2">
							<QrCode className="h-4 w-4" />
							QR Code
						</p>
						<div className="flex justify-center p-4 bg-white rounded-lg border">
							<img
								src={qrCodeUrl}
								alt="QR Code for invitation"
								className="w-32 h-32"
							/>
						</div>
						<p className="text-xs text-center text-muted-foreground mt-2">
							Guests can scan this to view your invitation
						</p>
					</div>
				)}

				{/* Native share (mobile) */}
				{typeof navigator !== "undefined" && "share" in navigator && (
					<Button
						className="w-full"
						style={{ backgroundColor: accentColor }}
						onClick={() => {
							navigator.share({
								title,
								text: message,
								url: shareUrl,
							});
						}}
					>
						<ExternalLink className="h-4 w-4 mr-2" />
						More Sharing Options
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Form component for guests to submit blessings/messages
 */

import { Heart, Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface BlessingFormProps {
	/** Invitation ID */
	invitationId: string;
	/** Optional parent blessing ID for replies */
	parentId?: string;
	/** Callback when blessing is submitted */
	onSubmit: (data: { authorName: string; message: string }) => Promise<void>;
	/** Whether the form is submitting */
	isSubmitting?: boolean;
	/** Accent color for styling */
	accentColor?: string;
	/** Whether the theme is dark */
	isDark?: boolean;
	/** Placeholder for reply form */
	isReply?: boolean;
}

/**
 * Form for submitting blessings/messages
 */
export function BlessingForm({
	onSubmit,
	isSubmitting = false,
	accentColor = "#b76e79",
	isDark = false,
	isReply = false,
}: BlessingFormProps) {
	const [authorName, setAuthorName] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!authorName.trim()) {
			setError("Please enter your name");
			return;
		}

		if (!message.trim()) {
			setError("Please enter a message");
			return;
		}

		try {
			await onSubmit({
				authorName: authorName.trim(),
				message: message.trim(),
			});
			setAuthorName("");
			setMessage("");
		} catch (_err) {
			setError("Failed to submit message. Please try again.");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<div>
				<Input
					placeholder="Your name"
					value={authorName}
					onChange={(e) => setAuthorName(e.target.value)}
					maxLength={100}
					className={cn(
						isDark &&
							"bg-white/10 border-white/20 text-white placeholder:text-white/50",
					)}
				/>
			</div>
			<div>
				<Textarea
					placeholder={
						isReply
							? "Write your reply..."
							: "Share your blessings and wishes..."
					}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					maxLength={1000}
					rows={isReply ? 2 : 3}
					className={cn(
						isDark &&
							"bg-white/10 border-white/20 text-white placeholder:text-white/50",
					)}
				/>
			</div>
			{error && <p className="text-sm text-red-500">{error}</p>}
			<Button
				type="submit"
				disabled={isSubmitting}
				className="w-full"
				style={{ backgroundColor: accentColor }}
			>
				{isSubmitting ? (
					"Sending..."
				) : isReply ? (
					<>
						<Send className="mr-2 h-4 w-4" />
						Reply
					</>
				) : (
					<>
						<Heart className="mr-2 h-4 w-4" />
						Send Blessing
					</>
				)}
			</Button>
		</form>
	);
}

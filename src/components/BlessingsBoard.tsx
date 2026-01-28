/**
 * Display component for guest blessings/messages
 */

import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Reply } from "lucide-react";
import { useState } from "react";
import type { BlessingData } from "@/lib/blessings-server";
import { cn } from "@/lib/utils";
import { BlessingForm } from "./BlessingForm";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface BlessingsBoardProps {
	/** Invitation ID */
	invitationId: string;
	/** List of blessings to display */
	blessings: BlessingData[];
	/** Callback when a new blessing is submitted */
	onSubmit: (data: {
		authorName: string;
		message: string;
		parentId?: string;
	}) => Promise<void>;
	/** Whether a blessing is being submitted */
	isSubmitting?: boolean;
	/** Accent color for styling */
	accentColor?: string;
	/** Whether the theme is dark */
	isDark?: boolean;
	/** Whether to show the reply form */
	allowReplies?: boolean;
}

/**
 * Single blessing card component
 */
function BlessingCard({
	blessing,
	invitationId,
	onReply,
	isSubmitting,
	accentColor,
	isDark,
	allowReplies,
}: {
	blessing: BlessingData;
	invitationId: string;
	onReply: (
		parentId: string,
		data: { authorName: string; message: string },
	) => Promise<void>;
	isSubmitting: boolean;
	accentColor: string;
	isDark: boolean;
	allowReplies: boolean;
}) {
	const [showReplyForm, setShowReplyForm] = useState(false);

	const handleReply = async (data: { authorName: string; message: string }) => {
		await onReply(blessing.id, data);
		setShowReplyForm(false);
	};

	return (
		<div
			className={cn(
				"rounded-lg p-4",
				isDark ? "bg-white/5" : "bg-white shadow-sm",
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2">
					<div
						className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
						style={{ backgroundColor: accentColor }}
					>
						{blessing.authorName.charAt(0).toUpperCase()}
					</div>
					<div>
						<p className={cn("font-medium text-sm", isDark && "text-white")}>
							{blessing.authorName}
						</p>
						{blessing.createdAt && (
							<p
								className={cn(
									"text-xs",
									isDark ? "text-white/50" : "text-gray-500",
								)}
							>
								{formatDistanceToNow(new Date(blessing.createdAt), {
									addSuffix: true,
								})}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Message */}
			<p className={cn("text-sm", isDark ? "text-white/80" : "text-gray-700")}>
				{blessing.message}
			</p>

			{/* Reply button */}
			{allowReplies && !showReplyForm && (
				<Button
					variant="ghost"
					size="sm"
					className={cn("mt-2", isDark && "text-white/60 hover:text-white")}
					onClick={() => setShowReplyForm(true)}
				>
					<Reply className="mr-1 h-3 w-3" />
					Reply
				</Button>
			)}

			{/* Reply form */}
			{showReplyForm && (
				<div
					className="mt-3 pl-4 border-l-2"
					style={{ borderColor: accentColor }}
				>
					<BlessingForm
						invitationId={invitationId}
						parentId={blessing.id}
						onSubmit={handleReply}
						isSubmitting={isSubmitting}
						accentColor={accentColor}
						isDark={isDark}
						isReply
					/>
					<Button
						variant="ghost"
						size="sm"
						className="mt-2"
						onClick={() => setShowReplyForm(false)}
					>
						Cancel
					</Button>
				</div>
			)}

			{/* Replies */}
			{blessing.replies && blessing.replies.length > 0 && (
				<div
					className="mt-3 pl-4 border-l-2 space-y-3"
					style={{ borderColor: accentColor }}
				>
					{blessing.replies.map((reply) => (
						<div
							key={reply.id}
							className={cn("py-2", isDark && "text-white/80")}
						>
							<div className="flex items-center gap-2 mb-1">
								<p className="font-medium text-sm">{reply.authorName}</p>
								{reply.createdAt && (
									<p
										className={cn(
											"text-xs",
											isDark ? "text-white/50" : "text-gray-500",
										)}
									>
										{formatDistanceToNow(new Date(reply.createdAt), {
											addSuffix: true,
										})}
									</p>
								)}
							</div>
							<p className="text-sm">{reply.message}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Blessings board displaying all messages
 */
export function BlessingsBoard({
	invitationId,
	blessings,
	onSubmit,
	isSubmitting = false,
	accentColor = "#b76e79",
	isDark = false,
	allowReplies = true,
}: BlessingsBoardProps) {
	const handleReply = async (
		parentId: string,
		data: { authorName: string; message: string },
	) => {
		await onSubmit({ ...data, parentId });
	};

	return (
		<div className="space-y-6">
			{/* New blessing form */}
			<div
				className={cn(
					"rounded-lg p-4",
					isDark ? "bg-white/5" : "bg-white shadow-sm",
				)}
			>
				<div className="flex items-center gap-2 mb-3">
					<Heart className="h-5 w-5" style={{ color: accentColor }} />
					<h3 className={cn("font-medium", isDark && "text-white")}>
						Send Your Blessings
					</h3>
				</div>
				<BlessingForm
					invitationId={invitationId}
					onSubmit={onSubmit}
					isSubmitting={isSubmitting}
					accentColor={accentColor}
					isDark={isDark}
				/>
			</div>

			{/* Messages list */}
			{blessings.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-3">
						<MessageCircle className="h-5 w-5" style={{ color: accentColor }} />
						<h3 className={cn("font-medium", isDark && "text-white")}>
							{blessings.length}{" "}
							{blessings.length === 1 ? "Message" : "Messages"}
						</h3>
					</div>
					<ScrollArea className="max-h-[400px]">
						<div className="space-y-3">
							{blessings.map((blessing) => (
								<BlessingCard
									key={blessing.id}
									blessing={blessing}
									invitationId={invitationId}
									onReply={handleReply}
									isSubmitting={isSubmitting}
									accentColor={accentColor}
									isDark={isDark}
									allowReplies={allowReplies}
								/>
							))}
						</div>
					</ScrollArea>
				</div>
			)}

			{/* Empty state */}
			{blessings.length === 0 && (
				<div
					className={cn(
						"text-center py-8",
						isDark ? "text-white/50" : "text-gray-500",
					)}
				>
					<Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
					<p>Be the first to send your blessings!</p>
				</div>
			)}
		</div>
	);
}

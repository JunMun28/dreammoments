import { CircleCheck, Heart, PartyPopper, Users } from "lucide-react";
import { cn } from "../../lib/utils";

export interface RsvpConfirmationProps {
	name: string;
	attendance: "attending" | "not_attending" | "undecided";
	guestCount?: number;
	dietaryRequirements?: string;
	onEdit: () => void;
	className?: string;
}

const messages: Record<RsvpConfirmationProps["attendance"], string> = {
	attending: "We can't wait to celebrate with you!",
	not_attending: "We'll miss you, but thank you for letting us know.",
	undecided: "Take your time - we hope to see you there!",
};

export function RsvpConfirmation({
	name,
	attendance,
	guestCount,
	dietaryRequirements,
	onEdit,
	className,
}: RsvpConfirmationProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn("rsvp-confirmation", className)}
		>
			{/* Confetti particles (decorative) */}
			<div className="rsvp-confetti" aria-hidden="true">
				<span className="rsvp-confetti-dot rsvp-confetti-1" />
				<span className="rsvp-confetti-dot rsvp-confetti-2" />
				<span className="rsvp-confetti-dot rsvp-confetti-3" />
				<span className="rsvp-confetti-dot rsvp-confetti-4" />
				<span className="rsvp-confetti-dot rsvp-confetti-5" />
				<span className="rsvp-confetti-dot rsvp-confetti-6" />
			</div>

			{/* Animated checkmark */}
			<div className="rsvp-check-circle" aria-hidden="true">
				<svg viewBox="0 0 52 52" className="rsvp-check-svg">
					<title>Success checkmark</title>
					<circle
						className="rsvp-check-ring"
						cx="26"
						cy="26"
						r="24"
						fill="none"
						strokeWidth="2"
					/>
					<path
						className="rsvp-check-mark"
						d="M14 27l7 7 16-16"
						fill="none"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>

			{/* Heading with icon */}
			<div className="rsvp-confirm-heading">
				{attendance === "attending" ? (
					<PartyPopper className="rsvp-confirm-icon" aria-hidden="true" />
				) : attendance === "not_attending" ? (
					<Heart className="rsvp-confirm-icon" aria-hidden="true" />
				) : (
					<CircleCheck className="rsvp-confirm-icon" aria-hidden="true" />
				)}
				<h3 className="rsvp-confirm-title">RSVP Received</h3>
			</div>

			<p className="rsvp-confirm-message">{messages[attendance]}</p>

			{/* Summary card */}
			<dl className="rsvp-confirm-summary">
				<div className="rsvp-confirm-row">
					<dt>Name</dt>
					<dd>{name}</dd>
				</div>
				<div className="rsvp-confirm-row">
					<dt>Status</dt>
					<dd className="rsvp-confirm-status">
						{attendance === "attending"
							? "Attending"
							: attendance === "not_attending"
								? "Not Attending"
								: "Undecided"}
					</dd>
				</div>
				{guestCount != null && guestCount > 0 && (
					<div className="rsvp-confirm-row">
						<dt>
							<Users
								className="inline-block h-3.5 w-3.5 mr-1 align-[-2px]"
								aria-hidden="true"
							/>
							Guests
						</dt>
						<dd>{guestCount}</dd>
					</div>
				)}
				{dietaryRequirements ? (
					<div className="rsvp-confirm-row">
						<dt>Dietary</dt>
						<dd>{dietaryRequirements}</dd>
					</div>
				) : null}
			</dl>

			<button type="button" onClick={onEdit} className="rsvp-confirm-edit">
				Update RSVP
			</button>
		</div>
	);
}

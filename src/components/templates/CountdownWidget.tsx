import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TimeLeft = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

type CountdownStatus = "counting" | "today" | "past";

function getCountdownState(targetDate: string): {
	status: CountdownStatus;
	timeLeft: TimeLeft;
} {
	const target = new Date(targetDate);
	if (Number.isNaN(target.getTime())) {
		return {
			status: "past",
			timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
		};
	}

	const now = new Date();
	const diff = target.getTime() - now.getTime();

	if (diff <= 0) {
		// Check if it's the same calendar day
		const isSameDay =
			target.getFullYear() === now.getFullYear() &&
			target.getMonth() === now.getMonth() &&
			target.getDate() === now.getDate();

		return {
			status: isSameDay ? "today" : "past",
			timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
		};
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
	const minutes = Math.floor((diff / (1000 * 60)) % 60);
	const seconds = Math.floor((diff / 1000) % 60);

	return { status: "counting", timeLeft: { days, hours, minutes, seconds } };
}

type CountdownWidgetProps = {
	targetDate: string;
	className?: string;
};

const UNITS: Array<{ key: keyof TimeLeft; label: string }> = [
	{ key: "days", label: "Days" },
	{ key: "hours", label: "Hours" },
	{ key: "minutes", label: "Minutes" },
	{ key: "seconds", label: "Seconds" },
];

export function CountdownWidget({
	targetDate,
	className,
}: CountdownWidgetProps) {
	const [state, setState] = useState(() => getCountdownState(targetDate));

	useEffect(() => {
		setState(getCountdownState(targetDate));
		let interval: ReturnType<typeof setInterval> | null = setInterval(() => {
			setState(getCountdownState(targetDate));
		}, 1000);

		const handleVisibility = () => {
			if (document.hidden) {
				if (interval) {
					clearInterval(interval);
					interval = null;
				}
			} else {
				setState(getCountdownState(targetDate));
				if (!interval) {
					interval = setInterval(() => {
						setState(getCountdownState(targetDate));
					}, 1000);
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibility);
		return () => {
			if (interval) clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [targetDate]);

	if (state.status === "today") {
		return (
			<div
				className={cn("countdown-widget", className)}
				role="status"
				aria-live="polite"
				aria-label="Wedding countdown"
			>
				<p className="countdown-message">The Big Day Is Here!</p>
			</div>
		);
	}

	if (state.status === "past") {
		return (
			<div
				className={cn("countdown-widget", className)}
				role="status"
				aria-live="polite"
				aria-label="Wedding countdown"
			>
				<p className="countdown-message">Celebration Complete</p>
			</div>
		);
	}

	const { timeLeft } = state;
	const ariaText = `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds until the wedding`;

	return (
		<div
			className={cn("countdown-widget", className)}
			role="timer"
			aria-live="polite"
			aria-label={ariaText}
		>
			<div className="countdown-units">
				{UNITS.map((unit, index) => (
					<div key={unit.key} className="countdown-unit-wrapper">
						{index > 0 && (
							<span className="countdown-separator" aria-hidden="true">
								:
							</span>
						)}
						<div className="countdown-unit">
							<span className="countdown-value">
								{String(timeLeft[unit.key]).padStart(2, "0")}
							</span>
							<span className="countdown-label">{unit.label}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

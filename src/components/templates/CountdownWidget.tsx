import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TimeLeft = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

type CountdownStatus = "counting" | "today" | "past";

/** Get the current date/time parts in a specific timezone. */
function nowInTimezone(timezone: string) {
	const now = new Date();
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).formatToParts(now);

	const get = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((p) => p.type === type)?.value ?? 0);

	return {
		year: get("year"),
		month: get("month"),
		day: get("day"),
		hour: get("hour"),
		minute: get("minute"),
		second: get("second"),
	};
}

function getCountdownState(
	targetDate: string,
	timezone: string,
): {
	status: CountdownStatus;
	timeLeft: TimeLeft;
} {
	// Parse the target date string (e.g. "2025-06-15") as a date in the
	// event's timezone, not the viewer's local timezone.
	const match = targetDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (!match) {
		return {
			status: "past",
			timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
		};
	}

	const targetYear = Number(match[1]);
	const targetMonth = Number(match[2]);
	const targetDay = Number(match[3]);

	const now = nowInTimezone(timezone);

	// Calculate difference treating both dates in the event timezone.
	// Target is midnight of the wedding day in the event timezone.
	const targetMs = Date.UTC(targetYear, targetMonth - 1, targetDay);
	const nowMs = Date.UTC(
		now.year,
		now.month - 1,
		now.day,
		now.hour,
		now.minute,
		now.second,
	);
	const diff = targetMs - nowMs;

	if (diff <= 0) {
		const isSameDay =
			targetYear === now.year &&
			targetMonth === now.month &&
			targetDay === now.day;

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

const DEFAULT_TIMEZONE = "Asia/Kuala_Lumpur";

/** Short display name for the timezone (e.g. "Malaysia Time", "Singapore Time"). */
function getTimezoneLabel(timezone: string): string {
	try {
		// Use Intl to get the long timezone name
		const name = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			timeZoneName: "long",
		})
			.formatToParts(new Date())
			.find((p) => p.type === "timeZoneName")?.value;
		return name ?? timezone;
	} catch {
		return timezone;
	}
}

type CountdownWidgetProps = {
	targetDate: string;
	timezone?: string;
	eventTime?: string;
	displayDate?: string;
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
	timezone = DEFAULT_TIMEZONE,
	eventTime,
	displayDate,
	className,
}: CountdownWidgetProps) {
	const [state, setState] = useState(() =>
		getCountdownState(targetDate, timezone),
	);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		const startInterval = () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			intervalRef.current = setInterval(() => {
				setState(getCountdownState(targetDate, timezone));
			}, 1000);
		};

		const stopInterval = () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};

		setState(getCountdownState(targetDate, timezone));
		startInterval();

		const handleVisibility = () => {
			if (document.hidden) {
				stopInterval();
			} else {
				setState(getCountdownState(targetDate, timezone));
				stopInterval();
				startInterval();
			}
		};

		document.addEventListener("visibilitychange", handleVisibility);
		return () => {
			stopInterval();
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [targetDate, timezone]);

	const timezoneLabel = getTimezoneLabel(timezone);

	if (state.status === "today") {
		return (
			<div
				className={cn("countdown-widget", className)}
				role="status"
				aria-live="polite"
				aria-label="Wedding countdown"
			>
				<p className="countdown-message">
					The Big Day Is Here!
					{eventTime && (
						<span className="countdown-event-time">
							{" "}
							Ceremony at {eventTime}
						</span>
					)}
				</p>
				<p className="countdown-timezone">{timezoneLabel}</p>
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

	return (
		<div
			className={cn("countdown-widget", className)}
			role="timer"
			aria-label="Wedding countdown"
		>
			<span className="sr-only" aria-live="polite">
				{timeLeft.days} days, {timeLeft.hours} hours until the wedding
			</span>
			{displayDate && <p className="countdown-date-zh">{displayDate}</p>}
			<div className="countdown-units" aria-hidden="true">
				{UNITS.map((unit, index) => (
					<div key={unit.key} className="countdown-unit-wrapper">
						{index > 0 && <span className="countdown-separator">:</span>}
						<div className="countdown-unit">
							<span className="countdown-value">
								{String(timeLeft[unit.key]).padStart(2, "0")}
							</span>
							<span className="countdown-label">{unit.label}</span>
						</div>
					</div>
				))}
			</div>
			<p className="countdown-timezone">{timezoneLabel}</p>
		</div>
	);
}

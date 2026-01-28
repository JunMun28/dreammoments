"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
	weddingDate?: string;
	accentColor?: string;
	themeVariant?: "light" | "dark";
}

interface TimeRemaining {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining | null {
	const now = new Date();
	const difference = targetDate.getTime() - now.getTime();

	if (difference <= 0) {
		return null;
	}

	return {
		days: Math.floor(difference / (1000 * 60 * 60 * 24)),
		hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
		minutes: Math.floor((difference / 1000 / 60) % 60),
		seconds: Math.floor((difference / 1000) % 60),
	};
}

function isValidDate(dateString: string): boolean {
	const date = new Date(dateString);
	return !Number.isNaN(date.getTime());
}

function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export function CountdownTimer({
	weddingDate,
	accentColor = "#be9f7a",
	themeVariant = "light",
}: CountdownTimerProps) {
	const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
		null,
	);
	const [status, setStatus] = useState<
		"loading" | "countdown" | "today" | "past" | "no-date"
	>("loading");

	const isDark = themeVariant === "dark";
	const subtextColor = isDark ? "text-white/50" : "text-stone-400";

	useEffect(() => {
		// Handle no date case
		if (!weddingDate) {
			setStatus("no-date");
			return;
		}

		// Handle invalid date case
		if (!isValidDate(weddingDate)) {
			setStatus("no-date");
			return;
		}

		const targetDate = new Date(weddingDate);
		// Set to end of day for the wedding date
		targetDate.setHours(23, 59, 59, 999);

		const updateCountdown = () => {
			const now = new Date();

			// Check if it's the wedding day
			if (isSameDay(now, targetDate)) {
				setStatus("today");
				setTimeRemaining(null);
				return;
			}

			// Check if date has passed
			if (now > targetDate) {
				setStatus("past");
				setTimeRemaining(null);
				return;
			}

			// Calculate remaining time
			const remaining = calculateTimeRemaining(targetDate);
			setTimeRemaining(remaining);
			setStatus("countdown");
		};

		// Initial update
		updateCountdown();

		// Update every second
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	}, [weddingDate]);

	// Render states
	if (status === "loading") {
		return (
			<div className={`text-center py-8 ${subtextColor}`}>
				Loading countdown...
			</div>
		);
	}

	if (status === "no-date") {
		return (
			<div className={`text-center py-8 ${subtextColor}`}>
				Set your wedding date to see the countdown
			</div>
		);
	}

	if (status === "today") {
		return (
			<div className="text-center py-8">
				<p
					className="text-2xl font-serif tracking-wide"
					style={{ color: accentColor }}
				>
					The day has arrived!
				</p>
				<p className={`mt-2 ${subtextColor}`}>Today is the day</p>
			</div>
		);
	}

	if (status === "past") {
		return (
			<div className="text-center py-8">
				<p className={`text-lg ${subtextColor}`}>
					Our wedding has been celebrated
				</p>
			</div>
		);
	}

	// Countdown display
	return (
		<div className="py-6">
			<div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
				{[
					{ value: timeRemaining?.days ?? 0, label: "Days" },
					{ value: timeRemaining?.hours ?? 0, label: "Hours" },
					{ value: timeRemaining?.minutes ?? 0, label: "Minutes" },
					{ value: timeRemaining?.seconds ?? 0, label: "Seconds" },
				].map(({ value, label }) => (
					<div key={label} className="text-center">
						<div
							className="text-2xl sm:text-3xl md:text-4xl font-light tabular-nums"
							style={{ color: accentColor }}
						>
							{value.toString().padStart(2, "0")}
						</div>
						<div
							className={`text-[10px] sm:text-xs uppercase tracking-wider mt-1 ${subtextColor}`}
						>
							{label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * Utility functions for formatting values in the invitation builder.
 */

/**
 * Format a time string (HH:mm) to 12-hour format with AM/PM.
 * Example: "14:30" -> "2:30 PM"
 *
 * @param time - Time string in "HH:mm" format, or undefined
 * @returns Formatted time string, or empty string if input is falsy
 */
export function formatTime(time: string | undefined): string {
	if (!time) return "";
	const [hours, minutes] = time.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const displayHours = hours % 12 || 12;
	return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format a date string (YYYY-MM-DD) to a readable format.
 * Example: "2024-06-15" -> "June 15, 2024"
 *
 * @param dateStr - Date string in "YYYY-MM-DD" format, or undefined
 * @param options - Intl.DateTimeFormat options (defaults to long month, numeric day/year)
 * @returns Formatted date string, or empty string if input is falsy
 */
export function formatDate(
	dateStr: string | undefined,
	options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	},
): string {
	if (!dateStr) return "";
	// Parse YYYY-MM-DD format
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString("en-US", options);
}

/**
 * Format a date for display in invitation previews.
 * Example: "2024-06-15" -> "Saturday, June 15, 2024"
 *
 * @param dateStr - Date string in "YYYY-MM-DD" format
 * @returns Formatted date with weekday, or empty string if input is falsy
 */
export function formatDateWithWeekday(dateStr: string | undefined): string {
	return formatDate(dateStr, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

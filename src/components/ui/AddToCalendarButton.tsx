import "add-to-calendar-button";

type AddToCalendarButtonProps = {
	title: string;
	date: string;
	venue: string;
	address: string;
	description?: string;
	variant?: "light" | "dark";
};

export function AddToCalendarButton({
	title,
	date,
	venue,
	address,
	description,
	variant = "light",
}: AddToCalendarButtonProps) {
	// Parse the date string - expected format like "December 28, 2025" or "2025-12-28"
	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime())) return null;

	const startDate = parsedDate.toISOString().split("T")[0];

	return (
		// @ts-expect-error - web component
		<add-to-calendar-button
			name={title}
			startDate={startDate}
			options="'Google','Apple','Outlook.com','Yahoo'"
			location={`${venue}, ${address}`}
			description={description ?? `Wedding celebration at ${venue}`}
			timeZone="Asia/Kuala_Lumpur"
			lightMode={variant === "dark" ? "dark" : "light"}
			size="3"
			styleLight={
				variant === "light"
					? "--btn-background: var(--dm-surface); --btn-text: var(--dm-ink); --btn-border: var(--dm-border);"
					: ""
			}
			styleDark={
				variant === "dark"
					? "--btn-background: transparent; --btn-text: #FFF8E7; --btn-border: rgba(255,255,255,0.15);"
					: ""
			}
		/>
	);
}

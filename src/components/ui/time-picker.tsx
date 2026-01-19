import { Clock } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
	/** ID for label association (applied to the container) */
	id?: string;
	/** Time value in 24-hour format "HH:mm" (e.g., "14:30") */
	value?: string;
	/** Called with time in 24-hour format "HH:mm" */
	onChange: (time: string) => void;
	disabled?: boolean;
	className?: string;
	/** Accessible label for screen readers */
	"aria-label"?: string;
}

/**
 * Parses a 24-hour time string into 12-hour components
 */
function parse24To12(time: string): {
	hour: string;
	minute: string;
	period: "AM" | "PM";
} {
	const [hourStr, minuteStr] = time.split(":");
	const hour24 = Number.parseInt(hourStr, 10);
	const minute = minuteStr || "00";

	let hour12: number;
	let period: "AM" | "PM";

	if (hour24 === 0) {
		hour12 = 12;
		period = "AM";
	} else if (hour24 === 12) {
		hour12 = 12;
		period = "PM";
	} else if (hour24 > 12) {
		hour12 = hour24 - 12;
		period = "PM";
	} else {
		hour12 = hour24;
		period = "AM";
	}

	return {
		hour: hour12.toString(),
		minute,
		period,
	};
}

/**
 * Converts 12-hour time components to 24-hour format string
 */
function convertTo24Hour(hour: string, minute: string, period: string): string {
	const hour12 = Number.parseInt(hour, 10);
	let hour24: number;

	if (period === "AM") {
		hour24 = hour12 === 12 ? 0 : hour12;
	} else {
		hour24 = hour12 === 12 ? 12 : hour12 + 12;
	}

	return `${hour24.toString().padStart(2, "0")}:${minute}`;
}

// Generate hour options (1-12)
const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

// Generate minute options (00, 05, 10, ..., 55)
const minutes = Array.from({ length: 12 }, (_, i) =>
	(i * 5).toString().padStart(2, "0"),
);

export function TimePicker({
	id,
	value,
	onChange,
	disabled = false,
	className,
	"aria-label": ariaLabel,
}: TimePickerProps) {
	// Parse value into 12-hour components
	const parsed = value ? parse24To12(value) : null;

	const handleHourChange = (newHour: string) => {
		const minute = parsed?.minute || "00";
		const period = parsed?.period || "AM";
		onChange(convertTo24Hour(newHour, minute, period));
	};

	const handleMinuteChange = (newMinute: string) => {
		const hour = parsed?.hour || "12";
		const period = parsed?.period || "AM";
		onChange(convertTo24Hour(hour, newMinute, period));
	};

	const handlePeriodChange = (newPeriod: string) => {
		const hour = parsed?.hour || "12";
		const minute = parsed?.minute || "00";
		onChange(convertTo24Hour(hour, minute, newPeriod));
	};

	const labelPrefix = ariaLabel ? `${ariaLabel} ` : "";

	return (
		<fieldset
			id={id}
			className={cn("flex items-center gap-2 border-0 p-0 m-0", className)}
			aria-label={ariaLabel}
		>
			<Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />

			{/* Hour select */}
			<Select
				value={parsed?.hour}
				onValueChange={handleHourChange}
				disabled={disabled}
			>
				<SelectTrigger className="w-[70px]" aria-label={`${labelPrefix}hour`}>
					<SelectValue placeholder="Hour" />
				</SelectTrigger>
				<SelectContent>
					{hours.map((hour) => (
						<SelectItem key={hour} value={hour}>
							{hour}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<span className="text-muted-foreground" aria-hidden="true">
				:
			</span>

			{/* Minute select */}
			<Select
				value={parsed?.minute}
				onValueChange={handleMinuteChange}
				disabled={disabled}
			>
				<SelectTrigger className="w-[70px]" aria-label={`${labelPrefix}minute`}>
					<SelectValue placeholder="Min" />
				</SelectTrigger>
				<SelectContent>
					{minutes.map((minute) => (
						<SelectItem key={minute} value={minute}>
							{minute}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* AM/PM select */}
			<Select
				value={parsed?.period}
				onValueChange={handlePeriodChange}
				disabled={disabled}
			>
				<SelectTrigger
					className="w-[80px]"
					aria-label={`${labelPrefix}AM or PM`}
				>
					<SelectValue placeholder="AM/PM" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="AM">AM</SelectItem>
					<SelectItem value="PM">PM</SelectItem>
				</SelectContent>
			</Select>
		</fieldset>
	);
}

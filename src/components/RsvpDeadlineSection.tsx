import { X } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

interface RsvpDeadlineSectionProps {
	value: Date | undefined;
	onChange: (value: Date | undefined) => void;
}

/**
 * Component for setting the RSVP deadline in the builder.
 * Allows couple to set and clear the deadline date.
 */
export function RsvpDeadlineSection({
	value,
	onChange,
}: RsvpDeadlineSectionProps) {
	const labelId = useId();

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label htmlFor={labelId}>RSVP Deadline</Label>
				{value && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onChange(undefined)}
						className="h-auto p-1 text-muted-foreground hover:text-destructive"
						aria-label="Clear deadline"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			<DatePicker
				value={value}
				onChange={onChange}
				placeholder="Select deadline date"
			/>

			<p className="text-sm text-muted-foreground">
				{value
					? "Guests must respond by this date. After the deadline, the RSVP form will be closed."
					: "Set a deadline for guests to submit their RSVP"}
			</p>
		</div>
	);
}

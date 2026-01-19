import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	/** ID for label association */
	id?: string;
	value?: Date;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	/** Accessible label for screen readers */
	"aria-label"?: string;
}

export function DatePicker({
	id,
	value,
	onChange,
	placeholder = "Pick a date",
	disabled = false,
	className,
	"aria-label": ariaLabel,
}: DatePickerProps) {
	const [open, setOpen] = useState(false);

	const handleSelect = (date: Date | undefined) => {
		onChange(date);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					disabled={disabled}
					aria-label={ariaLabel}
					className={cn(
						"w-full justify-start text-left font-normal",
						!value && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
					{value ? (
						value.toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						})
					) : (
						<span>{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={value}
					onSelect={handleSelect}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}

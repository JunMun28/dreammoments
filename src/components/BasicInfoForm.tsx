import { useForm } from "@tanstack/react-form";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";

export interface BasicInfoFormValues {
	partner1Name: string;
	partner2Name: string;
	weddingDate?: Date;
	/** Time in 24-hour format "HH:mm" */
	weddingTime?: string;
}

interface BasicInfoFormProps {
	initialValues?: BasicInfoFormValues;
	onSubmit: (values: BasicInfoFormValues) => void | Promise<void>;
	onChange?: (values: BasicInfoFormValues) => void;
}

export function BasicInfoForm({
	initialValues,
	onSubmit,
	onChange,
}: BasicInfoFormProps) {
	const partner1Id = useId();
	const partner2Id = useId();
	const weddingDateId = useId();
	const weddingTimeId = useId();

	const form = useForm({
		defaultValues: {
			partner1Name: initialValues?.partner1Name ?? "",
			partner2Name: initialValues?.partner2Name ?? "",
			weddingDate: initialValues?.weddingDate,
			weddingTime: initialValues?.weddingTime,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			<form.Field
				name="partner1Name"
				listeners={{
					onChange: () => {
						if (onChange) {
							onChange(form.state.values);
						}
					},
				}}
			>
				{(field) => (
					<div>
						<Label htmlFor={partner1Id}>Partner 1 Name</Label>
						<Input
							id={partner1Id}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							placeholder="Enter first partner's name"
						/>
					</div>
				)}
			</form.Field>

			<form.Field
				name="partner2Name"
				listeners={{
					onChange: () => {
						if (onChange) {
							onChange(form.state.values);
						}
					},
				}}
			>
				{(field) => (
					<div>
						<Label htmlFor={partner2Id}>Partner 2 Name</Label>
						<Input
							id={partner2Id}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							placeholder="Enter second partner's name"
						/>
					</div>
				)}
			</form.Field>

			<form.Field
				name="weddingDate"
				listeners={{
					onChange: () => {
						if (onChange) {
							onChange(form.state.values);
						}
					},
				}}
			>
				{(field) => (
					<div>
						<Label htmlFor={weddingDateId}>Wedding Date</Label>
						<DatePicker
							value={field.state.value}
							onChange={(date) => field.handleChange(date)}
							placeholder="Select wedding date"
						/>
					</div>
				)}
			</form.Field>

			<form.Field
				name="weddingTime"
				listeners={{
					onChange: () => {
						if (onChange) {
							onChange(form.state.values);
						}
					},
				}}
			>
				{(field) => (
					<div>
						<Label htmlFor={weddingTimeId}>Wedding Time</Label>
						<TimePicker
							value={field.state.value}
							onChange={(time) => field.handleChange(time)}
						/>
					</div>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={isSubmitting}>
						Save
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}

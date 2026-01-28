import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RsvpResponseInput } from "@/lib/rsvp-server";

// ============================================================================
// TYPES
// ============================================================================

export interface GuestRsvpData {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	rsvpResponse: {
		id: string;
		attending: boolean;
		mealPreference: string | null;
		dietaryNotes: string | null;
		plusOneCount: number;
		plusOneNames: string | null;
	} | null;
}

interface GuestFormState {
	attending: boolean | null;
	mealPreference: string;
	dietaryNotes: string;
	plusOneCount: number;
	plusOneNames: string;
}

interface RsvpFormProps {
	guests: GuestRsvpData[];
	onSubmit: (responses: RsvpResponseInput[]) => Promise<void>;
}

// ============================================================================
// MEAL OPTIONS
// Tailored for Singapore/Malaysia Chinese weddings
// ============================================================================

const MEAL_OPTIONS = [
	{ value: "standard", label: "Standard (No restrictions)" },
	{ value: "halal", label: "Halal" },
	{ value: "vegetarian", label: "Vegetarian" },
	{ value: "no-beef", label: "No Beef" },
	{ value: "no-pork", label: "No Pork" },
	{ value: "no-shellfish", label: "No Shellfish" },
	{ value: "vegan", label: "Vegan" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function RsvpForm({ guests, onSubmit }: RsvpFormProps) {
	const id = useId();

	// Initialize form state from existing responses
	const [formState, setFormState] = useState<Record<string, GuestFormState>>(
		() => {
			const initial: Record<string, GuestFormState> = {};
			for (const guest of guests) {
				initial[guest.id] = {
					attending: guest.rsvpResponse?.attending ?? null,
					mealPreference: guest.rsvpResponse?.mealPreference ?? "",
					dietaryNotes: guest.rsvpResponse?.dietaryNotes ?? "",
					plusOneCount: guest.rsvpResponse?.plusOneCount ?? 0,
					plusOneNames: guest.rsvpResponse?.plusOneNames ?? "",
				};
			}
			return initial;
		},
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	// Update a guest's form state
	const updateGuestState = (
		guestId: string,
		updates: Partial<GuestFormState>,
	) => {
		setFormState((prev) => ({
			...prev,
			[guestId]: { ...prev[guestId], ...updates },
		}));
		setSubmitError(null);
		setSubmitSuccess(false);
	};

	// Check if all guests have a response
	const allGuestsResponded = guests.every(
		(guest) => formState[guest.id]?.attending !== null,
	);

	// Calculate total headcount
	const totalAttending = guests.reduce((sum, guest) => {
		const state = formState[guest.id];
		if (state?.attending) {
			return sum + 1 + (state.plusOneCount || 0);
		}
		return sum;
	}, 0);

	// Handle form submission
	const handleSubmit = async () => {
		if (!allGuestsResponded || isSubmitting) return;

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const responses: RsvpResponseInput[] = guests.map((guest) => {
				const state = formState[guest.id];
				return {
					guestId: guest.id,
					attending: state.attending ?? false,
					mealPreference: state.attending
						? state.mealPreference || undefined
						: undefined,
					dietaryNotes: state.attending
						? state.dietaryNotes || undefined
						: undefined,
					plusOneCount: state.attending ? state.plusOneCount : 0,
					plusOneNames: state.attending
						? state.plusOneNames || undefined
						: undefined,
				};
			});

			await onSubmit(responses);
			setSubmitSuccess(true);
		} catch {
			setSubmitError("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Empty state
	if (guests.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No guests found for this invitation.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Guest forms */}
			{guests.map((guest, index) => {
				const state = formState[guest.id];
				const guestId = `${id}-guest-${index}`;

				return (
					<div
						key={guest.id}
						className="rounded-lg border bg-white/50 p-4 space-y-4"
					>
						{/* Guest name */}
						<h3 className="font-semibold text-lg">{guest.name}</h3>

						{/* Attendance */}
						<fieldset className="space-y-2">
							<legend className="text-sm font-medium">Will you attend?</legend>
							<div className="flex gap-4">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name={`${guestId}-attending`}
										value="yes"
										checked={state?.attending === true}
										onChange={() =>
											updateGuestState(guest.id, { attending: true })
										}
										className="w-4 h-4"
									/>
									<span>Joyfully Accept</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name={`${guestId}-attending`}
										value="no"
										checked={state?.attending === false}
										onChange={() =>
											updateGuestState(guest.id, {
												attending: false,
												mealPreference: "",
												plusOneCount: 0,
												plusOneNames: "",
											})
										}
										className="w-4 h-4"
									/>
									<span>Regretfully Decline</span>
								</label>
							</div>
						</fieldset>

						{/* Show additional fields if attending */}
						{state?.attending && (
							<>
								{/* Meal preference */}
								<div className="space-y-2">
									<Label htmlFor={`${guestId}-meal`}>Meal Preference</Label>
									<Select
										value={state.mealPreference}
										onValueChange={(value) =>
											updateGuestState(guest.id, { mealPreference: value })
										}
									>
										<SelectTrigger id={`${guestId}-meal`}>
											<SelectValue placeholder="Select a meal" />
										</SelectTrigger>
										<SelectContent>
											{MEAL_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Dietary notes */}
								<div className="space-y-2">
									<Label htmlFor={`${guestId}-dietary`}>
										Dietary Requirements
									</Label>
									<Textarea
										id={`${guestId}-dietary`}
										value={state.dietaryNotes}
										onChange={(e) =>
											updateGuestState(guest.id, {
												dietaryNotes: e.target.value,
											})
										}
										placeholder="Any allergies or dietary restrictions..."
										rows={2}
									/>
								</div>

								{/* Plus-ones */}
								<div className="space-y-3 pt-2 border-t">
									<p className="text-sm font-medium">
										Are you bringing anyone with you?
									</p>

									<div className="space-y-2">
										<Label htmlFor={`${guestId}-plusone-count`}>
											How many additional guests?
										</Label>
										<Input
											id={`${guestId}-plusone-count`}
											type="number"
											min={0}
											max={5}
											value={state.plusOneCount}
											onChange={(e) =>
												updateGuestState(guest.id, {
													plusOneCount: Math.max(
														0,
														parseInt(e.target.value, 10) || 0,
													),
												})
											}
											className="w-24"
										/>
									</div>

									{state.plusOneCount > 0 && (
										<div className="space-y-2">
											<Label htmlFor={`${guestId}-plusone-names`}>
												Names of your guests
											</Label>
											<Input
												id={`${guestId}-plusone-names`}
												value={state.plusOneNames}
												onChange={(e) =>
													updateGuestState(guest.id, {
														plusOneNames: e.target.value,
													})
												}
												placeholder="e.g., Jane Doe, John Jr."
											/>
										</div>
									)}
								</div>
							</>
						)}
					</div>
				);
			})}

			{/* Summary and submit */}
			<div className="rounded-lg border bg-white/50 p-4 space-y-4">
				{/* Headcount */}
				{totalAttending > 0 && (
					<p className="text-center font-medium">{totalAttending} attending</p>
				)}

				{/* Error message */}
				{submitError && (
					<p className="text-center text-destructive text-sm">{submitError}</p>
				)}

				{/* Success message */}
				{submitSuccess && (
					<p className="text-center text-green-600 text-sm font-medium">
						RSVP submitted successfully! Thank you for responding.
					</p>
				)}

				{/* Submit button */}
				<Button
					onClick={handleSubmit}
					disabled={!allGuestsResponded || isSubmitting}
					className="w-full"
				>
					{isSubmitting ? "Submitting..." : "Submit RSVP"}
				</Button>

				{!allGuestsResponded && (
					<p className="text-center text-sm text-muted-foreground">
						Please respond for all guests to submit
					</p>
				)}
			</div>
		</div>
	);
}

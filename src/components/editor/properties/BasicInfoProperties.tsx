import { useCallback, useId } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { VenueMapSection } from "@/components/VenueMapSection";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";

/**
 * Properties panel header component
 */
function PanelHeader({ title }: { title: string }) {
	return (
		<div className="border-b bg-stone-50 px-4 py-3">
			<h3 className="font-semibold text-stone-800">{title}</h3>
		</div>
	);
}

/**
 * Basic information properties panel.
 * Includes partner names, wedding date/time, and venue details.
 */
export function BasicInfoProperties() {
	const { invitation, updateInvitation } = useInvitationBuilder();
	const id = useId();
	const partner1Id = `${id}-partner1`;
	const partner2Id = `${id}-partner2`;
	const weddingDateId = `${id}-wedding-date`;
	const weddingTimeId = `${id}-wedding-time`;
	const venueNameId = `${id}-venue-name`;
	const venueAddressId = `${id}-venue-address`;

	const handlePartner1Change = useCallback(
		(value: string) => {
			updateInvitation({ partner1Name: value });
		},
		[updateInvitation],
	);

	const handlePartner2Change = useCallback(
		(value: string) => {
			updateInvitation({ partner2Name: value });
		},
		[updateInvitation],
	);

	const handleDateChange = useCallback(
		(date: Date | undefined) => {
			updateInvitation({ weddingDate: date });
		},
		[updateInvitation],
	);

	const handleTimeChange = useCallback(
		(time: string | undefined) => {
			updateInvitation({ weddingTime: time });
		},
		[updateInvitation],
	);

	const handleVenueNameChange = useCallback(
		(value: string) => {
			updateInvitation({ venueName: value });
		},
		[updateInvitation],
	);

	const handleVenueAddressChange = useCallback(
		(value: string) => {
			updateInvitation({ venueAddress: value });
		},
		[updateInvitation],
	);

	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Basic Information" />

			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				{/* Partner Names */}
				<div className="space-y-4">
					<h4 className="text-sm font-medium text-stone-700">Couple Names</h4>

					<div>
						<Label htmlFor={partner1Id}>Partner 1</Label>
						<Input
							id={partner1Id}
							value={invitation.partner1Name ?? ""}
							onChange={(e) => handlePartner1Change(e.target.value)}
							placeholder="First partner's name"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor={partner2Id}>Partner 2</Label>
						<Input
							id={partner2Id}
							value={invitation.partner2Name ?? ""}
							onChange={(e) => handlePartner2Change(e.target.value)}
							placeholder="Second partner's name"
							className="mt-1"
						/>
					</div>
				</div>

				{/* Date & Time */}
				<div className="space-y-4">
					<h4 className="text-sm font-medium text-stone-700">Date & Time</h4>

					<div>
						<Label htmlFor={weddingDateId}>Wedding Date</Label>
						<DatePicker
							id={weddingDateId}
							value={invitation.weddingDate}
							onChange={handleDateChange}
							placeholder="Select date"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor={weddingTimeId}>Wedding Time</Label>
						<TimePicker
							id={weddingTimeId}
							value={invitation.weddingTime}
							onChange={handleTimeChange}
							aria-label="Wedding time"
							className="mt-1"
						/>
					</div>
				</div>

				{/* Venue */}
				<div className="space-y-4">
					<h4 className="text-sm font-medium text-stone-700">Venue</h4>

					<div>
						<Label htmlFor={venueNameId}>Venue Name</Label>
						<Input
							id={venueNameId}
							value={invitation.venueName ?? ""}
							onChange={(e) => handleVenueNameChange(e.target.value)}
							placeholder="Enter venue name"
							className="mt-1"
						/>
					</div>

					<div>
						<Label htmlFor={venueAddressId}>Venue Address</Label>
						<Input
							id={venueAddressId}
							value={invitation.venueAddress ?? ""}
							onChange={(e) => handleVenueAddressChange(e.target.value)}
							placeholder="Enter venue address"
							className="mt-1"
						/>
					</div>

					{/* Venue Map Coordinates */}
					<VenueMapSection />
				</div>
			</div>
		</div>
	);
}

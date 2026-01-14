import { useCallback, useEffect, useState } from "react";
import {
	InvitationBuilderProvider,
	type InvitationData,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";
import { type AutosaveStatus, useAutosave } from "@/hooks/useAutosave";
import {
	createGuest,
	createGuestGroup,
	deleteGuest,
	deleteGuestGroup,
	updateGuest,
	updateGuestGroup,
} from "@/lib/guest-server";
import { getInvitationRsvpSummary } from "@/lib/rsvp-server";
import { cn } from "@/lib/utils";
import { BasicInfoForm, type BasicInfoFormValues } from "./BasicInfoForm";
import type { GuestEditorValues } from "./GuestEditor";
import { GuestGroupList } from "./GuestGroupList";
import { HeroImageSection } from "./HeroImageSection";
import { InvitationPreview } from "./InvitationPreview";
import { RsvpDashboard, type RsvpSummaryData } from "./RsvpDashboard";
import { RsvpDeadlineSection } from "./RsvpDeadlineSection";
import { ThemeSection } from "./ThemeSection";
import { type ViewportMode, ViewportToggle } from "./ui/viewport-toggle";

interface InvitationBuilderProps {
	/** Initial invitation data from server */
	initialData: InvitationData;
	/** Callback to save invitation (typically a server function) */
	onSave: (data: InvitationData) => Promise<void>;
}

/**
 * Autosave status indicator component
 */
function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 text-sm transition-opacity duration-200",
				status === "idle" && "opacity-0",
			)}
		>
			{status === "saving" && (
				<>
					<div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
					<span className="text-muted-foreground">Saving...</span>
				</>
			)}
			{status === "saved" && (
				<>
					<div className="h-2 w-2 rounded-full bg-green-500" />
					<span className="text-muted-foreground">Saved</span>
				</>
			)}
			{status === "error" && (
				<>
					<div className="h-2 w-2 rounded-full bg-red-500" />
					<span className="text-destructive">Failed to save</span>
				</>
			)}
		</div>
	);
}

/**
 * Form wrapper that connects BasicInfoForm to the builder context.
 */
function BuilderForm({
	onSave,
}: {
	onSave: (data: InvitationData) => Promise<void>;
}) {
	const { invitation, updateInvitation } = useInvitationBuilder();

	const handleChange = useCallback(
		(values: BasicInfoFormValues) => {
			updateInvitation(values);
		},
		[updateInvitation],
	);

	const handleSubmit = useCallback(
		async (values: BasicInfoFormValues) => {
			// Manual save via form submit
			await onSave({ ...invitation, ...values });
		},
		[invitation, onSave],
	);

	const formInitialValues: BasicInfoFormValues = {
		partner1Name: invitation.partner1Name ?? "",
		partner2Name: invitation.partner2Name ?? "",
		weddingDate: invitation.weddingDate,
		weddingTime: invitation.weddingTime,
		venueName: invitation.venueName,
		venueAddress: invitation.venueAddress,
		rsvpDeadline: invitation.rsvpDeadline,
	};

	return (
		<BasicInfoForm
			initialValues={formInitialValues}
			onSubmit={handleSubmit}
			onChange={handleChange}
		/>
	);
}

/**
 * RSVP settings section with deadline configuration.
 */
function RsvpSettingsSection() {
	const { invitation, updateInvitation } = useInvitationBuilder();

	const handleDeadlineChange = useCallback(
		(deadline: Date | undefined) => {
			updateInvitation({ rsvpDeadline: deadline });
		},
		[updateInvitation],
	);

	return (
		<RsvpDeadlineSection
			value={invitation.rsvpDeadline}
			onChange={handleDeadlineChange}
		/>
	);
}

/**
 * RSVP Dashboard section that loads and displays RSVP summary.
 */
function RsvpDashboardSection() {
	const { invitation } = useInvitationBuilder();
	const [summary, setSummary] = useState<RsvpSummaryData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load RSVP summary on mount and when invitation changes
	useEffect(() => {
		async function loadSummary() {
			if (!invitation.id) return;

			setIsLoading(true);
			try {
				const data = await getInvitationRsvpSummary({
					data: { invitationId: invitation.id },
				});
				setSummary(data);
			} catch (error) {
				console.error("Failed to load RSVP summary:", error);
			} finally {
				setIsLoading(false);
			}
		}

		loadSummary();
	}, [invitation.id]);

	const emptySummary: RsvpSummaryData = {
		totalInvited: 0,
		totalAttending: 0,
		totalDeclined: 0,
		totalPending: 0,
		groups: [],
	};

	return (
		<RsvpDashboard summary={summary ?? emptySummary} isLoading={isLoading} />
	);
}

/**
 * Guest management section with server callbacks.
 */
function GuestManagementSection() {
	const { invitation } = useInvitationBuilder();

	const handleGroupCreate = useCallback(
		async (name: string) => {
			const result = await createGuestGroup({
				data: { invitationId: invitation.id, name },
			});
			return { id: result.id, rsvpToken: result.rsvpToken };
		},
		[invitation.id],
	);

	const handleGroupUpdate = useCallback(async (id: string, name: string) => {
		await updateGuestGroup({ data: { id, name } });
	}, []);

	const handleGroupDelete = useCallback(async (id: string) => {
		await deleteGuestGroup({ data: { id } });
	}, []);

	const handleGuestCreate = useCallback(
		async (groupId: string, guest: GuestEditorValues) => {
			const result = await createGuest({
				data: {
					groupId,
					name: guest.name,
					email: guest.email,
					phone: guest.phone,
				},
			});
			return { id: result.id };
		},
		[],
	);

	const handleGuestUpdate = useCallback(
		async (_groupId: string, guestId: string, guest: GuestEditorValues) => {
			await updateGuest({
				data: {
					id: guestId,
					name: guest.name,
					email: guest.email,
					phone: guest.phone,
				},
			});
		},
		[],
	);

	const handleGuestDelete = useCallback(
		async (_groupId: string, guestId: string) => {
			await deleteGuest({ data: { id: guestId } });
		},
		[],
	);

	return (
		<GuestGroupList
			onGroupCreate={handleGroupCreate}
			onGroupUpdate={handleGroupUpdate}
			onGroupDelete={handleGroupDelete}
			onGuestCreate={handleGuestCreate}
			onGuestUpdate={handleGuestUpdate}
			onGuestDelete={handleGuestDelete}
		/>
	);
}

/**
 * Inner component that manages autosave and renders the layout.
 * Must be inside InvitationBuilderProvider to access context.
 */
function InvitationBuilderContent({
	onSave,
}: {
	onSave: (data: InvitationData) => Promise<void>;
}) {
	const { invitation, setAutosaveStatus } = useInvitationBuilder();
	const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");

	const { status } = useAutosave({
		data: invitation,
		onSave,
		delay: 1000,
	});

	// Sync status to context for potential use elsewhere
	useEffect(() => {
		setAutosaveStatus(status);
	}, [status, setAutosaveStatus]);

	return (
		<div className="flex flex-col gap-4">
			{/* Header with autosave status */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Edit Invitation</h1>
				<AutosaveIndicator status={status} />
			</div>

			<div className="grid h-full gap-8 lg:grid-cols-2">
				{/* Form panel */}
				<div className="space-y-8 overflow-y-auto">
					<div className="rounded-lg border bg-card p-6">
						<h2 className="mb-6 text-lg font-semibold">Basic Information</h2>
						<BuilderForm onSave={onSave} />
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h2 className="mb-6 text-lg font-semibold">Hero Image</h2>
						<HeroImageSection />
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h2 className="mb-6 text-lg font-semibold">Theme</h2>
						<ThemeSection />
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h2 className="mb-6 text-lg font-semibold">RSVP Settings</h2>
						<RsvpSettingsSection />
					</div>

					<div className="rounded-lg border bg-card p-6">
						<RsvpDashboardSection />
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h2 className="mb-6 text-lg font-semibold">Guest Management</h2>
						<GuestManagementSection />
					</div>
				</div>

				{/* Preview panel */}
				<div className="hidden lg:block">
					<div className="sticky top-4">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-semibold">Preview</h2>
							<ViewportToggle value={viewportMode} onChange={setViewportMode} />
						</div>
						<InvitationPreview viewportMode={viewportMode} />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Main invitation builder component.
 * Provides side-by-side editing with live preview.
 * Includes autosave functionality.
 *
 * @example
 * ```tsx
 * <InvitationBuilder
 *   initialData={{ id: "123", partner1Name: "Alice", partner2Name: "Bob" }}
 *   onSave={async (data) => {
 *     await updateInvitation({ data: { invitationId: data.id, ...data } });
 *   }}
 * />
 * ```
 */
export function InvitationBuilder({
	initialData,
	onSave,
}: InvitationBuilderProps) {
	return (
		<InvitationBuilderProvider initialData={initialData}>
			<InvitationBuilderContent onSave={onSave} />
		</InvitationBuilderProvider>
	);
}

import { useCallback, useEffect } from "react";
import {
	InvitationBuilderProvider,
	type InvitationData,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";
import { type AutosaveStatus, useAutosave } from "@/hooks/useAutosave";
import { cn } from "@/lib/utils";
import { BasicInfoForm, type BasicInfoFormValues } from "./BasicInfoForm";
import { InvitationPreview } from "./InvitationPreview";
import { ThemeSection } from "./ThemeSection";

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
 * Inner component that manages autosave and renders the layout.
 * Must be inside InvitationBuilderProvider to access context.
 */
function InvitationBuilderContent({
	onSave,
}: {
	onSave: (data: InvitationData) => Promise<void>;
}) {
	const { invitation, setAutosaveStatus } = useInvitationBuilder();

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
						<h2 className="mb-6 text-lg font-semibold">Theme</h2>
						<ThemeSection />
					</div>
				</div>

				{/* Preview panel */}
				<div className="hidden lg:block">
					<div className="sticky top-4">
						<h2 className="mb-4 text-lg font-semibold">Preview</h2>
						<InvitationPreview />
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

import { useCallback, useState } from "react";
import { GuestCsvImport, type ImportResult } from "@/components/GuestCsvImport";
import type { GuestEditorValues } from "@/components/GuestEditor";
import { GuestGroupList } from "@/components/GuestGroupList";
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
 * Guest management properties panel.
 * Includes CSV import and manual guest/group management.
 */
export function GuestsProperties() {
	const { invitation, setGuestGroups } = useInvitationBuilder();
	const [importKey, setImportKey] = useState(0);

	/**
	 * Reload guest groups from server after CSV import
	 */
	const reloadGuestGroups = useCallback(async () => {
		try {
			// Dynamic import to avoid bundling drizzle-orm on client
			const { getGuestGroupsWithGuests } = await import("@/lib/guest-server");
			const groups = await getGuestGroupsWithGuests({
				data: { invitationId: invitation.id },
			});
			// Convert server data to context format
			const contextGroups = groups.map((g) => ({
				id: g.id,
				name: g.name,
				rsvpToken: g.rsvpToken,
				guests: g.guests.map((guest) => ({
					id: guest.id,
					name: guest.name,
					email: guest.email ?? undefined,
					phone: guest.phone ?? undefined,
				})),
			}));
			setGuestGroups(contextGroups);
		} catch (error) {
			console.error("Failed to reload guest groups:", error);
		}
	}, [invitation.id, setGuestGroups]);

	const handleImportComplete = useCallback(
		async (_result: ImportResult) => {
			await reloadGuestGroups();
			setImportKey((prev) => prev + 1);
		},
		[reloadGuestGroups],
	);

	const handleGroupCreate = useCallback(
		async (name: string) => {
			const { createGuestGroup } = await import("@/lib/guest-server");
			const result = await createGuestGroup({
				data: { invitationId: invitation.id, name },
			});
			return { id: result.id, rsvpToken: result.rsvpToken };
		},
		[invitation.id],
	);

	const handleGroupUpdate = useCallback(async (id: string, name: string) => {
		const { updateGuestGroup } = await import("@/lib/guest-server");
		await updateGuestGroup({ data: { id, name } });
	}, []);

	const handleGroupDelete = useCallback(async (id: string) => {
		const { deleteGuestGroup } = await import("@/lib/guest-server");
		await deleteGuestGroup({ data: { id } });
	}, []);

	const handleGuestCreate = useCallback(
		async (groupId: string, guest: GuestEditorValues) => {
			const { createGuest } = await import("@/lib/guest-server");
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
			const { updateGuest } = await import("@/lib/guest-server");
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
			const { deleteGuest } = await import("@/lib/guest-server");
			await deleteGuest({ data: { id: guestId } });
		},
		[],
	);

	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Guest Management" />

			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				{/* CSV Import */}
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-stone-700">Import Guests</h4>
					<GuestCsvImport
						key={importKey}
						invitationId={invitation.id}
						onImportComplete={handleImportComplete}
					/>
				</div>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 text-muted-foreground">
							or manage manually
						</span>
					</div>
				</div>

				{/* Manual Management */}
				<GuestGroupList
					onGroupCreate={handleGroupCreate}
					onGroupUpdate={handleGroupUpdate}
					onGroupDelete={handleGroupDelete}
					onGuestCreate={handleGuestCreate}
					onGuestUpdate={handleGuestUpdate}
					onGuestDelete={handleGuestDelete}
				/>
			</div>
		</div>
	);
}

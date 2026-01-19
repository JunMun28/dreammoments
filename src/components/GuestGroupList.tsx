import {
	Check,
	ChevronDown,
	ChevronRight,
	Link,
	Pencil,
	Plus,
	Trash2,
	UserPlus,
} from "lucide-react";
import { useState } from "react";
import { GuestEditor, type GuestEditorValues } from "@/components/GuestEditor";
import {
	GuestGroupEditor,
	type GuestGroupEditorValues,
} from "@/components/GuestGroupEditor";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCodeDialog } from "@/components/ui/qr-code-dialog";
import {
	type Guest,
	type GuestGroup,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";

/**
 * Generate the RSVP URL for a group
 */
export function getRsvpUrl(rsvpToken: string): string {
	if (typeof window !== "undefined") {
		return `${window.location.origin}/rsvp#t=${rsvpToken}`;
	}
	return `/rsvp#t=${rsvpToken}`;
}

interface GuestItemProps {
	guest: Guest;
	groupId: string;
	onEdit: () => void;
	onDelete: () => void;
}

/**
 * Individual guest item display
 */
function GuestItem({ guest, onEdit, onDelete }: GuestItemProps) {
	return (
		<div
			className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
			data-testid={`guest-${guest.id}`}
		>
			<div className="flex-1 min-w-0">
				<p className="font-medium text-sm">{guest.name}</p>
				{(guest.email || guest.phone) && (
					<p className="text-xs text-muted-foreground">
						{[guest.email, guest.phone].filter(Boolean).join(" • ")}
					</p>
				)}
			</div>
			<div className="flex gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={onEdit}
					data-testid={`edit-guest-${guest.id}`}
					aria-label={`Edit ${guest.name}`}
				>
					<Pencil className="h-3 w-3" />
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							data-testid={`delete-guest-${guest.id}`}
							aria-label={`Delete ${guest.name}`}
						>
							<Trash2 className="h-3 w-3 text-destructive" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove Guest</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to remove "{guest.name}" from the guest
								list?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={onDelete}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								data-testid={`confirm-delete-guest-${guest.id}`}
							>
								Remove
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}

interface GuestGroupItemProps {
	group: GuestGroup;
	isExpanded: boolean;
	onToggle: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onAddGuest: () => void;
	onEditGuest: (guestId: string) => void;
	onDeleteGuest: (guestId: string) => void;
	editingGuestId: string | null;
	onSaveGuest: (values: GuestEditorValues) => void;
	onCancelGuest: () => void;
}

/**
 * Guest group item with expandable guest list
 */
function GuestGroupItem({
	group,
	isExpanded,
	onToggle,
	onEdit,
	onDelete,
	onAddGuest,
	onEditGuest,
	onDeleteGuest,
	editingGuestId,
	onSaveGuest,
	onCancelGuest,
}: GuestGroupItemProps) {
	const [copied, setCopied] = useState(false);

	const handleCopyLink = async () => {
		const url = getRsvpUrl(group.rsvpToken);
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className="rounded-lg border bg-card"
			data-testid={`guest-group-${group.id}`}
		>
			{/* Group header */}
			<div className="flex items-center p-3 gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onToggle}
					aria-label={isExpanded ? "Collapse group" : "Expand group"}
					data-testid={`toggle-group-${group.id}`}
				>
					{isExpanded ? (
						<ChevronDown className="h-4 w-4" />
					) : (
						<ChevronRight className="h-4 w-4" />
					)}
				</Button>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h4 className="font-medium">{group.name}</h4>
						<Badge variant="secondary" className="text-xs">
							{group.guests.length} guest{group.guests.length !== 1 ? "s" : ""}
						</Badge>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={handleCopyLink}
						aria-label={copied ? "Link copied" : "Copy RSVP link"}
						data-testid={`copy-link-${group.id}`}
					>
						{copied ? (
							<Check className="h-4 w-4 text-green-600" />
						) : (
							<Link className="h-4 w-4" />
						)}
					</Button>
					<QrCodeDialog
						url={getRsvpUrl(group.rsvpToken)}
						groupName={group.name}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={onEdit}
						data-testid={`edit-group-${group.id}`}
						aria-label={`Edit ${group.name}`}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								data-testid={`delete-group-${group.id}`}
								aria-label={`Delete ${group.name}`}
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Group</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete "{group.name}"? This will also
									remove all {group.guests.length} guest
									{group.guests.length !== 1 ? "s" : ""} in this group. This
									action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={onDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									data-testid={`confirm-delete-group-${group.id}`}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			{/* Guest list (when expanded) */}
			{isExpanded && (
				<div className="border-t px-3 pb-3">
					{/* Add guest button */}
					<div className="py-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onAddGuest}
							disabled={editingGuestId !== null}
							data-testid={`add-guest-${group.id}`}
						>
							<UserPlus className="h-4 w-4" />
							Add Guest
						</Button>
					</div>

					{/* New guest editor */}
					{editingGuestId === "new" && (
						<div className="mb-2">
							<GuestEditor onSave={onSaveGuest} onCancel={onCancelGuest} />
						</div>
					)}

					{/* Guest list */}
					{group.guests.length === 0 && editingGuestId !== "new" ? (
						<p
							className="text-sm text-muted-foreground py-2 text-center"
							data-testid={`empty-guests-${group.id}`}
						>
							No guests in this group yet
						</p>
					) : (
						<div className="space-y-1">
							{group.guests.map((guest) =>
								editingGuestId === guest.id ? (
									<GuestEditor
										key={guest.id}
										initialValues={guest}
										onSave={onSaveGuest}
										onCancel={onCancelGuest}
									/>
								) : (
									<GuestItem
										key={guest.id}
										guest={guest}
										groupId={group.id}
										onEdit={() => onEditGuest(guest.id)}
										onDelete={() => onDeleteGuest(guest.id)}
									/>
								),
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

interface GuestGroupListProps {
	/** Callback when groups change (for server sync) */
	onGroupCreate?: (name: string) => Promise<{ id: string; rsvpToken: string }>;
	/** Callback when group is updated */
	onGroupUpdate?: (id: string, name: string) => Promise<void>;
	/** Callback when group is deleted */
	onGroupDelete?: (id: string) => Promise<void>;
	/** Callback when guest is created */
	onGuestCreate?: (
		groupId: string,
		guest: GuestEditorValues,
	) => Promise<{ id: string }>;
	/** Callback when guest is updated */
	onGuestUpdate?: (
		groupId: string,
		guestId: string,
		guest: GuestEditorValues,
	) => Promise<void>;
	/** Callback when guest is deleted */
	onGuestDelete?: (groupId: string, guestId: string) => Promise<void>;
}

/**
 * Guest group list component with collapsible groups and CRUD operations.
 */
export function GuestGroupList({
	onGroupCreate,
	onGroupUpdate,
	onGroupDelete,
	onGuestCreate,
	onGuestUpdate,
	onGuestDelete,
}: GuestGroupListProps) {
	const {
		invitation,
		addGuestGroup,
		updateGuestGroup,
		deleteGuestGroup,
		addGuest,
		updateGuest,
		deleteGuest,
	} = useInvitationBuilder();

	const guestGroups = invitation.guestGroups ?? [];

	// Track which group is being edited
	const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
	// Track expanded groups
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
	// Track which guest is being edited (format: "groupId:guestId" or "groupId:new")
	const [editingGuest, setEditingGuest] = useState<{
		groupId: string;
		guestId: string | null;
	} | null>(null);
	// Track saving state
	const [isSaving, setIsSaving] = useState(false);

	const toggleGroup = (groupId: string) => {
		setExpandedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(groupId)) {
				next.delete(groupId);
			} else {
				next.add(groupId);
			}
			return next;
		});
	};

	const handleAddGroupClick = () => {
		setEditingGroupId("new");
	};

	const handleSaveNewGroup = async (values: GuestGroupEditorValues) => {
		setIsSaving(true);
		try {
			if (onGroupCreate) {
				const { id, rsvpToken } = await onGroupCreate(values.name);
				addGuestGroup({ id, name: values.name, rsvpToken, guests: [] });
				// Auto-expand new group
				setExpandedGroups((prev) => new Set(prev).add(id));
			} else {
				// Generate temporary ID for optimistic update
				const tempId = `group-${Date.now()}`;
				const tempToken = `token-${Date.now()}`;
				addGuestGroup({
					id: tempId,
					name: values.name,
					rsvpToken: tempToken,
					guests: [],
				});
				setExpandedGroups((prev) => new Set(prev).add(tempId));
			}
		} finally {
			setIsSaving(false);
			setEditingGroupId(null);
		}
	};

	const handleSaveEditGroup = async (
		id: string,
		values: GuestGroupEditorValues,
	) => {
		setIsSaving(true);
		try {
			if (onGroupUpdate) {
				await onGroupUpdate(id, values.name);
			}
			updateGuestGroup(id, { name: values.name });
		} finally {
			setIsSaving(false);
			setEditingGroupId(null);
		}
	};

	const handleDeleteGroup = async (id: string) => {
		if (onGroupDelete) {
			await onGroupDelete(id);
		}
		deleteGuestGroup(id);
	};

	const handleAddGuestClick = (groupId: string) => {
		setEditingGuest({ groupId, guestId: "new" });
	};

	const handleSaveGuest = async (
		groupId: string,
		guestId: string | null,
		values: GuestEditorValues,
	) => {
		setIsSaving(true);
		try {
			if (guestId === "new" || guestId === null) {
				if (onGuestCreate) {
					const { id } = await onGuestCreate(groupId, values);
					addGuest(groupId, { id, ...values });
				} else {
					const tempId = `guest-${Date.now()}`;
					addGuest(groupId, { id: tempId, ...values });
				}
			} else {
				if (onGuestUpdate) {
					await onGuestUpdate(groupId, guestId, values);
				}
				updateGuest(groupId, guestId, values);
			}
		} finally {
			setIsSaving(false);
			setEditingGuest(null);
		}
	};

	const handleDeleteGuest = async (groupId: string, guestId: string) => {
		if (onGuestDelete) {
			await onGuestDelete(groupId, guestId);
		}
		deleteGuest(groupId, guestId);
	};

	const totalGuests = guestGroups.reduce((sum, g) => sum + g.guests.length, 0);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Guest Groups</h3>
					<p className="text-sm text-muted-foreground">
						{guestGroups.length} group{guestGroups.length !== 1 ? "s" : ""},{" "}
						{totalGuests} guest{totalGuests !== 1 ? "s" : ""}
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAddGroupClick}
					disabled={editingGroupId !== null}
					data-testid="add-group-button"
				>
					<Plus className="h-4 w-4" />
					Add Group
				</Button>
			</div>

			{/* New group editor */}
			{editingGroupId === "new" && (
				<GuestGroupEditor
					onSave={handleSaveNewGroup}
					onCancel={() => setEditingGroupId(null)}
					isSaving={isSaving}
				/>
			)}

			{guestGroups.length === 0 && editingGroupId !== "new" ? (
				<p
					className="text-sm text-muted-foreground py-4 text-center"
					data-testid="empty-groups-message"
				>
					No guest groups yet. Create a group to organize your guests (e.g.,
					Family, Friends, Colleagues).
				</p>
			) : (
				<div className="space-y-3" data-testid="guest-group-list">
					{guestGroups.map((group) =>
						editingGroupId === group.id ? (
							<GuestGroupEditor
								key={group.id}
								initialValues={{ name: group.name }}
								onSave={(values) => handleSaveEditGroup(group.id, values)}
								onCancel={() => setEditingGroupId(null)}
								isSaving={isSaving}
							/>
						) : (
							<GuestGroupItem
								key={group.id}
								group={group}
								isExpanded={expandedGroups.has(group.id)}
								onToggle={() => toggleGroup(group.id)}
								onEdit={() => setEditingGroupId(group.id)}
								onDelete={() => handleDeleteGroup(group.id)}
								onAddGuest={() => handleAddGuestClick(group.id)}
								onEditGuest={(guestId) =>
									setEditingGuest({ groupId: group.id, guestId })
								}
								onDeleteGuest={(guestId) =>
									handleDeleteGuest(group.id, guestId)
								}
								editingGuestId={
									editingGuest?.groupId === group.id
										? editingGuest.guestId
										: null
								}
								onSaveGuest={(values) =>
									handleSaveGuest(
										group.id,
										editingGuest?.guestId ?? null,
										values,
									)
								}
								onCancelGuest={() => setEditingGuest(null)}
							/>
						),
					)}
				</div>
			)}
		</div>
	);
}

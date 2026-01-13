import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import type { BasicInfoFormValues } from "@/components/BasicInfoForm";
import type { AutosaveStatus } from "@/hooks/useAutosave";

/**
 * Schedule block data for wedding timeline events
 */
export interface ScheduleBlock {
	id: string;
	title: string;
	/** Time in 24-hour format "HH:mm" */
	time?: string;
	description?: string;
	order: number;
}

/**
 * Note data for wedding notes/FAQ items (dress code, kids policy, etc.)
 */
export interface Note {
	id: string;
	title: string;
	description?: string;
	order: number;
}

/**
 * Guest data for individual guests in a group
 */
export interface Guest {
	id: string;
	name: string;
	email?: string;
	phone?: string;
}

/**
 * Guest group data with RSVP token for per-group RSVP links
 */
export interface GuestGroup {
	id: string;
	name: string;
	rsvpToken: string;
	guests: Guest[];
}

/**
 * Extended invitation data including DB fields not in BasicInfoFormValues
 */
export interface InvitationData extends BasicInfoFormValues {
	id: string;
	templateId?: string;
	accentColor?: string;
	fontPairing?: string;
	heroImageUrl?: string;
	scheduleBlocks?: ScheduleBlock[];
	notes?: Note[];
	guestGroups?: GuestGroup[];
}

interface InvitationBuilderContextValue {
	/** Current invitation data */
	invitation: InvitationData;
	/** Update invitation data (triggers preview update) */
	updateInvitation: (
		updates: Partial<
			Omit<InvitationData, "scheduleBlocks" | "notes" | "guestGroups">
		>,
	) => void;
	/** Current autosave status */
	autosaveStatus: AutosaveStatus;
	/** Set autosave status (called by autosave hook) */
	setAutosaveStatus: (status: AutosaveStatus) => void;
	/** Add a new schedule block */
	addScheduleBlock: (block: Omit<ScheduleBlock, "id" | "order">) => void;
	/** Update an existing schedule block */
	updateScheduleBlock: (id: string, updates: Partial<ScheduleBlock>) => void;
	/** Delete a schedule block */
	deleteScheduleBlock: (id: string) => void;
	/** Move a schedule block up or down in order */
	moveScheduleBlock: (id: string, direction: "up" | "down") => void;
	/** Add a new note */
	addNote: (note: Omit<Note, "id" | "order">) => void;
	/** Update an existing note */
	updateNote: (id: string, updates: Partial<Note>) => void;
	/** Delete a note */
	deleteNote: (id: string) => void;
	/** Move a note up or down in order */
	moveNote: (id: string, direction: "up" | "down") => void;
	/** Add a new guest group */
	addGuestGroup: (group: GuestGroup) => void;
	/** Update an existing guest group */
	updateGuestGroup: (
		id: string,
		updates: Partial<Omit<GuestGroup, "guests">>,
	) => void;
	/** Delete a guest group */
	deleteGuestGroup: (id: string) => void;
	/** Add a guest to a group */
	addGuest: (groupId: string, guest: Guest) => void;
	/** Update a guest */
	updateGuest: (
		groupId: string,
		guestId: string,
		updates: Partial<Guest>,
	) => void;
	/** Delete a guest */
	deleteGuest: (groupId: string, guestId: string) => void;
	/** Set all guest groups (for bulk import) */
	setGuestGroups: (groups: GuestGroup[]) => void;
}

const InvitationBuilderContext =
	createContext<InvitationBuilderContextValue | null>(null);

interface InvitationBuilderProviderProps {
	children: ReactNode;
	initialData: InvitationData;
}

/**
 * Generate a simple unique ID for new schedule blocks
 */
function generateBlockId(): string {
	return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generate a simple unique ID for new notes
 */
function generateNoteId(): string {
	return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Provider for invitation builder state.
 * Wraps form and preview components to share invitation data.
 */
export function InvitationBuilderProvider({
	children,
	initialData,
}: InvitationBuilderProviderProps) {
	const [invitation, setInvitation] = useState<InvitationData>(initialData);
	const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");

	const updateInvitation = useCallback(
		(
			updates: Partial<
				Omit<InvitationData, "scheduleBlocks" | "notes" | "guestGroups">
			>,
		) => {
			setInvitation((prev) => ({ ...prev, ...updates }));
		},
		[],
	);

	const addScheduleBlock = useCallback(
		(block: Omit<ScheduleBlock, "id" | "order">) => {
			setInvitation((prev) => {
				const blocks = prev.scheduleBlocks ?? [];
				const maxOrder =
					blocks.length > 0 ? Math.max(...blocks.map((b) => b.order)) : -1;
				const newBlock: ScheduleBlock = {
					...block,
					id: generateBlockId(),
					order: maxOrder + 1,
				};
				return { ...prev, scheduleBlocks: [...blocks, newBlock] };
			});
		},
		[],
	);

	const updateScheduleBlock = useCallback(
		(id: string, updates: Partial<ScheduleBlock>) => {
			setInvitation((prev) => {
				const blocks = prev.scheduleBlocks ?? [];
				return {
					...prev,
					scheduleBlocks: blocks.map((b) =>
						b.id === id ? { ...b, ...updates } : b,
					),
				};
			});
		},
		[],
	);

	const deleteScheduleBlock = useCallback((id: string) => {
		setInvitation((prev) => {
			const blocks = prev.scheduleBlocks ?? [];
			return {
				...prev,
				scheduleBlocks: blocks.filter((b) => b.id !== id),
			};
		});
	}, []);

	const moveScheduleBlock = useCallback(
		(id: string, direction: "up" | "down") => {
			setInvitation((prev) => {
				const blocks = prev.scheduleBlocks ?? [];
				if (blocks.length < 2) return prev;

				// Sort blocks by order to find adjacent blocks
				const sorted = [...blocks].sort((a, b) => a.order - b.order);
				const currentIndex = sorted.findIndex((b) => b.id === id);
				if (currentIndex === -1) return prev;

				// Determine target index
				const targetIndex =
					direction === "up" ? currentIndex - 1 : currentIndex + 1;

				// Check bounds
				if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

				// Swap order values
				const currentBlock = sorted[currentIndex];
				const targetBlock = sorted[targetIndex];
				const currentOrder = currentBlock.order;
				const targetOrder = targetBlock.order;

				return {
					...prev,
					scheduleBlocks: blocks.map((b) => {
						if (b.id === currentBlock.id) return { ...b, order: targetOrder };
						if (b.id === targetBlock.id) return { ...b, order: currentOrder };
						return b;
					}),
				};
			});
		},
		[],
	);

	const addNote = useCallback((note: Omit<Note, "id" | "order">) => {
		setInvitation((prev) => {
			const notes = prev.notes ?? [];
			const maxOrder =
				notes.length > 0 ? Math.max(...notes.map((n) => n.order)) : -1;
			const newNote: Note = {
				...note,
				id: generateNoteId(),
				order: maxOrder + 1,
			};
			return { ...prev, notes: [...notes, newNote] };
		});
	}, []);

	const updateNote = useCallback((id: string, updates: Partial<Note>) => {
		setInvitation((prev) => {
			const notes = prev.notes ?? [];
			return {
				...prev,
				notes: notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
			};
		});
	}, []);

	const deleteNote = useCallback((id: string) => {
		setInvitation((prev) => {
			const notes = prev.notes ?? [];
			return {
				...prev,
				notes: notes.filter((n) => n.id !== id),
			};
		});
	}, []);

	const moveNote = useCallback((id: string, direction: "up" | "down") => {
		setInvitation((prev) => {
			const notes = prev.notes ?? [];
			if (notes.length < 2) return prev;

			// Sort notes by order to find adjacent notes
			const sorted = [...notes].sort((a, b) => a.order - b.order);
			const currentIndex = sorted.findIndex((n) => n.id === id);
			if (currentIndex === -1) return prev;

			// Determine target index
			const targetIndex =
				direction === "up" ? currentIndex - 1 : currentIndex + 1;

			// Check bounds
			if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

			// Swap order values
			const currentNote = sorted[currentIndex];
			const targetNote = sorted[targetIndex];
			const currentOrder = currentNote.order;
			const targetOrder = targetNote.order;

			return {
				...prev,
				notes: notes.map((n) => {
					if (n.id === currentNote.id) return { ...n, order: targetOrder };
					if (n.id === targetNote.id) return { ...n, order: currentOrder };
					return n;
				}),
			};
		});
	}, []);

	// Guest group operations
	const addGuestGroup = useCallback((group: GuestGroup) => {
		setInvitation((prev) => {
			const groups = prev.guestGroups ?? [];
			return { ...prev, guestGroups: [...groups, group] };
		});
	}, []);

	const updateGuestGroup = useCallback(
		(id: string, updates: Partial<Omit<GuestGroup, "guests">>) => {
			setInvitation((prev) => {
				const groups = prev.guestGroups ?? [];
				return {
					...prev,
					guestGroups: groups.map((g) =>
						g.id === id ? { ...g, ...updates } : g,
					),
				};
			});
		},
		[],
	);

	const deleteGuestGroup = useCallback((id: string) => {
		setInvitation((prev) => {
			const groups = prev.guestGroups ?? [];
			return {
				...prev,
				guestGroups: groups.filter((g) => g.id !== id),
			};
		});
	}, []);

	const addGuest = useCallback((groupId: string, guest: Guest) => {
		setInvitation((prev) => {
			const groups = prev.guestGroups ?? [];
			return {
				...prev,
				guestGroups: groups.map((g) =>
					g.id === groupId ? { ...g, guests: [...g.guests, guest] } : g,
				),
			};
		});
	}, []);

	const updateGuest = useCallback(
		(groupId: string, guestId: string, updates: Partial<Guest>) => {
			setInvitation((prev) => {
				const groups = prev.guestGroups ?? [];
				return {
					...prev,
					guestGroups: groups.map((g) =>
						g.id === groupId
							? {
									...g,
									guests: g.guests.map((guest) =>
										guest.id === guestId ? { ...guest, ...updates } : guest,
									),
								}
							: g,
					),
				};
			});
		},
		[],
	);

	const deleteGuest = useCallback((groupId: string, guestId: string) => {
		setInvitation((prev) => {
			const groups = prev.guestGroups ?? [];
			return {
				...prev,
				guestGroups: groups.map((g) =>
					g.id === groupId
						? { ...g, guests: g.guests.filter((guest) => guest.id !== guestId) }
						: g,
				),
			};
		});
	}, []);

	const setGuestGroups = useCallback((groups: GuestGroup[]) => {
		setInvitation((prev) => ({ ...prev, guestGroups: groups }));
	}, []);

	return (
		<InvitationBuilderContext.Provider
			value={{
				invitation,
				updateInvitation,
				autosaveStatus,
				setAutosaveStatus,
				addScheduleBlock,
				updateScheduleBlock,
				deleteScheduleBlock,
				moveScheduleBlock,
				addNote,
				updateNote,
				deleteNote,
				moveNote,
				addGuestGroup,
				updateGuestGroup,
				deleteGuestGroup,
				addGuest,
				updateGuest,
				deleteGuest,
				setGuestGroups,
			}}
		>
			{children}
		</InvitationBuilderContext.Provider>
	);
}

/**
 * Hook to access invitation builder context.
 * Must be used within InvitationBuilderProvider.
 */
export function useInvitationBuilder(): InvitationBuilderContextValue {
	const context = useContext(InvitationBuilderContext);
	if (!context) {
		throw new Error(
			"useInvitationBuilder must be used within InvitationBuilderProvider",
		);
	}
	return context;
}

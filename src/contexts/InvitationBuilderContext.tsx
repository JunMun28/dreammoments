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
 * Extended invitation data including DB fields not in BasicInfoFormValues
 */
export interface InvitationData extends BasicInfoFormValues {
	id: string;
	templateId?: string;
	accentColor?: string;
	fontPairing?: string;
	heroImageUrl?: string;
	scheduleBlocks?: ScheduleBlock[];
}

interface InvitationBuilderContextValue {
	/** Current invitation data */
	invitation: InvitationData;
	/** Update invitation data (triggers preview update) */
	updateInvitation: (updates: Partial<BasicInfoFormValues>) => void;
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
		(updates: Partial<BasicInfoFormValues>) => {
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

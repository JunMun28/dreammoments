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
 * Extended invitation data including DB fields not in BasicInfoFormValues
 */
export interface InvitationData extends BasicInfoFormValues {
	id: string;
	templateId?: string;
	accentColor?: string;
	fontPairing?: string;
	heroImageUrl?: string;
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
}

const InvitationBuilderContext =
	createContext<InvitationBuilderContextValue | null>(null);

interface InvitationBuilderProviderProps {
	children: ReactNode;
	initialData: InvitationData;
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

	return (
		<InvitationBuilderContext.Provider
			value={{
				invitation,
				updateInvitation,
				autosaveStatus,
				setAutosaveStatus,
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

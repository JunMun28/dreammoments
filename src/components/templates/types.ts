import type { InvitationContent } from "../../lib/types";

export type TemplateRenderMode = "public" | "editor" | "preview";

export type RsvpPayload = {
	name: string;
	attendance: "attending" | "not_attending" | "undecided";
	guestCount: number;
	dietaryRequirements?: string;
	message?: string;
	email?: string;
};

export type TemplateInvitationProps = {
	content: InvitationContent;
	hiddenSections?: Record<string, boolean>;
	mode?: TemplateRenderMode;
	onSectionSelect?: (sectionId: string) => void;
	onAiClick?: (sectionId: string) => void;
	onInlineEdit?: (fieldPath: string) => void;
	onRsvpSubmit?: (payload: RsvpPayload) => void;
	rsvpStatus?: string;
};

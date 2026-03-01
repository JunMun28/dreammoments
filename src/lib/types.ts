export type PlanTier = "free" | "premium";
export type AuthProvider = "google" | "email";
export type InvitationStatus = "draft" | "published" | "archived";
export type AttendanceStatus = "attending" | "not_attending" | "undecided";
export type PaymentStatus = "pending" | "succeeded" | "failed";
export type DeviceType = "mobile" | "tablet" | "desktop";

export interface User {
	id: string;
	email: string;
	name?: string;
	avatarUrl?: string;
	authProvider: AuthProvider;
	plan: PlanTier;
	createdAt: string;
	updatedAt: string;
}

export interface InvitationContent {
	hero: {
		partnerOneName: string;
		partnerTwoName: string;
		tagline: string;
		date: string;
		heroImageUrl?: string;
		avatarImageUrl?: string;
		avatarStyle?: "pixar" | "ghibli";
		animatedVideoUrl?: string;
	};
	announcement: {
		title: string;
		message: string;
		formalText: string;
	};
	couple: {
		partnerOne: {
			fullName: string;
			bio: string;
			photoUrl?: string;
		};
		partnerTwo: {
			fullName: string;
			bio: string;
			photoUrl?: string;
		};
	};
	story: {
		milestones: Array<{
			date: string;
			title: string;
			description: string;
			photoUrl?: string;
		}>;
	};
	gallery: {
		photos: Array<{
			url: string;
			caption?: string;
		}>;
	};
	schedule: {
		events: Array<{
			time: string;
			title: string;
			description: string;
			icon?: string;
		}>;
	};
	venue: {
		name: string;
		address: string;
		coordinates: { lat: number; lng: number };
		directions: string;
		parkingInfo?: string;
	};
	entourage: {
		members: Array<{
			role: string;
			name: string;
		}>;
	};
	registry: {
		title: string;
		note: string;
	};
	rsvp: {
		deadline: string;
		allowPlusOnes: boolean;
		maxPlusOnes: number;
		dietaryOptions: string[];
		customMessage: string;
	};
	faq: {
		items: Array<{
			question: string;
			answer: string;
		}>;
	};
	footer: {
		message: string;
		socialLinks?: {
			instagram?: string;
			hashtag?: string;
		};
	};
	details: {
		scheduleSummary: string;
		venueSummary: string;
	};
	calendar: {
		dateLabel: string;
		message: string;
	};
	countdown: {
		targetDate: string;
	};
	gift?: {
		paymentUrl: string;
		paymentMethod: "duitnow" | "paynow" | "tng";
		recipientName?: string;
	};
	musicUrl?: string;
}

export interface Invitation {
	id: string;
	userId: string;
	slug: string;
	title: string;
	templateId: string;
	templateVersion: string;
	templateSnapshot?: Record<string, unknown>;
	content: InvitationContent;
	sectionVisibility: Record<string, boolean>;
	designOverrides: Record<string, unknown>;
	status: InvitationStatus;
	publishedAt?: string;
	aiGenerationsUsed: number;
	invitedCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface Guest {
	id: string;
	invitationId: string;
	name: string;
	email?: string;
	phone?: string;
	relationship?: string;
	attendance?: AttendanceStatus;
	guestCount: number;
	dietaryRequirements?: string;
	message?: string;
	userId?: string;
	rsvpSubmittedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface InvitationView {
	id: string;
	invitationId: string;
	viewedAt: string;
	userAgent: string;
	referrer?: string;
	visitorHash: string;
	deviceType: DeviceType;
}

export interface AiGeneration {
	id: string;
	invitationId: string;
	sectionId: string;
	prompt: string;
	generatedContent: Record<string, unknown>;
	accepted: boolean;
	status?: string;
	externalJobId?: string;
	resultUrl?: string;
	createdAt: string;
}

export interface InvitationSnapshot {
	id: string;
	invitationId: string;
	content: Record<string, unknown>;
	designOverrides?: Record<string, unknown>;
	reason?: string;
	createdAt: string;
}

export interface Payment {
	id: string;
	userId: string;
	invitationId?: string;
	stripePaymentIntentId?: string;
	stripeCustomerId?: string;
	amountCents: number;
	currency: "MYR" | "SGD";
	status: PaymentStatus;
	createdAt: string;
}

import { generateAiContentFn } from "@/api/ai";
import type { InvitationContent } from "./types";

// ── Romantic tagline pool for mock fallback ─────────────────────────

const romanticWords = [
	"Two hearts, one promise",
	"Under the stars, always",
	"Forever begins with you",
];

function pick(list: string[]) {
	return list[Math.floor(Math.random() * list.length)];
}

// ── Main export: tries real AI, falls back to mock ──────────────────

export async function generateAiContent({
	type,
	sectionId,
	prompt,
	context,
	token,
}: {
	type: "schedule" | "faq" | "story" | "tagline" | "style" | "translate";
	sectionId: string;
	prompt: string;
	context: InvitationContent;
	token?: string;
}) {
	try {
		const result = await generateAiContentFn({
			data: {
				token: token ?? localStorage.getItem("dm-auth-token") ?? "",
				type,
				sectionId,
				prompt,
				context: context as unknown as Record<string, unknown>,
			},
		});
		return result;
	} catch (error) {
		// If the server indicates AI is not configured, use mock data silently
		if (error instanceof Error && error.message.includes("AI_NOT_CONFIGURED")) {
			return generateMockContent({ type, sectionId, prompt, context });
		}

		// For other errors, log and fall back to mock data
		console.warn("AI generation failed, using mock data:", error);
		return generateMockContent({ type, sectionId, prompt, context });
	}
}

// ── Mock content generator (fallback) ───────────────────────────────

function generateMockContent({
	type,
	sectionId: _sectionId,
	prompt,
	context,
}: {
	type: "schedule" | "faq" | "story" | "tagline" | "style" | "translate";
	sectionId: string;
	prompt: string;
	context: InvitationContent;
}) {
	if (type === "schedule") {
		return {
			events: [
				{ time: "3:00 PM", title: "Arrival", description: "Welcome drinks" },
				{
					time: "3:30 PM",
					title: "Ceremony",
					description: "Exchange of vows",
				},
				{ time: "4:30 PM", title: "Photos", description: "Group portraits" },
				{
					time: "6:00 PM",
					title: "Dinner",
					description: "Reception begins",
				},
				{
					time: "8:30 PM",
					title: "Celebration",
					description: "Toasts and dance",
				},
			],
		};
	}

	if (type === "faq") {
		return {
			items: [
				{ question: "Dress code?", answer: "Smart casual with soft tones." },
				{ question: "Parking?", answer: "Valet parking is available." },
				{
					question: "Plus ones?",
					answer: "Please RSVP for allocated seats.",
				},
				{ question: "Dietary needs?", answer: "Let us know in RSVP." },
			],
		};
	}

	if (type === "story") {
		return {
			milestones: [
				{
					date: "2018",
					title: "We met",
					description: "A campus coffee turned into laughter.",
				},
				{
					date: "2020",
					title: "We grew",
					description: "Adventures across cities and sunsets.",
				},
				{
					date: "2024",
					title: "We said yes",
					description: "A quiet proposal with loud hearts.",
				},
			],
		};
	}

	if (type === "tagline") {
		return { tagline: pick(romanticWords) };
	}

	if (type === "translate") {
		const base = prompt || context.announcement.message;
		return {
			translation: `这是一段温柔的邀请：${base}`,
		};
	}

	if (type === "style") {
		const wantsRomantic = /romantic|暖|warm|gold|rose/i.test(prompt);
		return {
			cssVars: {
				"--love-accent": wantsRomantic ? "#D4AF37" : "#E8B4B8",
				"--love-primary": wantsRomantic ? "#B30E0E" : "#2D5A3D",
				"--love-secondary": wantsRomantic ? "#741212" : "#1C1C1C",
				"--garden-accent": "#E8B4B8",
				"--eternal-gold": "#C9A962",
			},
			animationIntensity: wantsRomantic ? 1.1 : 0.9,
		};
	}

	return { message: "No generation" };
}

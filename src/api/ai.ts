import { createServerFn } from "@tanstack/react-start";

// ── Types ───────────────────────────────────────────────────────────

type AiGenerationType =
	| "schedule"
	| "faq"
	| "story"
	| "tagline"
	| "style"
	| "translate";

interface AiRequestData {
	type: AiGenerationType;
	sectionId: string;
	prompt: string;
	context: Record<string, unknown>;
}

// ── System Prompts ──────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<AiGenerationType, string> = {
	schedule: `You are a wedding planner AI specializing in Malaysian and Singaporean Chinese weddings.
Generate a wedding day timeline based on the user's prompt and context.
Consider common traditions such as tea ceremony (敬茶), door games (闹门), and Chinese banquet customs.
Return ONLY valid JSON in this exact format, with no additional text:
{
  "events": [
    { "time": "HH:MM AM/PM", "title": "Event Title", "description": "Brief description" }
  ]
}
Generate 5-8 events covering the full wedding day. Use 12-hour time format.
If the couple's names are provided in context, personalize the descriptions.`,

	faq: `You are a wedding planner AI specializing in Malaysian and Singaporean Chinese weddings.
Generate frequently asked questions and answers for a wedding invitation.
Include culturally relevant items such as ang pao/红包 guidance, dress code, dietary accommodations (halal options if relevant), parking, and plus-one policies.
Return ONLY valid JSON in this exact format, with no additional text:
{
  "items": [
    { "question": "Question text?", "answer": "Answer text." }
  ]
}
Generate 4-6 FAQ items. Keep answers concise and warm.`,

	story: `You are a romantic storyteller AI creating love story timelines for Malaysian and Singaporean Chinese couples.
Generate love story milestones based on the user's prompt and any context provided.
Capture the warmth and cultural nuances of the couple's journey.
Return ONLY valid JSON in this exact format, with no additional text:
{
  "milestones": [
    { "date": "Year or date", "title": "Milestone title", "description": "Brief romantic description" }
  ]
}
Generate 3-5 milestones. If the couple's names or wedding date are in context, personalize accordingly.`,

	tagline: `You are a poetic AI creating romantic taglines for wedding invitations.
The tagline should be elegant, concise, and suitable for Malaysian/Singaporean Chinese couples.
It can be in English, bilingual (English + Chinese), or based on the user's preference.
Return ONLY valid JSON in this exact format, with no additional text:
{
  "tagline": "Your romantic tagline here"
}
Keep it to one line, maximum 60 characters. Make it heartfelt and timeless.`,

	translate: `You are a professional translator specializing in wedding invitation content.
Translate the given text into Simplified Chinese (Mandarin).
Maintain the formal, romantic, and elegant tone appropriate for wedding invitations.
Use culturally appropriate phrasing for Malaysian/Singaporean Chinese audiences.
Return ONLY valid JSON in this exact format, with no additional text:
{
  "translation": "Translated text here"
}
Preserve the meaning and emotional tone of the original text.`,

	style: `You are a wedding design AI that generates CSS custom property values for wedding invitation themes.
Based on the user's style description, generate a color palette and animation settings.
Consider traditional Chinese wedding colors (red, gold) as well as modern palettes.
Return ONLY valid JSON in this exact format, with no additional text:
{
  "cssVars": {
    "--love-accent": "#hexcolor",
    "--love-primary": "#hexcolor",
    "--love-secondary": "#hexcolor",
    "--garden-accent": "#hexcolor",
    "--eternal-gold": "#hexcolor"
  },
  "animationIntensity": 1.0
}
Use valid hex color values. animationIntensity should be between 0.5 and 1.5.
Match the mood described by the user (romantic, modern, traditional, minimal, etc).`,
};

// ── Build user prompt with context ──────────────────────────────────

function buildUserPrompt(data: AiRequestData): string {
	const contextParts: string[] = [];

	const ctx = data.context;
	if (ctx.hero && typeof ctx.hero === "object") {
		const hero = ctx.hero as Record<string, unknown>;
		if (hero.partnerOneName || hero.partnerTwoName) {
			contextParts.push(
				`Couple: ${hero.partnerOneName ?? ""} & ${hero.partnerTwoName ?? ""}`,
			);
		}
		if (hero.date) {
			contextParts.push(`Wedding date: ${hero.date}`);
		}
	}

	if (ctx.venue && typeof ctx.venue === "object") {
		const venue = ctx.venue as Record<string, unknown>;
		if (venue.name) {
			contextParts.push(`Venue: ${venue.name}`);
		}
	}

	if (data.type === "translate" && data.prompt) {
		return `Translate the following text to Simplified Chinese:\n\n${data.prompt}`;
	}

	const contextSection =
		contextParts.length > 0
			? `\n\nWedding context:\n${contextParts.join("\n")}`
			: "";

	return `${data.prompt}${contextSection}`;
}

// ── Parse AI response ───────────────────────────────────────────────

function parseAiResponse(
	type: AiGenerationType,
	raw: string,
): Record<string, unknown> {
	// Try to extract JSON from the response (handle markdown code blocks)
	let jsonStr = raw.trim();

	// Remove markdown code block wrappers if present
	const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeBlockMatch) {
		jsonStr = codeBlockMatch[1].trim();
	}

	const parsed = JSON.parse(jsonStr);

	// Validate the parsed response matches expected structure
	switch (type) {
		case "schedule": {
			if (!Array.isArray(parsed.events)) {
				throw new Error("Invalid schedule response: missing events array");
			}
			return {
				events: parsed.events.map(
					(e: { time?: string; title?: string; description?: string }) => ({
						time: String(e.time ?? ""),
						title: String(e.title ?? ""),
						description: String(e.description ?? ""),
					}),
				),
			};
		}
		case "faq": {
			if (!Array.isArray(parsed.items)) {
				throw new Error("Invalid FAQ response: missing items array");
			}
			return {
				items: parsed.items.map(
					(i: { question?: string; answer?: string }) => ({
						question: String(i.question ?? ""),
						answer: String(i.answer ?? ""),
					}),
				),
			};
		}
		case "story": {
			if (!Array.isArray(parsed.milestones)) {
				throw new Error("Invalid story response: missing milestones array");
			}
			return {
				milestones: parsed.milestones.map(
					(m: { date?: string; title?: string; description?: string }) => ({
						date: String(m.date ?? ""),
						title: String(m.title ?? ""),
						description: String(m.description ?? ""),
					}),
				),
			};
		}
		case "tagline": {
			if (typeof parsed.tagline !== "string") {
				throw new Error("Invalid tagline response: missing tagline string");
			}
			return { tagline: parsed.tagline };
		}
		case "translate": {
			if (typeof parsed.translation !== "string") {
				throw new Error(
					"Invalid translation response: missing translation string",
				);
			}
			return { translation: parsed.translation };
		}
		case "style": {
			if (!parsed.cssVars || typeof parsed.cssVars !== "object") {
				throw new Error("Invalid style response: missing cssVars object");
			}
			return {
				cssVars: parsed.cssVars as Record<string, string>,
				animationIntensity: Number(parsed.animationIntensity ?? 1.0),
			};
		}
		default:
			return parsed;
	}
}

// ── Server Function ─────────────────────────────────────────────────

export const generateAiContentFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			type: "schedule" | "faq" | "story" | "tagline" | "style" | "translate";
			sectionId: string;
			prompt: string;
			context: Record<string, unknown>;
		}) => data,
	)
	.handler(async ({ data }) => {
		const apiKey = process.env.AI_API_KEY;

		if (!apiKey) {
			throw new Error("AI_NOT_CONFIGURED");
		}

		const baseUrl = (
			process.env.AI_API_URL ?? "https://api.openai.com/v1"
		).replace(/\/+$/, "");
		const model = process.env.AI_MODEL ?? "gpt-4o-mini";

		const systemPrompt = SYSTEM_PROMPTS[data.type];
		const userPrompt = buildUserPrompt(data);

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30_000);

		try {
			const response = await fetch(`${baseUrl}/chat/completions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model,
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userPrompt },
					],
					temperature: 0.7,
					max_tokens: 1024,
					response_format: { type: "json_object" },
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				const errorBody = await response.text().catch(() => "Unknown error");
				if (response.status === 429) {
					throw new Error(
						"AI service is busy. Please wait a moment and try again.",
					);
				}
				if (response.status === 401 || response.status === 403) {
					throw new Error(
						"AI service authentication failed. Please contact support.",
					);
				}
				throw new Error(
					`AI service error (${response.status}): ${errorBody.slice(0, 200)}`,
				);
			}

			const json = (await response.json()) as {
				choices?: Array<{
					message?: { content?: string };
				}>;
				error?: { message?: string };
			};

			if (json.error) {
				throw new Error(
					`AI API error: ${json.error.message ?? "Unknown error"}`,
				);
			}

			const content = json.choices?.[0]?.message?.content;
			if (!content) {
				throw new Error("AI returned an empty response. Please try again.");
			}

			return parseAiResponse(data.type, content);
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error(
					"AI request timed out after 30 seconds. Please try again with a simpler prompt.",
				);
			}
			throw error;
		} finally {
			clearTimeout(timeout);
		}
	});

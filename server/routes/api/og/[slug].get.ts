import {
	defineEventHandler,
	getRouterParam,
	setResponseHeader,
} from "nitro/h3";
import { Client } from "pg";

// Template colors aligned with actual template token definitions
const templateColors: Record<
	string,
	{ bg: string; text: string; accent: string; muted: string }
> = {
	"blush-romance": {
		bg: "#FFF6F8",
		text: "#1A0F14",
		accent: "#D94674",
		muted: "#6F5561",
	},
	"garden-romance": {
		bg: "#0D0D0D",
		text: "#FFF8E7",
		accent: "#D4AF37",
		muted: "#A09080",
	},
	"eternal-elegance": {
		bg: "#FFFFFF",
		text: "#333333",
		accent: "#C9A962",
		muted: "#6F6F6F",
	},
	"love-at-dusk": {
		bg: "#0c0a08",
		text: "#F5F5F5",
		accent: "#FFE094",
		muted: "#B7A38A",
	},
};

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function parseCoupleNames(slug: string): {
	name1: string;
	name2: string;
} {
	const cleaned = slug
		.replace(/-sample$/, "")
		.replace(
			/-(blush-romance|garden-romance|eternal-elegance|love-at-dusk)$/,
			"",
		);
	const parts = cleaned.split("-").filter(Boolean);
	if (parts.length >= 2) {
		const capitalize = (s: string) =>
			s.charAt(0).toUpperCase() + s.slice(1);
		return {
			name1: capitalize(parts[0]),
			name2: capitalize(parts[parts.length - 1]),
		};
	}
	return { name1: "Wedding", name2: "Invitation" };
}

function resolveTemplate(slug: string): string {
	if (slug.includes("blush-romance")) return "blush-romance";
	if (slug.includes("garden-romance")) return "garden-romance";
	if (slug.includes("eternal-elegance")) return "eternal-elegance";
	if (slug.includes("love-at-dusk")) return "love-at-dusk";
	return "blush-romance";
}

interface OgData {
	name1: string;
	name2: string;
	date: string;
	templateId: string;
}

async function fetchInvitationBySlug(
	slug: string,
): Promise<OgData | null> {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) return null;

	let client: Client | null = null;
	try {
		client = new Client({ connectionString: databaseUrl });
		await client.connect();
		const result = await client.query(
			`SELECT content, template_id FROM invitations WHERE slug = $1 AND status = 'published' LIMIT 1`,
			[slug],
		);
		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		const content = row.content as Record<string, unknown>;
		const hero = content?.hero as
			| Record<string, unknown>
			| undefined;
		if (!hero) return null;

		return {
			name1: String(hero.partnerOneName ?? ""),
			name2: String(hero.partnerTwoName ?? ""),
			date: String(hero.date ?? ""),
			templateId: String(row.template_id ?? ""),
		};
	} catch {
		return null;
	} finally {
		await client?.end().catch(() => {});
	}
}

function generateOgSvg(data: OgData): string {
	const colors =
		templateColors[data.templateId] ?? templateColors["blush-romance"];
	const n1 = escapeXml(data.name1);
	const n2 = escapeXml(data.name2);
	const date = data.date ? escapeXml(data.date) : "";

	const dateElement = date
		? `<text x="600" y="440" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${colors.muted}">${date}</text>`
		: "";

	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${colors.bg}"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.4"/>
  <text x="600" y="180" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" letter-spacing="8" fill="${colors.accent}" opacity="0.8">YOU'RE INVITED</text>
  <text x="600" y="260" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="${colors.text}">${n1}</text>
  <text x="600" y="320" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="32" fill="${colors.accent}">&amp;</text>
  <text x="600" y="390" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="${colors.text}">${n2}</text>
  ${dateElement}
  <line x1="480" y1="480" x2="720" y2="480" stroke="${colors.accent}" stroke-width="1" opacity="0.5"/>
  <text x="600" y="560" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" letter-spacing="6" fill="${colors.muted}" opacity="0.6">DREAMMOMENTS</text>
</svg>`;
}

function generateFallbackSvg(): string {
	const colors = templateColors["blush-romance"];
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${colors.bg}"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.4"/>
  <text x="600" y="290" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" fill="${colors.text}">Wedding Invitation</text>
  <line x1="480" y1="340" x2="720" y2="340" stroke="${colors.accent}" stroke-width="1" opacity="0.5"/>
  <text x="600" y="560" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" letter-spacing="6" fill="${colors.muted}" opacity="0.6">DREAMMOMENTS</text>
</svg>`;
}

export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, "slug") ?? "";

	setResponseHeader(event, "Content-Type", "image/svg+xml");
	setResponseHeader(
		event,
		"Cache-Control",
		"public, max-age=86400",
	);

	if (!slug) {
		return generateFallbackSvg();
	}

	// Try DB lookup for real invitation data
	const dbData = await fetchInvitationBySlug(slug);

	if (dbData && dbData.name1 && dbData.name2) {
		return generateOgSvg(dbData);
	}

	// Fallback: parse from slug
	const { name1, name2 } = parseCoupleNames(slug);
	const templateId = resolveTemplate(slug);
	return generateOgSvg({ name1, name2, date: "", templateId });
});

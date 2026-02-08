import { defineEventHandler, getRouterParam, setResponseHeader } from "nitro/h3";

const templateColors: Record<string, { bg: string; text: string; accent: string }> = {
	"blush-romance": { bg: "#FDFCF8", text: "#292524", accent: "#FFB7B2" },
	"garden-romance": { bg: "#1A1A1A", text: "#FFF8E7", accent: "#D4AF37" },
	"eternal-elegance": { bg: "#1C1C1C", text: "#FFFFFF", accent: "#C9A962" },
	"love-at-dusk": { bg: "#0d0a09", text: "#FFF8E7", accent: "#8B2942" },
};

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function parseCoupleNames(slug: string): string {
	const cleaned = slug
		.replace(/-sample$/, "")
		.replace(/-(blush-romance|garden-romance|eternal-elegance|love-at-dusk)$/, "");
	const parts = cleaned.split("-").filter(Boolean);
	if (parts.length >= 2) {
		const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
		return `${capitalize(parts[0])} & ${capitalize(parts[parts.length - 1])}`;
	}
	return "Wedding Invitation";
}

function resolveTemplate(slug: string): string {
	if (slug.includes("blush-romance")) return "blush-romance";
	if (slug.includes("garden-romance")) return "garden-romance";
	if (slug.includes("eternal-elegance")) return "eternal-elegance";
	if (slug.includes("love-at-dusk")) return "love-at-dusk";
	return "blush-romance";
}

function generateOgSvg(names: string, templateId: string): string {
	const colors = templateColors[templateId] ?? templateColors["blush-romance"];

	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${colors.bg}"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.4"/>
  <text x="600" y="220" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="28" letter-spacing="8" fill="${colors.accent}">YOU'RE INVITED</text>
  <text x="600" y="320" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="${colors.text}">${escapeXml(names)}</text>
  <line x1="480" y1="370" x2="720" y2="370" stroke="${colors.accent}" stroke-width="1"/>
  <text x="600" y="540" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" letter-spacing="6" fill="${colors.accent}" opacity="0.6">DREAMMOMENTS</text>
</svg>`;
}

export default defineEventHandler((event) => {
	const slug = getRouterParam(event, "slug") ?? "";
	const names = parseCoupleNames(slug);
	const templateId = resolveTemplate(slug);
	const svg = generateOgSvg(names, templateId);

	setResponseHeader(event, "Content-Type", "image/svg+xml");
	setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");

	return svg;
});

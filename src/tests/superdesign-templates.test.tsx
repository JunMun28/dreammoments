import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import SuperDesignInvitation from "../components/templates/superdesign/SuperDesignInvitation";
import type { TemplateInvitationProps } from "../components/templates/types";
import { buildSampleContent } from "../data/sample-invitation";
import { templates } from "../templates";
import { superdesignTemplates } from "../templates/superdesign";
import type { DesignTokens } from "../templates/types";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

/* ─── Helpers ─── */

function renderTemplate(
	tokens?: DesignTokens,
	overrides?: Partial<TemplateInvitationProps>,
) {
	const content = buildSampleContent("double-happiness");
	return renderToString(
		<SuperDesignInvitation content={content} tokens={tokens} {...overrides} />,
	);
}

/* ─── SuperDesign template registry tests ─── */

describe("superdesign template registry", () => {
	test("all 58 SuperDesign templates are in the main registry", () => {
		const mainIds = templates.map((t) => t.id);
		for (const sd of superdesignTemplates) {
			expect(mainIds).toContain(sd.id);
		}
	});

	test("all SuperDesign template IDs start with sd-", () => {
		for (const sd of superdesignTemplates) {
			expect(sd.id).toMatch(/^sd-/);
		}
	});

	test("has exactly 58 SuperDesign templates", () => {
		expect(superdesignTemplates.length).toBe(58);
	});

	test("all SuperDesign templates have valid design tokens", () => {
		for (const t of superdesignTemplates) {
			expect(t.tokens.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(t.tokens.colors.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(t.tokens.colors.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(t.tokens.colors.background).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(t.tokens.colors.text).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(t.tokens.colors.muted).toMatch(/^#[0-9a-fA-F]{6}$/);
			expect(t.tokens.typography.headingFont).toBeTruthy();
			expect(t.tokens.typography.bodyFont).toBeTruthy();
			expect(t.tokens.typography.accentFont).toBeTruthy();
		}
	});

	test("all SuperDesign templates have core wedding sections", () => {
		const coreSections = ["hero", "couple", "rsvp", "footer"];
		for (const t of superdesignTemplates) {
			const sectionIds = t.sections.map((s) => s.id);
			for (const required of coreSections) {
				expect(sectionIds, `${t.id} missing section '${required}'`).toContain(
					required,
				);
			}
		}
	});
});

/* ─── SuperDesign component rendering tests ─── */

describe("SuperDesignInvitation component", () => {
	test("renders all default-visible sections", () => {
		const html = renderTemplate();
		const sections = [...html.matchAll(/data-section="([^"]+)"/g)].map(
			(m) => m[1],
		);
		expect(sections).toContain("hero");
		expect(sections).toContain("announcement");
		expect(sections).toContain("couple");
		expect(sections).toContain("story");
		expect(sections).toContain("gallery");
		expect(sections).toContain("countdown");
		expect(sections).toContain("schedule");
		expect(sections).toContain("venue");
		expect(sections).toContain("rsvp");
		expect(sections).toContain("footer");
	});

	test("renders sections in correct order", () => {
		const html = renderTemplate();
		const sections = [...html.matchAll(/data-section="([^"]+)"/g)].map(
			(m) => m[1],
		);
		expect(sections.indexOf("hero")).toBeLessThan(sections.indexOf("couple"));
		expect(sections.indexOf("couple")).toBeLessThan(sections.indexOf("rsvp"));
		expect(sections.indexOf("rsvp")).toBeLessThan(sections.indexOf("footer"));
	});

	test("renders couple names from content", () => {
		const html = renderTemplate();
		expect(html).toContain("俊明");
		expect(html).toContain("诗婷");
	});

	test("renders bilingual labels", () => {
		const html = renderTemplate();
		// Chinese section labels
		expect(html).toContain("诚 挚 邀 请");
		expect(html).toContain("新 人 简 介");
		expect(html).toContain("我们的故事");
		expect(html).toContain("敬 请 回 复");
		// English
		expect(html).toContain("RSVP");
		expect(html).toContain("The Couple");
	});

	test("renders RSVP form with all required fields", () => {
		const html = renderTemplate();
		expect(html).toContain('name="name"');
		expect(html).toContain('name="email"');
		expect(html).toContain('name="attendance"');
		expect(html).toContain('name="guestCount"');
		expect(html).toContain('name="dietary"');
		expect(html).toContain('name="message"');
		expect(html).toContain('name="consent"');
	});

	test("renders dietary options including halal", () => {
		const html = renderTemplate();
		expect(html).toContain("Halal");
		expect(html).toContain("Vegetarian");
		expect(html).toContain("No Beef");
		expect(html).toContain("No Seafood");
	});

	test("renders 囍 symbol in footer", () => {
		const html = renderTemplate();
		expect(html).toContain("囍");
	});

	test("renders privacy policy link in RSVP consent", () => {
		const html = renderTemplate();
		expect(html).toContain("/privacy");
		expect(html).toContain("Privacy Policy");
	});

	test("hides sections via hiddenSections prop", () => {
		const html = renderTemplate(undefined, {
			hiddenSections: { gallery: true, countdown: true },
		});
		expect(html).not.toContain('data-section="gallery"');
		expect(html).not.toContain('data-section="countdown"');
		// Other sections still present
		expect(html).toContain('data-section="hero"');
		expect(html).toContain('data-section="rsvp"');
	});

	test("does not render BottomActionBar in editor mode", () => {
		const html = renderTemplate(undefined, { mode: "editor" });
		expect(html).not.toContain("bottom-action-bar");
	});

	test("does not render MusicPlayer in editor mode", () => {
		const content = buildSampleContent("double-happiness");
		content.musicUrl = "https://example.com/song.mp3";
		const html = renderToString(
			<SuperDesignInvitation content={content} mode="editor" />,
		);
		expect(html).not.toContain("audio");
	});
});

/* ─── Token-driven styling tests ─── */

describe("token-driven styling", () => {
	const darkTokens: DesignTokens = {
		colors: {
			primary: "#ccff00",
			secondary: "#000000",
			accent: "#10b981",
			background: "#0a0a0a",
			text: "#ebebeb",
			muted: "#888888",
		},
		typography: {
			headingFont: "'Space Grotesk', sans-serif",
			bodyFont: "'JetBrains Mono', monospace",
			accentFont: "'Space Grotesk', sans-serif",
		},
		animations: {
			scrollTriggerOffset: 100,
			defaultDuration: 0.6,
			easing: "cubic-bezier(0.4, 0, 0.2, 1)",
		},
	};

	const lightTokens: DesignTokens = {
		colors: {
			primary: "#8B4A55",
			secondary: "#3A2E2A",
			accent: "#C5A880",
			background: "#FDF8F5",
			text: "#2C2420",
			muted: "#8A7F7A",
		},
		typography: {
			headingFont: "'Playfair Display', serif",
			bodyFont: "'Inter', sans-serif",
			accentFont: "'Playfair Display', serif",
		},
		animations: {
			scrollTriggerOffset: 80,
			defaultDuration: 0.5,
			easing: "ease-out",
		},
	};

	test("applies dark theme token colors", () => {
		const html = renderTemplate(darkTokens);
		expect(html).toContain("#ccff00");
		expect(html).toContain("#10b981");
		expect(html).toContain("#ebebeb");
		expect(html).toContain("#888888");
	});

	test("applies light theme token colors", () => {
		const html = renderTemplate(lightTokens);
		expect(html).toContain("#8B4A55");
		expect(html).toContain("#C5A880");
		expect(html).toContain("#2C2420");
	});

	test("applies token fonts", () => {
		const html = renderTemplate(darkTokens);
		expect(html).toContain("Space Grotesk");
		expect(html).toContain("JetBrains Mono");
	});

	test("renders sd-template CSS class", () => {
		const html = renderTemplate();
		expect(html).toContain("sd-template");
	});

	test("renders sd-hero CSS class", () => {
		const html = renderTemplate();
		expect(html).toContain("sd-hero");
	});

	test("renders sd-form CSS class for RSVP", () => {
		const html = renderTemplate();
		expect(html).toContain("sd-form");
	});
});

/* ─── Dedicated component wrapper tests ─── */

describe("dedicated component wrappers", () => {
	test("each SuperDesign template has a dedicated component file", async () => {
		// Statically import a sample of wrapper components to verify they exist
		const mods = await Promise.all([
			import(
				"../components/templates/superdesign/GlassmorphismStyleInvitation"
			),
			import("../components/templates/superdesign/BauhausInvitation"),
			import("../components/templates/superdesign/TerminalInvitation"),
			import("../components/templates/superdesign/Win98Invitation"),
			import("../components/templates/superdesign/LuxuryInvitation"),
		]);
		for (const mod of mods) {
			expect(mod.default).toBeDefined();
			expect(typeof mod.default).toBe("function");
		}
	});

	test("wrapper components render correctly with tokens", async () => {
		const { default: BauhausInvitation } = await import(
			"../components/templates/superdesign/BauhausInvitation"
		);
		const bauhausConfig = superdesignTemplates.find(
			(t) => t.id === "sd-bauhaus",
		);
		const content = buildSampleContent("double-happiness");
		const html = renderToString(
			<BauhausInvitation content={content} tokens={bauhausConfig?.tokens} />,
		);
		expect(html).toContain('data-section="hero"');
		expect(html).toContain('data-section="rsvp"');
		expect(html).toContain("sd-template");
		// Verify the Bauhaus tokens are applied
		if (bauhausConfig) {
			expect(html).toContain(bauhausConfig.tokens.colors.primary);
		}
	});

	test("wrapper components support editor mode", async () => {
		const { default: TerminalInvitation } = await import(
			"../components/templates/superdesign/TerminalInvitation"
		);
		const content = buildSampleContent("double-happiness");
		const sectionSelected = vi.fn();
		const html = renderToString(
			<TerminalInvitation
				content={content}
				mode="editor"
				onSectionSelect={sectionSelected}
			/>,
		);
		// Editor mode should still render sections
		expect(html).toContain('data-section="hero"');
		// Should not render bottom action bar
		expect(html).not.toContain("bottom-action-bar");
	});
});

/* ─── InvitationRenderer integration tests ─── */

describe("InvitationRenderer template mapping", () => {
	test("all SuperDesign template IDs have import entries", async () => {
		// Read the InvitationRenderer source and verify all sd-* IDs are present
		const { readFileSync } = await import("node:fs");
		const { resolve } = await import("node:path");
		const rendererSource = readFileSync(
			resolve(__dirname, "../components/templates/InvitationRenderer.tsx"),
			"utf-8",
		);

		for (const t of superdesignTemplates) {
			expect(rendererSource, `Missing import for ${t.id}`).toContain(
				`"${t.id}"`,
			);
		}
	});

	test("all hand-crafted template IDs have import entries", async () => {
		const { readFileSync } = await import("node:fs");
		const { resolve } = await import("node:path");
		const rendererSource = readFileSync(
			resolve(__dirname, "../components/templates/InvitationRenderer.tsx"),
			"utf-8",
		);

		const handCrafted = [
			"double-happiness",
			"romantic-cinematic",
			"neo-brutalism",
			"classical-chinese",
		];
		for (const id of handCrafted) {
			expect(rendererSource).toContain(`"${id}"`);
		}
	});

	test("no fallback template pattern exists", async () => {
		const { readFileSync } = await import("node:fs");
		const { resolve } = await import("node:path");
		const rendererSource = readFileSync(
			resolve(__dirname, "../components/templates/InvitationRenderer.tsx"),
			"utf-8",
		);
		expect(rendererSource).not.toContain("FallbackTemplate");
		// No fallback for template component resolution
		expect(rendererSource).not.toMatch(/templateComponents\[.*\]\s*\?\?/);
	});
});

/* ─── Render coverage: every SuperDesign template renders ─── */

describe("render coverage for all SuperDesign templates", () => {
	test("every SuperDesign template renders with its tokens without crashing", () => {
		for (const t of superdesignTemplates) {
			const content = buildSampleContent("double-happiness");
			const html = renderToString(
				<SuperDesignInvitation content={content} tokens={t.tokens} />,
			);
			// Must render hero and rsvp sections
			expect(html, `${t.id} failed to render hero`).toContain(
				'data-section="hero"',
			);
			expect(html, `${t.id} failed to render rsvp`).toContain(
				'data-section="rsvp"',
			);
			// Must apply the template's primary color
			expect(html, `${t.id} missing primary color`).toContain(
				t.tokens.colors.primary,
			);
		}
	});
});

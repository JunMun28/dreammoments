import {
	type ComponentType,
	type CSSProperties,
	lazy,
	Suspense,
	useEffect,
	useMemo,
} from "react";
import { templates } from "../../templates";
import type { DesignTokens } from "../../templates/types";
import AudioPlayer from "./AudioPlayer";
import type { TemplateInvitationProps } from "./types";

const templateImports: Record<
	string,
	() => Promise<{ default: ComponentType<TemplateInvitationProps> }>
> = {
	/* ─── Hand-crafted templates ─── */
	"double-happiness": () =>
		import("./double-happiness/DoubleHappinessInvitation"),
	"romantic-cinematic": () =>
		import("./romantic-cinematic/RomanticCinematicInvitation"),
	"neo-brutalism": () => import("./neo-brutalism/NeoBrutalismInvitation"),
	"classical-chinese": () =>
		import("./classical-chinese/ClassicalChineseInvitation"),

	/* ─── SuperDesign templates (each has its own dedicated component) ─── */
	"sd-architectural-blueprint": () =>
		import("./superdesign/ArchitecturalBlueprintInvitation"),
	"sd-architectural-type-system-style": () =>
		import("./superdesign/ArchitecturalTypeSystemStyleInvitation"),
	"sd-babybites-sophisticated-palette": () =>
		import("./superdesign/BabybitesSophisticatedPaletteInvitation"),
	"sd-bauhaus": () => import("./superdesign/BauhausInvitation"),
	"sd-bold-editorial-design-style": () =>
		import("./superdesign/BoldEditorialDesignStyleInvitation"),
	"sd-bold-editorial-studio-style": () =>
		import("./superdesign/BoldEditorialStudioStyleInvitation"),
	"sd-bold-editorial-style": () =>
		import("./superdesign/BoldEditorialStyleInvitation"),
	"sd-bold-retro-modernism": () =>
		import("./superdesign/BoldRetroModernismInvitation"),
	"sd-brutalist-e-commerce-page": () =>
		import("./superdesign/BrutalistECommercePageInvitation"),
	"sd-brutalist-style-ecommerce-page": () =>
		import("./superdesign/BrutalistStyleEcommercePageInvitation"),
	"sd-chrome-extension-landing-page": () =>
		import("./superdesign/ChromeExtensionLandingPageInvitation"),
	"sd-cinematic-noir-style": () =>
		import("./superdesign/CinematicNoirStyleInvitation"),
	"sd-cinematic-style": () => import("./superdesign/CinematicStyleInvitation"),
	"sd-clay-ui": () => import("./superdesign/ClayUiInvitation"),
	"sd-clean-fluid": () => import("./superdesign/CleanFluidInvitation"),
	"sd-cyber-serif-style": () =>
		import("./superdesign/CyberSerifStyleInvitation"),
	"sd-dark-avant-garde-style": () =>
		import("./superdesign/DarkAvantGardeStyleInvitation"),
	"sd-disruptor-beta-launch": () =>
		import("./superdesign/DisruptorBetaLaunchInvitation"),
	"sd-flat-design": () => import("./superdesign/FlatDesignInvitation"),
	"sd-futuristic-sass-landing-page": () =>
		import("./superdesign/FuturisticSassLandingPageInvitation"),
	"sd-glassmorphism-card": () =>
		import("./superdesign/GlassmorphismCardInvitation"),
	"sd-glassmorphism-style": () =>
		import("./superdesign/GlassmorphismStyleInvitation"),
	"sd-grunge-collage-motion": () =>
		import("./superdesign/GrungeCollageMotionInvitation"),
	"sd-high-contrast-landing-page": () =>
		import("./superdesign/HighContrastLandingPageInvitation"),
	"sd-hyper-saturated-fluid": () =>
		import("./superdesign/HyperSaturatedFluidInvitation"),
	"sd-kinetic": () => import("./superdesign/KineticInvitation"),
	"sd-kinetic-orange-style": () =>
		import("./superdesign/KineticOrangeStyleInvitation"),
	"sd-liquid-metal-style": () =>
		import("./superdesign/LiquidMetalStyleInvitation"),
	"sd-lumina-saas-landing-page": () =>
		import("./superdesign/LuminaSaasLandingPageInvitation"),
	"sd-luxury": () => import("./superdesign/LuxuryInvitation"),
	"sd-luxury-focused-design-system": () =>
		import("./superdesign/LuxuryFocusedDesignSystemInvitation"),
	"sd-material": () => import("./superdesign/MaterialInvitation"),
	"sd-midnight-editorial-style": () =>
		import("./superdesign/MidnightEditorialStyleInvitation"),
	"sd-minimalist-beta-capture": () =>
		import("./superdesign/MinimalistBetaCaptureInvitation"),
	"sd-modern-bold": () => import("./superdesign/ModernBoldInvitation"),
	"sd-monochrome": () => import("./superdesign/MonochromeInvitation"),
	"sd-mosaic-grid-architecture-style": () =>
		import("./superdesign/MosaicGridArchitectureStyleInvitation"),
	"sd-nature-inspired-style": () =>
		import("./superdesign/NatureInspiredStyleInvitation"),
	"sd-neo-brutalism-style": () =>
		import("./superdesign/NeoBrutalismStyleInvitation"),
	"sd-neon-velocity-countdown": () =>
		import("./superdesign/NeonVelocityCountdownInvitation"),
	"sd-neumorphism": () => import("./superdesign/NeumorphismInvitation"),
	"sd-neural-noir-interface-style": () =>
		import("./superdesign/NeuralNoirInterfaceStyleInvitation"),
	"sd-news-print": () => import("./superdesign/NewsPrintInvitation"),
	"sd-organic-modern-style": () =>
		import("./superdesign/OrganicModernStyleInvitation"),
	"sd-playful": () => import("./superdesign/PlayfulInvitation"),
	"sd-red-noir-style": () => import("./superdesign/RedNoirStyleInvitation"),
	"sd-red-sun": () => import("./superdesign/RedSunInvitation"),
	"sd-saas-landing-page-for-developer-tool": () =>
		import("./superdesign/SaasLandingPageForDeveloperToolInvitation"),
	"sd-sketch": () => import("./superdesign/SketchInvitation"),
	"sd-softly-digital-wellness-app": () =>
		import("./superdesign/SoftlyDigitalWellnessAppInvitation"),
	"sd-superdesign-editorial-waitlist": () =>
		import("./superdesign/SuperdesignEditorialWaitlistInvitation"),
	"sd-swiss-style": () => import("./superdesign/SwissStyleInvitation"),
	"sd-synapse": () => import("./superdesign/SynapseInvitation"),
	"sd-tech-editorial": () => import("./superdesign/TechEditorialInvitation"),
	"sd-tectonic-style": () => import("./superdesign/TectonicStyleInvitation"),
	"sd-terminal": () => import("./superdesign/TerminalInvitation"),
	"sd-warm-industrial-gray-style": () =>
		import("./superdesign/WarmIndustrialGrayStyleInvitation"),
	"sd-win98": () => import("./superdesign/Win98Invitation"),
};

const templateComponents: Record<
	string,
	ComponentType<TemplateInvitationProps>
> = Object.fromEntries(
	Object.entries(templateImports).map(([id, loader]) => [id, lazy(loader)]),
);

export function preloadTemplate(templateId: string): void {
	templateImports[templateId]?.();
}

/** Build CSS custom properties from design tokens so templates can read them. */
function tokensToCssVars(tokens: DesignTokens): CSSProperties {
	return {
		"--t-primary": tokens.colors.primary,
		"--t-secondary": tokens.colors.secondary,
		"--t-accent": tokens.colors.accent,
		"--t-bg": tokens.colors.background,
		"--t-text": tokens.colors.text,
		"--t-muted": tokens.colors.muted,
		"--t-heading-font": tokens.typography.headingFont,
		"--t-body-font": tokens.typography.bodyFont,
		"--t-accent-font": tokens.typography.accentFont,
	} as CSSProperties;
}

function TemplateSkeleton() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)]">
			<div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--dm-peach)] border-t-transparent" />
		</div>
	);
}

export default function InvitationRenderer({
	templateId,
	...props
}: TemplateInvitationProps & { templateId: string }) {
	const Template = templateComponents[templateId];
	const musicUrl = props.content?.musicUrl;

	// Look up the template config to get design tokens
	const templateConfig = useMemo(
		() => templates.find((t) => t.id === templateId),
		[templateId],
	);
	const tokens = props.tokens ?? templateConfig?.tokens;

	useEffect(() => {
		preloadTemplate(templateId);
	}, [templateId]);

	const cssVars = tokens ? tokensToCssVars(tokens) : undefined;

	if (!Template) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-sm text-gray-500">
					Template &ldquo;{templateId}&rdquo; not found
				</p>
			</div>
		);
	}

	return (
		<Suspense fallback={<TemplateSkeleton />}>
			<div style={cssVars}>
				<Template {...props} tokens={tokens} />
			</div>
			{musicUrl && !props.hiddenSections?.music ? (
				<AudioPlayer src={musicUrl} />
			) : null}
		</Suspense>
	);
}

"use client";

import "./landing.css";
import { ClosingCta } from "./closing-cta";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { Showcase } from "./showcase";
import { SkipToContent } from "./skip-to-content";
import { SmoothScroll } from "./smooth-scroll";
import { SocialProof } from "./social-proof";
import { LandingThemeProvider, useLandingTheme } from "./theme-context";
import { ThemeSwitch } from "./theme-switch";

function LandingContent() {
	const { resolvedTheme } = useLandingTheme();

	return (
		<SmoothScroll>
			<div className={`landing ${resolvedTheme === "dark" ? "dark" : ""}`}>
				<SkipToContent />
				<Header />
				<ThemeSwitch />
				{/* biome-ignore lint/correctness/useUniqueElementIds: skip-to-content target */}
				<main id="main-content" className="relative z-10 flex-1">
					<Hero />
					<Showcase />
					<SocialProof />
					<Faq />
					<ClosingCta />
				</main>
				<Footer />
			</div>
		</SmoothScroll>
	);
}

export function LandingPage() {
	return (
		<LandingThemeProvider>
			<LandingContent />
		</LandingThemeProvider>
	);
}

"use client";

import { About } from "./about";
import "./agency-landing.css";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { OverlayProvider } from "./overlay-context";
import { Projects } from "./projects";
import { Services } from "./services";
import { SmoothScroll } from "./smooth-scroll";
import { SocialProof } from "./social-proof";
import { LandingThemeProvider, useLandingTheme } from "./theme-context";
import { ThemeSwitch } from "./theme-switch";

function AgencyLandingContent() {
	const { resolvedTheme } = useLandingTheme();

	return (
		<OverlayProvider>
			<SmoothScroll>
				<div
					className={`agency-landing ${resolvedTheme === "dark" ? "dark" : ""}`}
				>
					<Header />
					<ThemeSwitch />
					<main className="relative z-10 flex-1 bg-background">
						<Hero />
						<Projects />
						<Services />
						<About />
						<SocialProof />
						<Faq />
					</main>
					<Footer />
				</div>
			</SmoothScroll>
		</OverlayProvider>
	);
}

export function AgencyLandingPage() {
	return (
		<LandingThemeProvider>
			<AgencyLandingContent />
		</LandingThemeProvider>
	);
}

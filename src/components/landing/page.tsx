"use client";

import { About } from "./about";
import "./landing.css";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { OverlayProvider } from "./overlay-context";
import { Projects } from "./projects";
import { Services } from "./services";
import { SmoothScroll } from "./smooth-scroll";
import { LandingThemeProvider, useLandingTheme } from "./theme-context";
import { ThemeSwitch } from "./theme-switch";

function LandingContent() {
	const { resolvedTheme } = useLandingTheme();

	return (
		<OverlayProvider>
			<SmoothScroll>
				<div className={`landing ${resolvedTheme === "dark" ? "dark" : ""}`}>
					<Header />
					<ThemeSwitch />
					<main className="relative z-10 flex-1 bg-background">
						<Hero />
						<Projects />
						<Services />
						<About />
						<Faq />
					</main>
					<Footer />
				</div>
			</SmoothScroll>
		</OverlayProvider>
	);
}

export function LandingPage() {
	return (
		<LandingThemeProvider>
			<LandingContent />
		</LandingThemeProvider>
	);
}

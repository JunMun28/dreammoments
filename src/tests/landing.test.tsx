import { describe, expect, test } from "vitest";
import { About } from "../components/agency-landing/about";
import { Faq } from "../components/agency-landing/faq";
import { Footer } from "../components/agency-landing/footer";
import { Header } from "../components/agency-landing/header";
import { Hero } from "../components/agency-landing/hero";
import { AgencyLandingPage } from "../components/agency-landing/page";
import { Projects } from "../components/agency-landing/projects";
import { Services } from "../components/agency-landing/services";
import { SocialProof } from "../components/agency-landing/social-proof";
import { ThemeSwitch } from "../components/agency-landing/theme-switch";
import { Route } from "../routes/index";

describe("landing route wiring", () => {
	test("home route points to landing page component", () => {
		expect(Route).toBeDefined();
		expect(Route.options.component).toBe(AgencyLandingPage);
	});

	test("landing page and section components export functions", () => {
		expect(typeof AgencyLandingPage).toBe("function");
		expect(typeof Header).toBe("function");
		expect(typeof Hero).toBe("function");
		expect(typeof Projects).toBe("function");
		expect(typeof Services).toBe("function");
		expect(typeof About).toBe("function");
		expect(typeof SocialProof).toBe("function");
		expect(typeof Faq).toBe("function");
		expect(typeof Footer).toBe("function");
		expect(typeof ThemeSwitch).toBe("function");
	});
});

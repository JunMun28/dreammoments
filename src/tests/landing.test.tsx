import { describe, expect, test } from "vitest";
import { About } from "../components/landing/about";
import { Faq } from "../components/landing/faq";
import { Footer } from "../components/landing/footer";
import { Header } from "../components/landing/header";
import { Hero } from "../components/landing/hero";
import { LandingPage } from "../components/landing/page";
import { Projects } from "../components/landing/projects";
import { Services } from "../components/landing/services";
import { ThemeSwitch } from "../components/landing/theme-switch";
import { Route } from "../routes/index";

describe("landing route wiring", () => {
	test("home route points to landing page component", () => {
		expect(Route).toBeDefined();
		expect(Route.options.component).toBe(LandingPage);
	});

	test("landing page and section components export functions", () => {
		expect(typeof LandingPage).toBe("function");
		expect(typeof Header).toBe("function");
		expect(typeof Hero).toBe("function");
		expect(typeof Projects).toBe("function");
		expect(typeof Services).toBe("function");
		expect(typeof About).toBe("function");
		expect(typeof Faq).toBe("function");
		expect(typeof Footer).toBe("function");
		expect(typeof ThemeSwitch).toBe("function");
	});
});

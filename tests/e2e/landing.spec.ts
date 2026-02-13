import { expect, test } from "@playwright/test";
import {
	buildSeedStore,
	seedLocalStorage,
	stubBrowserApis,
	testUsers,
} from "./utils";

test.setTimeout(120000);

const setup = async (page: any, currentUserId?: string) => {
	await seedLocalStorage(page, buildSeedStore({ currentUserId }));
	await stubBrowserApis(page);
};

const forceDomClick = async (locator: any) => {
	await locator.evaluate((node: Element) => {
		if (node instanceof HTMLElement) {
			node.click();
		}
	});
};

const openHeaderMenu = async (page: any) => {
	const header = page.locator("header").first();
	const toggle = header.getByRole("button", { name: "Toggle menu" });
	await expect(toggle).toBeVisible({ timeout: 20000 });

	for (let attempt = 0; attempt < 4; attempt++) {
		const isExpanded = await toggle.getAttribute("aria-expanded");
		if (isExpanded === "true") {
			return header;
		}
		await toggle.focus();
		await page.keyboard.press("Enter");
		await page.waitForTimeout(120);
	}

	await expect(toggle).toHaveAttribute("aria-expanded", "true");
	return header;
};

test("landing hero + footer", async ({ page }) => {
	await setup(page);
	await page.goto("/");

	await expect(
		page.getByRole("heading", { name: /Wedding pages/i }),
	).toBeVisible();
	await expect(page.locator("footer")).toBeVisible();
});

test("floating theme toggle updates landing wrapper class", async ({ page }) => {
	await setup(page);
	await page.goto("/");

	const landingWrapper = page.locator(".agency-landing");
	await expect(landingWrapper).toHaveClass(/dark/);

	await forceDomClick(
		page.getByRole("button", { name: "Switch to light theme" }),
	);
	await expect(landingWrapper).not.toHaveClass(/dark/);

	await forceDomClick(page.getByRole("button", { name: "Switch to dark theme" }));
	await expect(landingWrapper).toHaveClass(/dark/);
});

test("header anchors navigate to expected sections", async ({ page }) => {
	await setup(page);
	await page.goto("/");

	await forceDomClick(
		(await openHeaderMenu(page)).getByRole("link", {
			name: "Templates",
			exact: true,
		}),
	);
	await expect(page).toHaveURL(/#projects/);
	await expect(page.locator("#projects")).toBeVisible();

	await forceDomClick(
		(await openHeaderMenu(page)).getByRole("link", {
			name: "Features",
			exact: true,
		}),
	);
	await expect(page).toHaveURL(/#services-menu/);
	await expect(page.locator("#services-menu")).toBeVisible();

	await forceDomClick(
		(await openHeaderMenu(page)).getByRole("link", {
			name: "About us",
			exact: true,
		}),
	);
	await expect(page).toHaveURL(/#about/);
	await expect(page.locator("#about")).toBeVisible();

	await forceDomClick(
		(await openHeaderMenu(page)).getByRole("link", {
			name: "Testimonials",
			exact: true,
		}),
	);
	await expect(page).toHaveURL(/#social-proof/);
	await expect(page.locator("#social-proof")).toBeVisible();

	await forceDomClick(
		(await openHeaderMenu(page)).getByRole("link", { name: "FAQ", exact: true }),
	);
	await expect(page).toHaveURL(/#faq/);
	await expect(page.locator("#faq")).toBeVisible();
});

test("project overlay opens and closes with escape", async ({ page }) => {
	await setup(page);
	await page.goto("/");

	await forceDomClick(
		(await openHeaderMenu(page)).getByRole("link", {
			name: "Templates",
			exact: true,
		}),
	);

	await page.getByRole("heading", { name: /Tea Ceremony/i }).first().click();
	await expect(page.getByRole("button", { name: "Close overlay" })).toBeVisible();

	await page.keyboard.press("Escape");
	await expect(
		page.getByRole("button", { name: "Close overlay" }),
	).toBeHidden();
});

test("primary CTA routes to editor new flow", async ({ page }) => {
	await setup(page, testUsers.free.id);
	await page.goto("/");

	await forceDomClick(
		(await openHeaderMenu(page)).getByRole("link", {
			name: "Start creating",
			exact: true,
		}),
	);
	await expect(page).toHaveURL(/\/editor\/new/);
});

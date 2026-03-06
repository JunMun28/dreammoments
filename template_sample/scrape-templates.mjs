import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const TEMPLATE_IDS = [
	"31846611", "19929973", "19796517", "22445798", "27655110",
	"10988906", "16313751", "18554854", "21780695", "20206687",
	"19443875", "15895586", "6964828", "19700058", "19795351",
	"23149694", "20377012", "29343256", "28867429", "28539729",
	"36336384", "17760092", "27673875", "34446057", "36355693",
	"28072410", "32336716", "14158925", "32913764", "34389989",
	"28237112",
];

const OUTPUT_DIR = join(import.meta.dirname, "template_sample");
mkdirSync(OUTPUT_DIR, { recursive: true });

async function scrapeTemplate(browser, id, index) {
	const page = await browser.newPage();
	try {
		console.log(`[${index + 1}/${TEMPLATE_IDS.length}] Scraping template ${id}...`);

		await page.goto(`https://h5.hunbei.com/app/${id}`, {
			waitUntil: "domcontentloaded",
			timeout: 30000,
		});

		// Wait for the iframe inside the view page to load
		const iframe = page.frameLocator("iframe").first();
		try {
			await iframe.locator("body").waitFor({ state: "attached", timeout: 15000 });
		} catch {
			console.log(`  Warning: iframe body not found for ${id}, trying direct content`);
		}

		// Wait a bit for dynamic content to render
		await page.waitForTimeout(3000);

		// Get the page title (contains template name)
		const title = await page.title();
		const templateName = title.replace(/[❤️]/g, "").replace(/婚礼长页$/, "").trim();

		// Extract iframe HTML content
		const html = await page.evaluate(() => {
			const iframe = document.querySelector("iframe");
			if (iframe && iframe.contentDocument) {
				return iframe.contentDocument.documentElement.outerHTML;
			}
			return null;
		});

		if (html) {
			const filename = `${String(index + 1).padStart(2, "0")}-${templateName || id}.html`;
			const filePath = join(OUTPUT_DIR, filename);
			writeFileSync(filePath, `<!DOCTYPE html>\n${html}`, "utf-8");
			console.log(`  Saved: ${filename} (${html.length} chars)`);
			return { id, name: templateName, filename, chars: html.length };
		} else {
			console.log(`  Failed: could not extract iframe content for ${id}`);
			return { id, name: templateName, error: "no iframe content" };
		}
	} catch (err) {
		console.log(`  Error scraping ${id}: ${err.message}`);
		return { id, error: err.message };
	} finally {
		await page.close();
	}
}

async function main() {
	console.log(`Scraping ${TEMPLATE_IDS.length} templates from hunbei.com...\n`);

	const browser = await chromium.launch({ headless: true });

	const results = [];
	for (let i = 0; i < TEMPLATE_IDS.length; i++) {
		const result = await scrapeTemplate(browser, TEMPLATE_IDS[i], i);
		results.push(result);
	}

	await browser.close();

	// Summary
	const success = results.filter((r) => !r.error);
	const failed = results.filter((r) => r.error);
	console.log(`\nDone! ${success.length} saved, ${failed.length} failed.`);
	if (failed.length > 0) {
		console.log("Failed:", failed.map((f) => f.id).join(", "));
	}

	// Save manifest
	writeFileSync(
		join(OUTPUT_DIR, "manifest.json"),
		JSON.stringify(results, null, "\t"),
		"utf-8",
	);
	console.log("Manifest saved to template_sample/manifest.json");
}

main().catch(console.error);

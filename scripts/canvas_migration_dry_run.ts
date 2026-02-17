import fs from "node:fs";
import path from "node:path";
import { buildSampleContent } from "../src/data/sample-invitation";
import { runCanvasMigrationDryRun } from "../src/lib/canvas/migrate";
import { templates } from "../src/templates";

type InputItem = {
	id?: string;
	templateId: string;
	content: unknown;
};

function readInputFile(filePath: string): InputItem[] {
	const absolutePath = path.resolve(filePath);
	const raw = fs.readFileSync(absolutePath, "utf8");
	const parsed = JSON.parse(raw);
	if (!Array.isArray(parsed)) {
		throw new Error("Input JSON must be an array");
	}
	return parsed as InputItem[];
}

function buildSampleItems() {
	return templates.map((template, index) => ({
		invitationId: `sample-${index + 1}`,
		templateId: template.id,
		content: buildSampleContent(template.id),
	}));
}

function main() {
	const filePath = process.argv[2];
	const items = filePath
		? readInputFile(filePath).map((item, index) => ({
				invitationId: item.id || `file-${index + 1}`,
				templateId: item.templateId,
				content: item.content,
			}))
		: buildSampleItems();

	const report = runCanvasMigrationDryRun(items);
	const failures = report.filter((item) => !item.ok);

	console.log(JSON.stringify({ total: report.length, failures, report }, null, 2));

	if (failures.length > 0) {
		process.exitCode = 1;
	}
}

main();

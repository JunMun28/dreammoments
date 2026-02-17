import { buildSampleContent } from "@/data/sample-invitation";
import type { InvitationContent } from "@/lib/types";
import { isCanvasDocument } from "./document";
import { parseCanvasDocument } from "./schema";
import { convertTemplateToCanvasDocument } from "./template-converter";
import type { CanvasDocument } from "./types";

export interface MigrationResult {
	ok: boolean;
	document?: CanvasDocument;
	error?: string;
}

export interface MigrationDryRunItem {
	invitationId: string;
	templateId: string;
	ok: boolean;
	blockCount: number;
	error?: string;
}

export function migrateInvitationContentToCanvas(
	content: unknown,
	templateId: string,
): CanvasDocument {
	if (isCanvasDocument(content)) {
		const parsed = parseCanvasDocument(content);
		if (parsed.ok) return parsed.data;
	}

	const legacy = content as InvitationContent;
	return convertTemplateToCanvasDocument(
		templateId,
		legacy?.hero ? legacy : buildSampleContent(templateId),
	);
}

export function tryMigrateInvitationContentToCanvas(
	content: unknown,
	templateId: string,
): MigrationResult {
	try {
		return {
			ok: true,
			document: migrateInvitationContentToCanvas(content, templateId),
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Canvas migration failed",
		};
	}
}

export function runCanvasMigrationDryRun(
	items: Array<{
		invitationId: string;
		templateId: string;
		content: unknown;
	}>,
): MigrationDryRunItem[] {
	return items.map((item) => {
		const result = tryMigrateInvitationContentToCanvas(
			item.content,
			item.templateId,
		);
		return {
			invitationId: item.invitationId,
			templateId: item.templateId,
			ok: result.ok,
			blockCount: result.document?.blockOrder.length ?? 0,
			error: result.error,
		};
	});
}

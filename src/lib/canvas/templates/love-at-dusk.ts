import type { InvitationContent } from "@/lib/types";
import { convertToCanvasDocument } from "../template-converter";

export function buildLoveAtDuskCanvasDocument(content: InvitationContent) {
	return convertToCanvasDocument("love-at-dusk", content);
}

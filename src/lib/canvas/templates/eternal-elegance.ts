import type { InvitationContent } from "@/lib/types";
import { convertToCanvasDocument } from "../template-converter";

export function buildEternalEleganceCanvasDocument(content: InvitationContent) {
	return convertToCanvasDocument("eternal-elegance", content);
}

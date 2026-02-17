import type { InvitationContent } from "@/lib/types";
import { convertToCanvasDocument } from "../template-converter";

export function buildGardenRomanceCanvasDocument(content: InvitationContent) {
	return convertToCanvasDocument("garden-romance", content);
}

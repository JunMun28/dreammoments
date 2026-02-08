import { useCallback, useState } from "react";
import { generateAiContent } from "../../../lib/ai";
import {
	incrementAiUsage,
	markAiGenerationAccepted,
	recordAiGeneration,
	updateInvitation,
} from "../../../lib/data";
import type { InvitationContent } from "../../../lib/types";

export type AiTaskType =
	| "schedule"
	| "faq"
	| "story"
	| "tagline"
	| "style"
	| "translate";

export type AiPanelState = {
	open: boolean;
	sectionId: string;
	prompt: string;
	type: AiTaskType;
	result?: Record<string, unknown>;
	generationId?: string;
	error?: string;
};

export type UseAiAssistantParams = {
	invitationId: string;
	aiGenerationsUsed: number;
	planLimit: number;
	draft: InvitationContent;
	onApplyResult: (next: InvitationContent) => void;
	onApplyStyleOverrides?: (overrides: Record<string, string>) => void;
};

export type UseAiAssistantReturn = {
	aiPanel: AiPanelState;
	aiGenerating: boolean;
	remainingAi: number;
	openAiPanel: (sectionId: string, type?: AiTaskType) => void;
	closeAiPanel: () => void;
	setAiPrompt: (prompt: string) => void;
	setAiType: (type: AiTaskType) => void;
	generate: () => Promise<void>;
	applyResult: () => void;
};

const defaultAiPanel: AiPanelState = {
	open: false,
	sectionId: "schedule",
	prompt: "",
	type: "schedule",
};

function inferDefaultType(sectionId: string): AiTaskType {
	if (sectionId === "schedule") return "schedule";
	if (sectionId === "faq") return "faq";
	if (sectionId === "story") return "story";
	if (sectionId === "hero") return "tagline";
	return "style";
}

export function useAiAssistant({
	invitationId,
	aiGenerationsUsed,
	planLimit,
	draft,
	onApplyResult,
	onApplyStyleOverrides,
}: UseAiAssistantParams): UseAiAssistantReturn {
	const [aiPanel, setAiPanel] = useState<AiPanelState>(defaultAiPanel);
	const [aiGenerating, setAiGenerating] = useState(false);

	const remainingAi = Math.max(0, planLimit - aiGenerationsUsed);

	const openAiPanel = useCallback((sectionId: string, type?: AiTaskType) => {
		setAiPanel({
			open: true,
			sectionId,
			prompt: "",
			type: type ?? inferDefaultType(sectionId),
		});
	}, []);

	const closeAiPanel = useCallback(() => {
		setAiPanel((prev) => ({ ...prev, open: false }));
	}, []);

	const setAiPrompt = useCallback((prompt: string) => {
		setAiPanel((prev) => ({ ...prev, prompt }));
	}, []);

	const setAiType = useCallback((type: AiTaskType) => {
		setAiPanel((prev) => ({ ...prev, type }));
	}, []);

	const generate = useCallback(async () => {
		if (remainingAi <= 0) {
			setAiPanel((prev) => ({
				...prev,
				error: "AI limit reached. Upgrade for more.",
			}));
			return;
		}
		setAiPanel((prev) => ({ ...prev, error: undefined }));
		setAiGenerating(true);
		try {
			const result = (await generateAiContent({
				type: aiPanel.type,
				sectionId: aiPanel.sectionId,
				prompt: aiPanel.prompt,
				context: draft,
			})) as Record<string, unknown>;
			const generation = recordAiGeneration(
				invitationId,
				aiPanel.sectionId,
				aiPanel.prompt,
				result,
			);
			incrementAiUsage(invitationId);
			setAiPanel((prev) => ({
				...prev,
				result,
				generationId: generation.id,
			}));
		} catch {
			setAiPanel((prev) => ({
				...prev,
				error: "Generation failed. Please try again.",
			}));
		} finally {
			setAiGenerating(false);
		}
	}, [
		remainingAi,
		aiPanel.type,
		aiPanel.sectionId,
		aiPanel.prompt,
		draft,
		invitationId,
	]);

	const applyResult = useCallback(() => {
		if (!aiPanel.result) return;

		if (aiPanel.type === "style") {
			const overrides = (aiPanel.result?.cssVars ?? aiPanel.result) as Record<
				string,
				string
			>;
			if (onApplyStyleOverrides) {
				onApplyStyleOverrides(overrides);
			} else {
				updateInvitation(invitationId, { designOverrides: overrides });
			}
		} else {
			const next = structuredClone(draft);
			if (aiPanel.type === "translate") {
				next.announcement.formalText = String(aiPanel.result.translation ?? "");
			} else if (aiPanel.sectionId === "schedule") {
				next.schedule.events = (aiPanel.result.events ??
					[]) as InvitationContent["schedule"]["events"];
			} else if (aiPanel.sectionId === "faq") {
				next.faq.items = (aiPanel.result.items ??
					[]) as InvitationContent["faq"]["items"];
			} else if (aiPanel.sectionId === "story") {
				next.story.milestones = (aiPanel.result.milestones ??
					[]) as InvitationContent["story"]["milestones"];
			} else if (aiPanel.sectionId === "hero") {
				next.hero.tagline = String(aiPanel.result.tagline ?? "");
			}
			onApplyResult(next);
		}

		if (aiPanel.generationId) {
			markAiGenerationAccepted(aiPanel.generationId);
		}
		setAiPanel((prev) => ({ ...prev, result: undefined }));
	}, [
		aiPanel.result,
		aiPanel.type,
		aiPanel.sectionId,
		aiPanel.generationId,
		draft,
		invitationId,
		onApplyResult,
		onApplyStyleOverrides,
	]);

	return {
		aiPanel,
		aiGenerating,
		remainingAi,
		openAiPanel,
		closeAiPanel,
		setAiPrompt,
		setAiType,
		generate,
		applyResult,
	};
}

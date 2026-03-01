import { useCallback, useRef, useState } from "react";
import { applyAiResultFn } from "../../../api/ai";
import { updateInvitationFn } from "../../../api/invitations";
import { generateAiContent } from "../../../lib/ai";
import type { InvitationContent } from "../../../lib/types";

const TOKEN_KEY = "dm-auth-token";

function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}

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
	onGenerateSuccess?: () => void;
	onGenerateError?: (message: string) => void;
};

export type UseAiAssistantReturn = {
	aiPanel: AiPanelState;
	aiGenerating: boolean;
	remainingAi: number;
	aiGenerationsUsed: number;
	planLimit: number;
	openAiPanel: (sectionId: string, type?: AiTaskType) => void;
	closeAiPanel: () => void;
	setAiPrompt: (prompt: string) => void;
	setAiType: (type: AiTaskType) => void;
	generate: () => Promise<void>;
	applyResult: () => void;
	cancelGeneration: () => void;
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
	onGenerateSuccess,
	onGenerateError,
}: UseAiAssistantParams): UseAiAssistantReturn {
	const [aiPanel, setAiPanel] = useState<AiPanelState>(defaultAiPanel);
	const [aiGenerating, setAiGenerating] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

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

	const cancelGeneration = useCallback(() => {
		if (abortRef.current) {
			abortRef.current.abort();
			abortRef.current = null;
		}
		setAiGenerating(false);
	}, []);

	const generate = useCallback(async () => {
		if (remainingAi <= 0) {
			setAiPanel((prev) => ({
				...prev,
				error: "AI limit reached. Upgrade for more.",
			}));
			return;
		}
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setAiPanel((prev) => ({ ...prev, error: undefined }));
		setAiGenerating(true);
		try {
			const token = getToken();
			const result = (await generateAiContent({
				type: aiPanel.type,
				sectionId: aiPanel.sectionId,
				prompt: aiPanel.prompt,
				context: draft,
				token: token ?? undefined,
			})) as Record<string, unknown>;
			if (controller.signal.aborted) return;
			setAiPanel((prev) => ({
				...prev,
				result,
			}));
			onGenerateSuccess?.();
		} catch {
			if (controller.signal.aborted) return;
			const errorMessage = "Generation failed. Please try again.";
			setAiPanel((prev) => ({
				...prev,
				error: errorMessage,
			}));
			onGenerateError?.(errorMessage);
		} finally {
			if (!controller.signal.aborted) {
				setAiGenerating(false);
			}
			if (abortRef.current === controller) {
				abortRef.current = null;
			}
		}
	}, [
		remainingAi,
		aiPanel.type,
		aiPanel.sectionId,
		aiPanel.prompt,
		draft,
		onGenerateSuccess,
		onGenerateError,
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
				const token = getToken();
				if (token) {
					void updateInvitationFn({
						data: {
							invitationId,
							token,
							designOverrides: overrides as Record<string, unknown>,
						},
					});
				}
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

		if (aiPanel.result) {
			const token = getToken();
			if (token) {
				void applyAiResultFn({
					data: {
						token,
						invitationId,
						type: aiPanel.type,
						sectionId: aiPanel.sectionId,
						aiResult: aiPanel.result,
						generationId: aiPanel.generationId,
					},
				});
			}
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
		aiGenerationsUsed,
		planLimit,
		openAiPanel,
		closeAiPanel,
		setAiPrompt,
		setAiType,
		generate,
		applyResult,
		cancelGeneration,
	};
}

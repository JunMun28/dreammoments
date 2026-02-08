import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dm-onboarding-complete";

type TourStep = {
	id: string;
	target: string | null; // data-onboarding attribute value, null for general overlay
	title: string;
	description: string;
	mobileVisible: boolean;
};

const STEPS: TourStep[] = [
	{
		id: "welcome",
		target: null,
		title: "Welcome to the Editor!",
		description:
			"This is where you bring your wedding invitation to life. Let us show you around.",
		mobileVisible: true,
	},
	{
		id: "context-panel",
		target: "context-panel",
		title: "Edit your invitation",
		description:
			"Use this panel to fill in your details - names, dates, venue, and more. Each section has its own fields.",
		mobileVisible: false,
	},
	{
		id: "preview",
		target: "preview",
		title: "Live preview",
		description:
			"See your changes in real time. The preview updates instantly as you type.",
		mobileVisible: true,
	},
	{
		id: "ai-button",
		target: "ai-button",
		title: "AI Assistant",
		description:
			"Let AI help you write your love story, generate a schedule, or translate content.",
		mobileVisible: true,
	},
	{
		id: "toolbar",
		target: "toolbar",
		title: "Ready to share!",
		description:
			"When you are done editing, hit Publish to get a shareable link for your guests.",
		mobileVisible: true,
	},
];

type TooltipPosition = {
	top: number;
	left: number;
	placement: "top" | "bottom" | "left" | "right";
};

function getTooltipPosition(
	rect: DOMRect | null,
	isMobile: boolean,
): TooltipPosition {
	if (!rect) {
		return {
			top: window.innerHeight / 2,
			left: window.innerWidth / 2,
			placement: "bottom",
		};
	}

	const tooltipWidth = 320;
	const tooltipHeight = 180;
	const gap = 16;

	if (isMobile) {
		// On mobile, place above or below depending on available space
		const spaceBelow = window.innerHeight - rect.bottom;
		if (spaceBelow > tooltipHeight + gap) {
			return {
				top: rect.bottom + gap,
				left: Math.max(
					16,
					Math.min(
						rect.left + rect.width / 2 - tooltipWidth / 2,
						window.innerWidth - tooltipWidth - 16,
					),
				),
				placement: "bottom",
			};
		}
		return {
			top: rect.top - gap - tooltipHeight,
			left: Math.max(
				16,
				Math.min(
					rect.left + rect.width / 2 - tooltipWidth / 2,
					window.innerWidth - tooltipWidth - 16,
				),
			),
			placement: "top",
		};
	}

	// Desktop: try right, then left, then below, then above
	const spaceRight = window.innerWidth - rect.right;
	if (spaceRight > tooltipWidth + gap) {
		return {
			top: Math.max(
				16,
				Math.min(
					rect.top + rect.height / 2 - tooltipHeight / 2,
					window.innerHeight - tooltipHeight - 16,
				),
			),
			left: rect.right + gap,
			placement: "right",
		};
	}

	if (rect.left > tooltipWidth + gap) {
		return {
			top: Math.max(
				16,
				Math.min(
					rect.top + rect.height / 2 - tooltipHeight / 2,
					window.innerHeight - tooltipHeight - 16,
				),
			),
			left: rect.left - gap - tooltipWidth,
			placement: "left",
		};
	}

	const spaceBelow = window.innerHeight - rect.bottom;
	if (spaceBelow > tooltipHeight + gap) {
		return {
			top: rect.bottom + gap,
			left: Math.max(
				16,
				Math.min(
					rect.left + rect.width / 2 - tooltipWidth / 2,
					window.innerWidth - tooltipWidth - 16,
				),
			),
			placement: "bottom",
		};
	}

	return {
		top: rect.top - gap - tooltipHeight,
		left: Math.max(
			16,
			Math.min(
				rect.left + rect.width / 2 - tooltipWidth / 2,
				window.innerWidth - tooltipWidth - 16,
			),
		),
		placement: "top",
	};
}

export function OnboardingTour() {
	const [step, setStep] = useState(0);
	const [visible, setVisible] = useState(false);
	const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// Filter steps based on viewport
	const activeSteps = isMobile ? STEPS.filter((s) => s.mobileVisible) : STEPS;

	const currentStep = activeSteps[step];

	// Check localStorage on mount
	useEffect(() => {
		if (typeof window === "undefined") return;
		const completed = localStorage.getItem(STORAGE_KEY);
		if (completed) return;

		// Delay slightly to let the editor render first
		const timer = setTimeout(() => setVisible(true), 800);
		return () => clearTimeout(timer);
	}, []);

	// Track viewport size
	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	// Find and measure the target element for current step
	useEffect(() => {
		if (!visible || !currentStep) return;

		if (!currentStep.target) {
			setTargetRect(null);
			return;
		}

		const measure = () => {
			const el = document.querySelector(
				`[data-onboarding="${currentStep.target}"]`,
			);
			if (el) {
				setTargetRect(el.getBoundingClientRect());
			} else {
				setTargetRect(null);
			}
		};

		measure();

		// Re-measure on resize/scroll
		window.addEventListener("resize", measure);
		window.addEventListener("scroll", measure, true);
		return () => {
			window.removeEventListener("resize", measure);
			window.removeEventListener("scroll", measure, true);
		};
	}, [visible, currentStep]);

	// Lock body scroll while tour is visible
	useEffect(() => {
		if (!visible) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, [visible]);

	const finish = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, "true");
		setVisible(false);
	}, []);

	const next = useCallback(() => {
		if (step >= activeSteps.length - 1) {
			finish();
		} else {
			setStep((s) => s + 1);
		}
	}, [step, activeSteps.length, finish]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!visible) return;
			if (e.key === "Escape") {
				finish();
			} else if (e.key === "ArrowRight" || e.key === "Enter") {
				next();
			}
		},
		[visible, finish, next],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	// Focus the tooltip when step changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: step triggers re-focus intentionally
	useEffect(() => {
		if (visible && tooltipRef.current) {
			tooltipRef.current.focus();
		}
	}, [visible, step]);

	if (!visible || !currentStep) return null;

	const tooltipPos = getTooltipPosition(targetRect, isMobile);
	const isLastStep = step === activeSteps.length - 1;
	const padding = 8;

	return (
		<div
			className="dm-onboarding-overlay"
			aria-modal="true"
			role="dialog"
			aria-label={`Onboarding step ${step + 1} of ${activeSteps.length}: ${currentStep.title}`}
		>
			{/* Spotlight cutout using box-shadow trick */}
			{targetRect ? (
				<div
					className="dm-onboarding-spotlight"
					style={{
						top: targetRect.top - padding,
						left: targetRect.left - padding,
						width: targetRect.width + padding * 2,
						height: targetRect.height + padding * 2,
					}}
				/>
			) : (
				/* Full dark overlay for welcome step */
				<div className="dm-onboarding-backdrop" />
			)}

			{/* Tooltip */}
			<div
				ref={tooltipRef}
				className="dm-onboarding-tooltip"
				style={{
					top: targetRect ? tooltipPos.top : "50%",
					left: targetRect ? tooltipPos.left : "50%",
					transform: targetRect ? "none" : "translate(-50%, -50%)",
				}}
				data-placement={tooltipPos.placement}
				tabIndex={-1}
			>
				<p className="dm-onboarding-step-count">
					{step + 1} / {activeSteps.length}
				</p>
				<h3 className="dm-onboarding-title">{currentStep.title}</h3>
				<p className="dm-onboarding-description">{currentStep.description}</p>
				<div className="dm-onboarding-actions">
					<button type="button" className="dm-onboarding-skip" onClick={finish}>
						Skip
					</button>
					<button type="button" className="dm-onboarding-next" onClick={next}>
						{isLastStep ? "Get Started" : "Next"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default OnboardingTour;

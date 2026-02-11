import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface EnvelopeAnimationProps {
	slug: string;
	onComplete: () => void;
	children: React.ReactNode;
	coupleNames?: string;
}

const STORAGE_PREFIX = "dm-opened-";

function getInitialPhase(slug: string): "sealed" | "fade-in" | "done" {
	if (typeof window === "undefined") return "done";

	try {
		if (localStorage.getItem(`${STORAGE_PREFIX}${slug}`) === "true") {
			return "done";
		}
	} catch {
		return "done";
	}

	const prefersReduced = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	if (prefersReduced) return "fade-in";

	return "sealed";
}

function markAsOpened(slug: string): void {
	try {
		localStorage.setItem(`${STORAGE_PREFIX}${slug}`, "true");
	} catch {
		// localStorage unavailable, continue silently
	}
}

const SKIP_BUTTON_CLASS =
	"absolute bottom-8 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white/90 transition-colors";

export default function EnvelopeAnimation({
	slug,
	onComplete,
	children,
	coupleNames,
}: EnvelopeAnimationProps) {
	const [phase, setPhase] = useState<"sealed" | "opening" | "fade-in" | "done">(
		() => getInitialPhase(slug),
	);
	const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (openTimer.current) clearTimeout(openTimer.current);
		};
	}, []);

	useEffect(() => {
		if (phase === "fade-in") {
			markAsOpened(slug);
			openTimer.current = setTimeout(() => {
				setPhase("done");
			}, 300);
		}
	}, [phase, slug]);

	useEffect(() => {
		if (phase === "done") {
			onComplete();
		}
	}, [phase, onComplete]);

	const handleOpen = useCallback(() => {
		setPhase("opening");
		markAsOpened(slug);

		openTimer.current = setTimeout(() => {
			setPhase("done");
		}, 1600);
	}, [slug]);

	const handleSkip = useCallback(() => {
		if (openTimer.current) {
			clearTimeout(openTimer.current);
			openTimer.current = null;
		}
		markAsOpened(slug);
		setPhase("done");
	}, [slug]);

	return (
		<>
			{children}
			<AnimatePresence>
				{phase === "fade-in" && (
					<motion.div
						className="dm-envelope-overlay"
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
					/>
				)}
				{(phase === "sealed" || phase === "opening") && (
					<motion.div
						className="dm-envelope-overlay"
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
						onClick={phase === "opening" ? handleSkip : undefined}
					>
						<motion.div
							className="dm-envelope"
							exit={{ scale: 0.8, opacity: 0 }}
							transition={{ duration: 0.4, ease: "easeIn" }}
						>
							<div className="dm-envelope-body" />

							<motion.div
								className="dm-envelope-card"
								animate={
									phase === "opening"
										? { y: "-80%", opacity: 1 }
										: { y: "0%", opacity: 1 }
								}
								transition={{
									duration: 0.8,
									delay: 0.3,
									ease: [0.25, 0.1, 0.25, 1],
								}}
							>
								<p className="dm-envelope-card-kicker">You are invited</p>
								<p className="dm-envelope-card-names">
									{coupleNames ?? "Wedding Invitation"}
								</p>
								<p className="dm-envelope-card-date">Open to view</p>
							</motion.div>

							<motion.div
								className="dm-envelope-flap"
								animate={
									phase === "opening" ? { rotateX: 180 } : { rotateX: 0 }
								}
								transition={{
									duration: 0.6,
									ease: [0.4, 0, 0.2, 1],
								}}
							>
								<div className="dm-envelope-flap-inner" />
							</motion.div>

							<motion.div
								className="dm-envelope-seal"
								animate={
									phase === "opening"
										? { scale: 0, opacity: 0 }
										: { scale: 1, opacity: 1 }
								}
								transition={{
									duration: 0.3,
									ease: "easeIn",
								}}
							>
								<span className="dm-envelope-seal-text">&#x56CD;</span>
							</motion.div>

							{phase === "sealed" && (
								<motion.button
									type="button"
									className="dm-envelope-open-btn"
									onClick={handleOpen}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: 0.3,
										duration: 0.4,
									}}
								>
									Open Invitation
								</motion.button>
							)}

							<motion.button
								type="button"
								onClick={handleSkip}
								className={SKIP_BUTTON_CLASS}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									delay: phase === "sealed" ? 1.0 : 0.3,
								}}
							>
								Skip animation
							</motion.button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

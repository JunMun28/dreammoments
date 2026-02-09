import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface EnvelopeAnimationProps {
	slug: string;
	onComplete: () => void;
	children: React.ReactNode;
}

const STORAGE_PREFIX = "dm-opened-";

function shouldSkipAnimation(slug: string): boolean {
	if (typeof window === "undefined") return true;

	// Skip if user prefers reduced motion
	const prefersReduced = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	if (prefersReduced) return true;

	// Skip if already opened
	try {
		return localStorage.getItem(`${STORAGE_PREFIX}${slug}`) === "true";
	} catch {
		return true;
	}
}

function markAsOpened(slug: string): void {
	try {
		localStorage.setItem(`${STORAGE_PREFIX}${slug}`, "true");
	} catch {
		// localStorage unavailable, continue silently
	}
}

export default function EnvelopeAnimation({
	slug,
	onComplete,
	children,
}: EnvelopeAnimationProps) {
	const [phase, setPhase] = useState<"sealed" | "opening" | "done">(() =>
		shouldSkipAnimation(slug) ? "done" : "sealed",
	);
	const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (openTimer.current) clearTimeout(openTimer.current);
		};
	}, []);

	useEffect(() => {
		if (phase === "done") {
			onComplete();
		}
	}, [phase, onComplete]);

	const handleOpen = useCallback(() => {
		setPhase("opening");
		markAsOpened(slug);

		// After animation completes, remove overlay
		openTimer.current = setTimeout(() => {
			setPhase("done");
		}, 1600);
	}, [slug]);

	return (
		<>
			{children}
			<AnimatePresence>
				{phase !== "done" && (
					<motion.div
						className="dm-envelope-overlay"
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					>
						{/* Envelope container */}
						<motion.div
							className="dm-envelope"
							exit={{ scale: 0.8, opacity: 0 }}
							transition={{ duration: 0.4, ease: "easeIn" }}
						>
							{/* Envelope body */}
							<div className="dm-envelope-body" />

							{/* Card inside envelope */}
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
								<p className="dm-envelope-card-names">Wedding Invitation</p>
								<p className="dm-envelope-card-date">Open to view</p>
							</motion.div>

							{/* Envelope flap */}
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

							{/* Gold seal */}
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

							{/* Open button */}
							{phase === "sealed" && (
								<motion.button
									type="button"
									className="dm-envelope-open-btn"
									onClick={handleOpen}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: 0.5,
										duration: 0.4,
									}}
								>
									Open Invitation
								</motion.button>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

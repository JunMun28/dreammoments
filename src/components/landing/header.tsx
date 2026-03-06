"use client";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const sections = [
	{ id: "hero", label: "Home" },
	{ id: "showcase", label: "Templates" },
	{ id: "social-proof", label: "Stories" },
	{ id: "faq", label: "FAQ" },
];

const menuItems = [
	{ label: "Home", href: "#" },
	{ label: "Templates", href: "#showcase" },
	{ label: "Stories", href: "#social-proof" },
	{ label: "FAQ", href: "#faq" },
];

export function Header() {
	const [activeSection, setActiveSection] = useState("Home");
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const isOnHero = activeSection === "Home";

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 640);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY + window.innerHeight / 3;

			for (let i = sections.length - 1; i >= 0; i--) {
				const section = sections[i];
				if (!section) continue;
				const element =
					document.querySelector(`.${section.id}`) ??
					document.getElementById(section.id);
				if (!element) continue;
				const { offsetTop } = element as HTMLElement;
				if (scrollPosition >= offsetTop) {
					setActiveSection(section.label);
					return;
				}
			}

			if (sections[0]) {
				setActiveSection(sections[0].label);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const pillClass = isOnHero
		? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
		: "bg-background/80 border border-border/40 text-foreground hover:bg-background/90 dark:bg-white/10 dark:border-white/20 dark:text-foreground dark:hover:bg-white/20";

	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
			className="fixed left-0 right-0 top-0 z-50 px-4 py-6 sm:px-12 sm:py-12 lg:px-24"
		>
			<div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 2xl:max-w-[112.5rem] min-[120rem]:max-w-[137.5rem]">
				<motion.a
					href="/"
					className={`font-heading flex h-12 shrink-0 items-center justify-center rounded-xl px-4 text-base font-semibold tracking-tight shadow-[0_8px_32px_0_rgba(26,46,26,0.07)] backdrop-blur-xl sm:h-16 sm:rounded-2xl sm:px-5 sm:text-xl transition-all duration-300 hover:scale-[1.02] ${pillClass}`}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{
						duration: 0.6,
						ease: [0.22, 1, 0.36, 1],
						delay: 0.1,
					}}
					whileTap={{ scale: 0.95 }}
				>
					DreamMoments
				</motion.a>

				<div className="flex items-center gap-3">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex items-center"
					>
						<SignedOut>
							<SignInButton mode="redirect">
								<button
									type="button"
									className={`h-12 rounded-xl px-4 text-sm font-medium shadow-[0_8px_32px_0_rgba(26,46,26,0.07)] backdrop-blur-xl transition-all hover:scale-[1.02] sm:h-16 sm:rounded-2xl sm:px-5 ${pillClass}`}
								>
									Sign in
								</button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<div
								className={`flex h-12 items-center rounded-xl px-3 shadow-[0_8px_32px_0_rgba(26,46,26,0.07)] backdrop-blur-xl sm:h-16 sm:rounded-2xl sm:px-4 ${pillClass}`}
							>
								<UserButton />
							</div>
						</SignedIn>
					</motion.div>

					<div className="relative h-12 w-52 sm:h-16 sm:w-64">
						<motion.div
							className={`absolute right-0 top-0 w-52 overflow-hidden rounded-xl shadow-[0_8px_32px_0_rgba(26,46,26,0.07)] backdrop-blur-xl sm:h-auto sm:w-64 sm:rounded-2xl ${pillClass}`}
							initial={{ opacity: 0, x: 20 }}
							animate={{
								opacity: 1,
								x: 0,
								height: isMenuOpen ? "auto" : isMobile ? 48 : 64,
							}}
							transition={{
								duration: 0.4,
								ease: [0.22, 1, 0.36, 1],
								height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
								delay: 0.2,
							}}
						>
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className={`flex h-12 w-full items-center justify-between gap-4 px-4 sm:h-16 sm:px-5 transition-colors ${
									isOnHero
										? "text-white hover:bg-white/5"
										: "text-foreground hover:bg-foreground/5 dark:hover:bg-white/5"
								}`}
								type="button"
								aria-label="Toggle menu"
								aria-expanded={isMenuOpen}
							>
								<span className="text-base font-medium sm:text-lg">
									{activeSection}
								</span>
								<motion.div
									className="relative h-5 w-5 sm:h-6 sm:w-6"
									animate={{ rotate: isMenuOpen ? 45 : 0 }}
									transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
								>
									<span className="absolute left-1/2 top-0 h-5 w-[1.5px] -translate-x-1/2 bg-current sm:h-6" />
									<span className="absolute left-0 top-1/2 h-[1.5px] w-5 -translate-y-1/2 bg-current sm:w-6" />
								</motion.div>
							</button>

							<AnimatePresence>
								{isMenuOpen && (
									<motion.nav
										className="px-5 pb-5"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2, delay: 0.1 }}
									>
										<ul className="flex flex-col gap-1">
											{menuItems.map((item, index) => (
												<motion.li
													key={item.label}
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: -10 }}
													transition={{
														duration: 0.3,
														delay: 0.05 * index,
														ease: [0.22, 1, 0.36, 1],
													}}
												>
													<a
														href={item.href}
														onClick={() => {
															setIsMenuOpen(false);
															setActiveSection(item.label);
														}}
														className={`block py-1.5 text-lg font-medium transition-all hover:translate-x-1 ${
															isOnHero
																? activeSection === item.label
																	? "text-white font-semibold"
																	: "text-white/80 hover:text-white"
																: activeSection === item.label
																	? "text-foreground font-semibold"
																	: "text-foreground/60 hover:text-foreground"
														}`}
													>
														{item.label}
													</a>
												</motion.li>
											))}
										</ul>
										<Link
											to="/editor/new"
											search={{ template: "double-happiness" }}
											className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
											onClick={() => setIsMenuOpen(false)}
										>
											Start creating
										</Link>
									</motion.nav>
								)}
							</AnimatePresence>
						</motion.div>
					</div>
				</div>
			</div>
		</motion.header>
	);
}

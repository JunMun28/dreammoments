"use client";

import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useOverlay } from "./overlay-context";

const sections = [
	{ id: "hero", label: "Home" },
	{ id: "projects", label: "Templates" },
	{ id: "services", label: "Features" },
	{ id: "about", label: "About us" },
	{ id: "social-proof", label: "Testimonials" },
	{ id: "faq", label: "FAQ" },
];

const menuItems = [
	{ label: "Home", href: "#" },
	{ label: "Templates", href: "#projects" },
	{ label: "Features", href: "#services-menu" },
	{ label: "About us", href: "#about" },
	{ label: "Testimonials", href: "#social-proof" },
	{ label: "FAQ", href: "#faq" },
];

export function Header() {
	const [activeSection, setActiveSection] = useState("Home");
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const { isOverlayOpen } = useOverlay();

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

	return (
		<AnimatePresence>
			{!isOverlayOpen && (
				<motion.header
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
					className="fixed left-0 right-0 top-0 z-50 px-4 py-6 sm:px-12 sm:py-12 lg:px-24"
				>
					<div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 2xl:max-w-[112.5rem] min-[120rem]:max-w-[137.5rem]">
						<motion.a
							href="/"
							className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900/70 px-4 text-base font-medium tracking-tight text-white shadow-lg backdrop-blur-lg sm:h-16 sm:rounded-2xl sm:px-5 sm:text-xl"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							DreamMoments
						</motion.a>

						<div className="relative h-12 sm:h-16">
							<motion.div
								className="absolute right-0 top-0 w-52 overflow-hidden rounded-xl bg-neutral-900/70 shadow-lg backdrop-blur-lg sm:h-auto sm:w-64 sm:rounded-2xl"
								initial={{ opacity: 0, y: -20 }}
								animate={{
									opacity: 1,
									y: 0,
									height: isMenuOpen ? "auto" : isMobile ? 48 : 64,
								}}
								transition={{
									duration: 0.4,
									ease: [0.22, 1, 0.36, 1],
									height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
								}}
							>
								<button
									onClick={() => setIsMenuOpen(!isMenuOpen)}
									className="flex h-12 w-full items-center justify-between gap-4 px-4 text-white sm:h-16 sm:px-5"
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
															className={`block py-1.5 text-lg font-medium transition-colors hover:text-white ${
																activeSection === item.label
																	? "text-white underline underline-offset-4"
																	: "text-white/60"
															}`}
														>
															{item.label}
														</a>
													</motion.li>
												))}
											</ul>
											<Link
												to="/editor/new"
												search={{ template: "love-at-dusk" }}
												className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-90"
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
				</motion.header>
			)}
		</AnimatePresence>
	);
}

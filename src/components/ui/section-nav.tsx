"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Section {
	id: string;
	label: string;
}

interface SectionNavProps {
	/** Array of sections with id and label */
	sections: Section[];
	/** Accent color for active indicator */
	accentColor?: string;
	/** Whether to show labels on hover */
	showLabels?: boolean;
}

/**
 * Floating section navigation dots for long-page format.
 * Highlights the current section based on scroll position.
 * Clicking a dot scrolls to that section.
 */
export function SectionNav({
	sections,
	accentColor = "#b76e79",
	showLabels = true,
}: SectionNavProps) {
	const [activeSection, setActiveSection] = useState<string>(
		sections[0]?.id || "",
	);
	const [hoveredSection, setHoveredSection] = useState<string | null>(null);

	// Track scroll position and update active section
	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY + window.innerHeight / 3;

			for (const section of [...sections].reverse()) {
				const element = document.getElementById(section.id);
				if (element && element.offsetTop <= scrollPosition) {
					setActiveSection(section.id);
					break;
				}
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll(); // Initial check

		return () => window.removeEventListener("scroll", handleScroll);
	}, [sections]);

	const scrollToSection = useCallback((sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	if (sections.length === 0) return null;

	return (
		<nav
			className="fixed right-4 top-1/2 z-50 -translate-y-1/2"
			aria-label="Section navigation"
		>
			<ul className="flex flex-col items-end gap-3">
				{sections.map((section) => {
					const isActive = activeSection === section.id;
					const isHovered = hoveredSection === section.id;

					return (
						<li key={section.id} className="relative">
							<button
								type="button"
								onClick={() => scrollToSection(section.id)}
								onMouseEnter={() => setHoveredSection(section.id)}
								onMouseLeave={() => setHoveredSection(null)}
								className="group flex items-center gap-2"
								aria-label={`Go to ${section.label}`}
								aria-current={isActive ? "true" : undefined}
							>
								{/* Label */}
								{showLabels && (
									<span
										className={cn(
											"whitespace-nowrap rounded-full bg-black/70 px-3 py-1 text-xs text-white transition-all duration-200",
											isHovered ? "opacity-100" : "opacity-0",
										)}
									>
										{section.label}
									</span>
								)}

								{/* Dot */}
								<span
									className={cn(
										"block h-3 w-3 rounded-full border-2 transition-all duration-200",
										isActive ? "scale-110" : "scale-100 hover:scale-110",
									)}
									style={{
										borderColor: accentColor,
										backgroundColor: isActive ? accentColor : "white",
									}}
								/>
							</button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
	zhLabel: string;
	enHeading: string;
	primaryColor?: string;
	darkColor?: string;
	headingFont?: CSSProperties;
	accentFont?: CSSProperties;
	className?: string;
}

export default function SectionTitle({
	zhLabel,
	enHeading,
	primaryColor = "#C8102E",
	darkColor = "#2B1216",
	headingFont = { fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif" },
	accentFont = {
		fontFamily: "'Noto Serif SC', 'Songti SC', serif",
		fontWeight: 700,
	},
	className,
}: SectionTitleProps) {
	return (
		<div className={cn("text-center", className)}>
			<p
				data-reveal
				lang="zh-Hans"
				className="dm-reveal text-sm tracking-[0.5em]"
				style={{ ...headingFont, color: primaryColor }}
			>
				{zhLabel}
			</p>
			<h2
				data-reveal
				className="dm-reveal mt-3 text-4xl sm:text-5xl"
				style={{ ...accentFont, color: darkColor }}
				lang="en"
			>
				{enHeading}
			</h2>
		</div>
	);
}

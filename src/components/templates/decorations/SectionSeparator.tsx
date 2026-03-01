import { cn } from "@/lib/utils";

type SeparatorVariant = "cloud" | "xi" | "floral";

interface SectionSeparatorProps {
	variant?: SeparatorVariant;
	className?: string;
}

function CloudIcon() {
	return (
		<svg
			aria-hidden="true"
			width={20}
			height={12}
			viewBox="0 0 20 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M3 11C1.5 11 0 9.5 0 8C0 6.5 1.5 5 3 5C3 2.5 5.5 0 9 0C11.5 0 13.5 1.5 14.5 3.5C15.5 2.5 17 2.5 18 4C19.5 4 20 5.5 20 7C20 9.5 18 11 16 11H3Z"
				fill="currentColor"
			/>
		</svg>
	);
}

function XiIcon() {
	return (
		<span
			style={{
				fontSize: "12px",
				lineHeight: 1,
				fontFamily: "'Noto Serif SC', serif",
				fontWeight: 700,
			}}
		>
			{"\u56CD"}
		</span>
	);
}

function FloralIcon() {
	return (
		<svg
			aria-hidden="true"
			width={12}
			height={12}
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx={6} cy={6} r={2} fill="currentColor" />
			<circle cx={6} cy={1} r={1.2} fill="currentColor" opacity={0.6} />
			<circle cx={6} cy={11} r={1.2} fill="currentColor" opacity={0.6} />
			<circle cx={1} cy={6} r={1.2} fill="currentColor" opacity={0.6} />
			<circle cx={11} cy={6} r={1.2} fill="currentColor" opacity={0.6} />
		</svg>
	);
}

const VARIANT_MAP: Record<SeparatorVariant, () => React.JSX.Element> = {
	cloud: CloudIcon,
	xi: XiIcon,
	floral: FloralIcon,
};

export function SectionSeparator({
	variant = "cloud",
	className,
}: SectionSeparatorProps) {
	const Icon = VARIANT_MAP[variant];

	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none flex items-center justify-center",
				className,
			)}
			style={{ height: "24px", opacity: 0.3, color: "#D4A843" }}
		>
			<Icon />
		</div>
	);
}

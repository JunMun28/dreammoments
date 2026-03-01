import { cn } from "@/lib/utils";

type Motif = "xi" | "diamond" | "cloud";

interface OrnamentalDividerProps {
	motif?: Motif;
	width?: string;
	className?: string;
}

function DiamondMotif() {
	return (
		<svg
			aria-hidden="true"
			width={8}
			height={8}
			viewBox="0 0 8 8"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M4 0L8 4L4 8L0 4Z" fill="#D4A843" />
		</svg>
	);
}

function CloudMotif() {
	return (
		<svg
			aria-hidden="true"
			width={12}
			height={8}
			viewBox="0 0 12 8"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M2 7C1 7 0 6 0 5C0 4 1 3 2 3C2 1.5 3.5 0 5.5 0C7 0 8 1 8.5 2C9 1.5 10 1.5 10.5 2.5C11.5 2.5 12 3.5 12 4.5C12 6 11 7 9.5 7H2Z"
				fill="#D4A843"
			/>
		</svg>
	);
}

function XiMotif() {
	return (
		<span
			style={{
				fontSize: "10px",
				lineHeight: 1,
				color: "#D4A843",
				fontFamily: "'Noto Serif SC', serif",
			}}
		>
			{"\u56CD"}
		</span>
	);
}

const MOTIF_MAP: Record<Motif, () => React.JSX.Element> = {
	diamond: DiamondMotif,
	xi: XiMotif,
	cloud: CloudMotif,
};

const LINE_GRADIENT =
	"linear-gradient(to right, transparent, rgba(212,168,67,0.5), transparent)";

function GoldLine() {
	return (
		<span
			className="block w-full"
			style={{ height: "1px", background: LINE_GRADIENT }}
		/>
	);
}

export function OrnamentalDivider({
	motif = "diamond",
	width = "128px",
	className,
}: OrnamentalDividerProps) {
	const MotifComponent = MOTIF_MAP[motif];

	return (
		<div
			aria-hidden="true"
			className={cn(
				"relative mx-auto flex flex-col items-center justify-center",
				className,
			)}
			style={{ width }}
		>
			{/* Top line */}
			<GoldLine />
			{/* Gap + centered motif */}
			<span
				className="flex items-center justify-center"
				style={{ height: "6px" }}
			>
				<span className="absolute">
					<MotifComponent />
				</span>
			</span>
			{/* Bottom line */}
			<GoldLine />
		</div>
	);
}

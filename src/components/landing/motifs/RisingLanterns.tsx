interface RisingLanternsProps {
	reducedMotion: boolean;
}

function seededRandom(seed: number) {
	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}

const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

const LANTERNS = Array.from({ length: 5 }, (_, i) => ({
	id: i,
	size: r(16 + seededRandom(i * 5 + 1) * 8),
	left: r(8 + seededRandom(i * 5 + 2) * 84),
	opacity: r(0.1 + seededRandom(i * 5 + 3) * 0.1),
	duration: r(12 + seededRandom(i * 5 + 4) * 6),
	delay: r(seededRandom(i * 5 + 5) * 10),
}));

export function RisingLanterns({ reducedMotion }: RisingLanternsProps) {
	if (reducedMotion) return null;

	return (
		<div
			className="pointer-events-none absolute inset-0 overflow-hidden"
			aria-hidden="true"
		>
			{LANTERNS.map((l) => (
				<svg
					key={l.id}
					className="absolute"
					width={l.size}
					height={r(l.size * 1.4)}
					viewBox="0 0 20 28"
					role="presentation"
					style={{
						left: `${l.left}%`,
						bottom: "-10%",
						opacity: l.opacity,
						animationName: "dm-lantern-rise",
						animationDuration: `${l.duration}s`,
						animationDelay: `${l.delay}s`,
						animationTimingFunction: "ease-in-out",
						animationIterationCount: "infinite",
					}}
				>
					<title>Decorative lantern</title>
					{/* Lantern top hook */}
					<line
						x1="10"
						y1="0"
						x2="10"
						y2="4"
						stroke="var(--dm-gold-electric)"
						strokeWidth="1"
						opacity="0.6"
					/>
					{/* Lantern body */}
					<ellipse
						cx="10"
						cy="14"
						rx="7"
						ry="10"
						fill="var(--dm-crimson)"
						opacity="0.8"
					/>
					{/* Inner glow */}
					<ellipse
						cx="10"
						cy="13"
						rx="4"
						ry="6"
						fill="var(--dm-gold-electric)"
						opacity="0.3"
					/>
					{/* Lantern bottom tassel */}
					<line
						x1="10"
						y1="24"
						x2="10"
						y2="28"
						stroke="var(--dm-gold-electric)"
						strokeWidth="1"
						opacity="0.5"
					/>
				</svg>
			))}
		</div>
	);
}

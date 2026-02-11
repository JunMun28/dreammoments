interface PetalShowerProps {
	reducedMotion: boolean;
}

function seededRandom(seed: number) {
	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}

const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

const PETALS = Array.from({ length: 9 }, (_, i) => ({
	id: i,
	width: r(8 + seededRandom(i * 9 + 1) * 6),
	height: r(5 + seededRandom(i * 9 + 2) * 4),
	left: r(5 + seededRandom(i * 9 + 3) * 90),
	opacity: r(0.15 + seededRandom(i * 9 + 4) * 0.1),
	duration: r(10 + seededRandom(i * 9 + 5) * 6),
	delay: r(seededRandom(i * 9 + 6) * 10),
	rotation: r(seededRandom(i * 9 + 7) * 360),
	driftAmount: r(30 + seededRandom(i * 9 + 8) * 40),
	useRose: seededRandom(i * 9 + 9) > 0.4,
}));

export function PetalShower({ reducedMotion }: PetalShowerProps) {
	if (reducedMotion) return null;

	return (
		<div
			className="pointer-events-none absolute inset-0 overflow-hidden"
			aria-hidden="true"
		>
			{PETALS.map((p) => (
				<svg
					key={p.id}
					className="absolute"
					width={p.width}
					height={p.height}
					viewBox="0 0 14 10"
					role="presentation"
					style={{
						left: `${p.left}%`,
						top: "-5%",
						opacity: p.opacity,
						transform: `rotate(${p.rotation}deg)`,
						animationName: "dm-petal-fall",
						animationDuration: `${p.duration}s`,
						animationDelay: `${p.delay}s`,
						animationTimingFunction: "ease-in-out",
						animationIterationCount: "infinite",
						["--petal-drift" as string]: `${p.driftAmount}px`,
					}}
				>
					<title>Decorative petal</title>
					<ellipse
						cx="7"
						cy="5"
						rx="7"
						ry="5"
						fill={p.useRose ? "var(--dm-rose)" : "var(--dm-rose-soft)"}
					/>
				</svg>
			))}
		</div>
	);
}

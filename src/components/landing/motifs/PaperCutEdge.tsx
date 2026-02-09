interface PaperCutEdgeProps {
	position: "top" | "bottom";
	color?: string;
	/** Number of scallops on desktop. Defaults to 20. Mobile uses roughly 60% of this. */
	scallops?: number;
}

export function PaperCutEdge({
	position,
	color = "var(--dm-bg)",
	scallops = 20,
}: PaperCutEdgeProps) {
	const points = [];
	for (let i = 0; i <= scallops; i++) {
		const x = (i / scallops) * 100;
		const y = i % 2 === 0 ? 0 : 100;
		points.push(`${x}% ${y}%`);
	}

	const clipPath =
		position === "bottom"
			? `polygon(${points.join(", ")})`
			: `polygon(${points
					.map((p) => {
						const [x, y] = p.split(" ");
						return `${x} ${y === "0%" ? "100%" : "0%"}`;
					})
					.join(", ")})`;

	// Mobile scallops: roughly 60% of desktop
	const mobileScallops = Math.max(8, Math.round(scallops * 0.6));
	const mobilePoints = [];
	for (let i = 0; i <= mobileScallops; i++) {
		const x = (i / mobileScallops) * 100;
		const y = i % 2 === 0 ? 0 : 100;
		mobilePoints.push(`${x}% ${y}%`);
	}

	const mobileClipPath =
		position === "bottom"
			? `polygon(${mobilePoints.join(", ")})`
			: `polygon(${mobilePoints
					.map((p) => {
						const [x, y] = p.split(" ");
						return `${x} ${y === "0%" ? "100%" : "0%"}`;
					})
					.join(", ")})`;

	return (
		<>
			{/* Desktop */}
			<div
				className={`absolute left-0 right-0 h-6 hidden md:block ${position === "bottom" ? "bottom-0 translate-y-full" : "top-0 -translate-y-full"}`}
				style={{
					background: color,
					clipPath,
				}}
				aria-hidden="true"
			/>
			{/* Mobile */}
			<div
				className={`absolute left-0 right-0 h-6 md:hidden ${position === "bottom" ? "bottom-0 translate-y-full" : "top-0 -translate-y-full"}`}
				style={{
					background: color,
					clipPath: mobileClipPath,
				}}
				aria-hidden="true"
			/>
		</>
	);
}

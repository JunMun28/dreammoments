interface CurvedConnectorPathProps {
	direction: "left-to-right" | "right-to-left";
	className?: string;
}

export function CurvedConnectorPath({
	direction,
	className,
}: CurvedConnectorPathProps) {
	const d =
		direction === "left-to-right"
			? "M 20,0 Q 20,50 100,50 Q 180,50 180,100"
			: "M 180,0 Q 180,50 100,50 Q 20,50 20,100";

	return (
		<svg
			viewBox="0 0 200 100"
			preserveAspectRatio="none"
			className={className}
			style={{ width: "100%", height: 60 }}
			aria-hidden="true"
		>
			<path
				d={d}
				fill="none"
				stroke="var(--dm-gold-electric)"
				strokeWidth={2}
				opacity={0.25}
			/>
		</svg>
	);
}

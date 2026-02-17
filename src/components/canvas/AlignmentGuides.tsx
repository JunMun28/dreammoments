import type { GuideLine } from "./hooks/useSnapGuides";

export function AlignmentGuides({
	guides,
	canvasWidth,
	canvasHeight,
}: {
	guides: GuideLine[];
	canvasWidth: number;
	canvasHeight: number;
}) {
	if (guides.length === 0) return null;

	return (
		<div className="pointer-events-none absolute inset-0 z-40">
			{guides.map((guide, index) => {
				if (guide.axis === "x") {
					return (
						<div
							key={`x-${guide.position}-${index}`}
							className="absolute top-0 w-px bg-[color:var(--dm-accent-strong)]/70"
							style={{
								left: guide.position,
								height: canvasHeight,
							}}
						/>
					);
				}
				return (
					<div
						key={`y-${guide.position}-${index}`}
						className="absolute left-0 h-px bg-[color:var(--dm-accent-strong)]/70"
						style={{
							top: guide.position,
							width: canvasWidth,
						}}
					/>
				);
			})}
		</div>
	);
}

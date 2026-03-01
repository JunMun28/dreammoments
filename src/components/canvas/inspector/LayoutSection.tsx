import type { Block, Position, Size } from "@/lib/canvas/types";
import {
	InspectorField,
	InspectorSection,
	NumberInput,
} from "./InspectorSection";

function coerceNumber(value: string, fallback: number): number {
	const parsed = Number(value);
	if (Number.isNaN(parsed)) return fallback;
	return parsed;
}

function coercePositiveSize(value: string, fallback: number): number {
	const parsed = Number(value);
	if (Number.isNaN(parsed)) return fallback;
	return Math.max(10, parsed);
}

export function LayoutSection({
	block,
	onMove,
	onResize,
	onRestyle,
}: {
	block: Block;
	onMove: (position: Position) => void;
	onResize: (size: Size) => void;
	onRestyle: (stylePatch: Record<string, string>) => void;
}) {
	const opacity = block.style.opacity ?? "1";

	return (
		<InspectorSection title="Layout">
			<div className="grid grid-cols-2 gap-2">
				<InspectorField label="X">
					<NumberInput
						ariaLabel="Block X position"
						value={String(Math.round(block.position.x))}
						suffix="px"
						onChange={(next) =>
							onMove({
								x: coerceNumber(next, block.position.x),
								y: block.position.y,
							})
						}
					/>
				</InspectorField>
				<InspectorField label="Y">
					<NumberInput
						ariaLabel="Block Y position"
						value={String(Math.round(block.position.y))}
						suffix="px"
						onChange={(next) =>
							onMove({
								x: block.position.x,
								y: coerceNumber(next, block.position.y),
							})
						}
					/>
				</InspectorField>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<InspectorField label="W">
					<NumberInput
						ariaLabel="Block width"
						value={String(Math.round(block.size.width))}
						suffix="px"
						onChange={(next) =>
							onResize({
								width: coercePositiveSize(next, block.size.width),
								height: block.size.height,
							})
						}
					/>
				</InspectorField>
				<InspectorField label="H">
					<NumberInput
						ariaLabel="Block height"
						value={String(Math.round(block.size.height))}
						suffix="px"
						onChange={(next) =>
							onResize({
								width: block.size.width,
								height: coercePositiveSize(next, block.size.height),
							})
						}
					/>
				</InspectorField>
			</div>
			<InspectorField label="Opacity">
				<NumberInput
					ariaLabel="Block opacity"
					value={opacity}
					min={0}
					max={1}
					onChange={(next) => {
						const value = coerceNumber(next, 1);
						onRestyle({ opacity: String(Math.max(0, Math.min(1, value))) });
					}}
				/>
			</InspectorField>
		</InspectorSection>
	);
}

// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { Block, BlockType } from "@/lib/canvas/types";
import { BlockRenderer } from "./BlockRenderer";

function makeBlock(
	type: BlockType,
	content: Record<string, unknown> = {},
): Block {
	return {
		id: `${type}-1`,
		type,
		position: { x: 0, y: 0 },
		size: { width: 120, height: 80 },
		zIndex: 0,
		content,
		style: {},
	};
}

describe("BlockRenderer", () => {
	test("renders gallery/timeline/map/countdown/form/group/decorative blocks", () => {
		render(
			<div>
				<BlockRenderer
					block={makeBlock("gallery", {
						photos: [{ url: "/img.jpg", caption: "Memory" }],
					})}
				/>
				<BlockRenderer
					block={makeBlock("timeline", {
						summary: "Our story highlight",
					})}
				/>
				<BlockRenderer
					block={makeBlock("map", {
						name: "Venue Hall",
						address: "123 Main Street",
					})}
				/>
				<BlockRenderer
					block={makeBlock("countdown", {
						targetDate: "2030-01-01",
						label: "Countdown",
					})}
				/>
				<BlockRenderer
					block={makeBlock("form", {
						title: "RSVP",
					})}
				/>
				<BlockRenderer
					block={{
						...makeBlock("group"),
						children: ["a", "b"],
					}}
				/>
				<BlockRenderer
					block={makeBlock("decorative", {
						color: "#ff0000",
					})}
				/>
			</div>,
		);

		expect(screen.getByText("Memory")).toBeTruthy();
		expect(screen.getByText("Our story highlight")).toBeTruthy();
		expect(screen.getByText("Venue Hall")).toBeTruthy();
		expect(screen.getByText("Countdown")).toBeTruthy();
		expect(screen.getByText("RSVP Form")).toBeTruthy();
		expect(screen.getByText("Group (2)")).toBeTruthy();
	});
});

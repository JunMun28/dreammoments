import type { Locator, Page } from "@playwright/test"

type SwipeDirection = "up" | "down" | "left" | "right"

/**
 * Simulate a swipe gesture on an element by dispatching touch events.
 * Note: Touch events may not fire in all browser engines (e.g., desktop Chromium).
 * Use appropriate guards in tests.
 */
export async function swipe(
	page: Page,
	element: Locator,
	direction: SwipeDirection,
	distance = 200,
) {
	const box = await element.boundingBox()
	if (!box) throw new Error("Element not visible for swipe")

	const startX = box.x + box.width / 2
	const startY = box.y + box.height / 2

	let endX = startX
	let endY = startY

	switch (direction) {
		case "up":
			endY = startY - distance
			break
		case "down":
			endY = startY + distance
			break
		case "left":
			endX = startX - distance
			break
		case "right":
			endX = startX + distance
			break
	}

	await page.evaluate(
		({ startX, startY, endX, endY }) => {
			const el = document.elementFromPoint(startX, startY)
			if (!el) return

			const touchStart = new TouchEvent("touchstart", {
				bubbles: true,
				cancelable: true,
				touches: [
					new Touch({ identifier: 0, target: el, clientX: startX, clientY: startY }),
				],
			})

			const touchMove = new TouchEvent("touchmove", {
				bubbles: true,
				cancelable: true,
				touches: [
					new Touch({ identifier: 0, target: el, clientX: endX, clientY: endY }),
				],
			})

			const touchEnd = new TouchEvent("touchend", {
				bubbles: true,
				cancelable: true,
				changedTouches: [
					new Touch({ identifier: 0, target: el, clientX: endX, clientY: endY }),
				],
			})

			el.dispatchEvent(touchStart)
			el.dispatchEvent(touchMove)
			el.dispatchEvent(touchEnd)
		},
		{ startX, startY, endX, endY },
	)
}

/**
 * Simulate a vertical drag gesture on an element.
 * Dispatches touchstart at startY, touchmove to endY, then touchend.
 */
export async function drag(
	page: Page,
	element: Locator,
	startY: number,
	endY: number,
) {
	const box = await element.boundingBox()
	if (!box) throw new Error("Element not visible for drag")

	const x = box.x + box.width / 2

	await page.evaluate(
		({ x, startY, endY }) => {
			const el = document.elementFromPoint(x, startY)
			if (!el) return

			const touchStart = new TouchEvent("touchstart", {
				bubbles: true,
				cancelable: true,
				touches: [
					new Touch({ identifier: 0, target: el, clientX: x, clientY: startY }),
				],
			})

			const touchMove = new TouchEvent("touchmove", {
				bubbles: true,
				cancelable: true,
				touches: [
					new Touch({ identifier: 0, target: el, clientX: x, clientY: endY }),
				],
			})

			const touchEnd = new TouchEvent("touchend", {
				bubbles: true,
				cancelable: true,
				changedTouches: [
					new Touch({ identifier: 0, target: el, clientX: x, clientY: endY }),
				],
			})

			el.dispatchEvent(touchStart)
			el.dispatchEvent(touchMove)
			el.dispatchEvent(touchEnd)
		},
		{ x, startY, endY },
	)
}

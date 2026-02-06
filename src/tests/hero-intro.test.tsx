import { describe, expect, test } from "vitest";
import {
	HERO_INTRO_STORAGE_KEY,
	persistHeroIntroSeen,
	shouldPlayHeroIntro,
} from "../routes/index";

function createStorage(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		getItem(key: string) {
			return data.get(key) ?? null;
		},
		setItem(key: string, value: string) {
			data.set(key, value);
		},
	};
}

describe("hero intro behavior", () => {
	test("first visit sets intro to play and writes storage key", () => {
		const storage = createStorage();
		const shouldPlay = shouldPlayHeroIntro(false, storage);
		expect(shouldPlay).toBe(true);
		persistHeroIntroSeen(storage);
		expect(storage.getItem(HERO_INTRO_STORAGE_KEY)).toBe("1");
	});

	test("returning visit skips intro", () => {
		const storage = createStorage({ [HERO_INTRO_STORAGE_KEY]: "1" });
		expect(shouldPlayHeroIntro(false, storage)).toBe(false);
	});

	test("reduced motion skips intro regardless of storage", () => {
		const storage = createStorage();
		expect(shouldPlayHeroIntro(true, storage)).toBe(false);
		expect(storage.getItem(HERO_INTRO_STORAGE_KEY)).toBeNull();
	});
});

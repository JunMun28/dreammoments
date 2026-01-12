import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./useAutosave";

describe("useAutosave", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should start with idle status", () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useAutosave({ data: { name: "test" }, onSave }),
		);

		expect(result.current.status).toBe("idle");
		expect(result.current.error).toBeNull();
	});

	it("should not save on initial render", () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		renderHook(() => useAutosave({ data: { name: "test" }, onSave }));

		vi.advanceTimersByTime(2000);

		expect(onSave).not.toHaveBeenCalled();
	});

	it("should debounce saves when data changes", async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { rerender } = renderHook(
			({ data }) => useAutosave({ data, onSave, delay: 500 }),
			{ initialProps: { data: { name: "initial" } } },
		);

		// Change data multiple times
		rerender({ data: { name: "change1" } });
		rerender({ data: { name: "change2" } });
		rerender({ data: { name: "change3" } });

		// Before debounce delay
		vi.advanceTimersByTime(400);
		expect(onSave).not.toHaveBeenCalled();

		// After debounce delay - should only save once with latest data
		await act(async () => {
			vi.advanceTimersByTime(100);
		});

		expect(onSave).toHaveBeenCalledTimes(1);
		expect(onSave).toHaveBeenCalledWith({ name: "change3" });
	});

	it("should set status to saving then saved on success", async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { result, rerender } = renderHook(
			({ data }) => useAutosave({ data, onSave, delay: 100 }),
			{ initialProps: { data: { name: "initial" } } },
		);

		rerender({ data: { name: "updated" } });

		// Advance timers to trigger debounced save
		await act(async () => {
			vi.advanceTimersByTime(100);
			// Flush the promise queue
			await Promise.resolve();
		});

		expect(result.current.status).toBe("saved");
	});

	it("should set status to error on failure", async () => {
		const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));
		const { result, rerender } = renderHook(
			({ data }) => useAutosave({ data, onSave, delay: 100 }),
			{ initialProps: { data: { name: "initial" } } },
		);

		rerender({ data: { name: "updated" } });

		// Advance timers to trigger debounced save
		await act(async () => {
			vi.advanceTimersByTime(100);
			// Flush the promise queue (including rejected promise)
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(result.current.status).toBe("error");
		expect(result.current.error).toBe("Save failed");
	});

	it("should allow manual save with saveNow", async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useAutosave({ data: { name: "test" }, onSave, delay: 1000 }),
		);

		await act(async () => {
			await result.current.saveNow();
		});

		expect(onSave).toHaveBeenCalledTimes(1);
		expect(result.current.status).toBe("saved");
	});

	it("should cancel pending save when saveNow is called", async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { result, rerender } = renderHook(
			({ data }) => useAutosave({ data, onSave, delay: 500 }),
			{ initialProps: { data: { name: "initial" } } },
		);

		// Trigger debounced save
		rerender({ data: { name: "updated" } });

		// Call saveNow before debounce completes
		await act(async () => {
			vi.advanceTimersByTime(200);
			await result.current.saveNow();
		});

		// Let original debounce time pass
		await act(async () => {
			vi.advanceTimersByTime(500);
		});

		// Should only have been called once (by saveNow)
		expect(onSave).toHaveBeenCalledTimes(1);
	});

	it("should reset status when reset is called", async () => {
		const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));
		const { result, rerender } = renderHook(
			({ data }) => useAutosave({ data, onSave, delay: 100 }),
			{ initialProps: { data: { name: "initial" } } },
		);

		rerender({ data: { name: "updated" } });

		// Advance timers to trigger debounced save
		await act(async () => {
			vi.advanceTimersByTime(100);
			// Flush the promise queue (including rejected promise)
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(result.current.status).toBe("error");

		act(() => {
			result.current.reset();
		});

		expect(result.current.status).toBe("idle");
		expect(result.current.error).toBeNull();
	});

	it("should not save when enabled is false", () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { rerender } = renderHook(
			({ data, enabled }) => useAutosave({ data, onSave, delay: 100, enabled }),
			{ initialProps: { data: { name: "initial" }, enabled: false } },
		);

		rerender({ data: { name: "updated" }, enabled: false });

		vi.advanceTimersByTime(200);

		expect(onSave).not.toHaveBeenCalled();
	});

	it("should use default delay of 1000ms", async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { rerender } = renderHook(
			({ data }) => useAutosave({ data, onSave }),
			{ initialProps: { data: { name: "initial" } } },
		);

		rerender({ data: { name: "updated" } });

		// Before 1000ms
		vi.advanceTimersByTime(900);
		expect(onSave).not.toHaveBeenCalled();

		// After 1000ms
		await act(async () => {
			vi.advanceTimersByTime(100);
		});

		expect(onSave).toHaveBeenCalledTimes(1);
	});
});

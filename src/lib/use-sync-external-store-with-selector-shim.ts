/**
 * React 19 ESM shim for use-sync-external-store/shim/with-selector.
 *
 * Provides `useSyncExternalStoreWithSelector` using React 19's built-in
 * `useSyncExternalStore`. This avoids the CJS→ESM incompatibility that
 * breaks Vite's dev server.
 */
import { useRef, useSyncExternalStore } from "react";

const objectIs = Object.is;

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
	subscribe: (onStoreChange: () => void) => () => void,
	getSnapshot: () => Snapshot,
	getServerSnapshot: (() => Snapshot) | undefined,
	selector: (snapshot: Snapshot) => Selection,
	isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
	const instRef = useRef<{ hasValue: boolean; value: Selection } | null>(null);
	let inst = instRef.current;
	if (inst === null) {
		inst = { hasValue: false, value: undefined as Selection };
		instRef.current = inst;
	}

	const [getSelection, getServerSelection] = ((currentInst: {
		hasValue: boolean;
		value: Selection;
	}) => {
		let hasMemo = false;
		let memoizedSnapshot: Snapshot;
		let memoizedSelection: Selection;

		const memoizedSelector = (nextSnapshot: Snapshot): Selection => {
			if (!hasMemo) {
				hasMemo = true;
				memoizedSnapshot = nextSnapshot;
				const nextSelection = selector(nextSnapshot);
				if (isEqual !== undefined && currentInst.hasValue) {
					const currentSelection = currentInst.value;
					if (isEqual(currentSelection, nextSelection)) {
						memoizedSelection = currentSelection;
						return currentSelection;
					}
				}
				memoizedSelection = nextSelection;
				return nextSelection;
			}

			const prevSnapshot = memoizedSnapshot;
			const prevSelection = memoizedSelection;

			if (objectIs(prevSnapshot, nextSnapshot)) {
				return prevSelection;
			}

			const nextSelection = selector(nextSnapshot);

			if (isEqual?.(prevSelection, nextSelection)) {
				memoizedSnapshot = nextSnapshot;
				return prevSelection;
			}

			memoizedSnapshot = nextSnapshot;
			memoizedSelection = nextSelection;
			return nextSelection;
		};

		const clientGetSelection = () => memoizedSelector(getSnapshot());
		const serverGetSelection =
			getServerSnapshot === undefined
				? undefined
				: () => memoizedSelector(getServerSnapshot());

		return [clientGetSelection, serverGetSelection];
	})(inst);

	const value = useSyncExternalStore(
		subscribe,
		getSelection,
		getServerSelection,
	);

	inst.hasValue = true;
	inst.value = value;

	return value;
}

// Default export for libraries that use `import X from '...'` (e.g. Zustand)
export default { useSyncExternalStoreWithSelector };

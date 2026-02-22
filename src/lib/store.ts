import { useEffect, useState } from "react";
import type { Store } from "./types";

const STORAGE_KEY = "dm-store-v1";
const STORE_EVENT = "dm-store";

const defaultStore: Store = {
	users: [],
	invitations: [],
	guests: [],
	views: [],
	aiGenerations: [],
	invitationSnapshots: [],
	payments: [],
	sessions: {},
	passwords: {},
	rateLimits: {},
};

const safeWindow = () => (typeof window === "undefined" ? null : window);

export function getStore(): Store {
	const win = safeWindow();
	if (!win) return defaultStore;
	const raw = win.localStorage.getItem(STORAGE_KEY);
	if (!raw) return defaultStore;
	try {
		return { ...defaultStore, ...JSON.parse(raw) };
	} catch {
		return defaultStore;
	}
}

export function setStore(next: Store) {
	const win = safeWindow();
	if (!win) return;
	win.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	win.dispatchEvent(new Event(STORE_EVENT));
}

export function updateStore(mutator: (store: Store) => Store) {
	const next = mutator(getStore());
	setStore(next);
	return next;
}

export function useStore<T>(selector: (store: Store) => T) {
	const [store, setStoreState] = useState<Store>(() => getStore());

	useEffect(() => {
		const win = safeWindow();
		if (!win) return;
		const handler = () => setStoreState(getStore());
		handler();
		win.addEventListener(STORE_EVENT, handler);
		return () => win.removeEventListener(STORE_EVENT, handler);
	}, []);

	return selector(store);
}

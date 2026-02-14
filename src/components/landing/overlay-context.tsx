"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface OverlayContextValue {
	isOverlayOpen: boolean;
	setIsOverlayOpen: (value: boolean) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
	const [isOverlayOpen, setIsOverlayOpen] = useState(false);

	return (
		<OverlayContext.Provider value={{ isOverlayOpen, setIsOverlayOpen }}>
			{children}
		</OverlayContext.Provider>
	);
}

export function useOverlay() {
	const context = useContext(OverlayContext);
	if (!context) {
		throw new Error("useOverlay must be used within OverlayProvider");
	}
	return context;
}

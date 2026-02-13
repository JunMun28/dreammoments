"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type LandingTheme = "light" | "dark";

interface LandingThemeContextValue {
	theme: LandingTheme;
	resolvedTheme: LandingTheme;
	setTheme: (theme: LandingTheme) => void;
	toggleTheme: () => void;
}

const STORAGE_KEY = "dm-landing-theme";
const DEFAULT_THEME: LandingTheme = "dark";

const LandingThemeContext = createContext<LandingThemeContextValue | null>(
	null,
);

function readStoredTheme(): LandingTheme {
	if (typeof window === "undefined") return DEFAULT_THEME;
	const stored = window.localStorage.getItem(STORAGE_KEY);
	return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
}

export function LandingThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<LandingTheme>(readStoredTheme);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const setTheme = useCallback((nextTheme: LandingTheme) => {
		setThemeState(nextTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		setThemeState((current) => (current === "dark" ? "light" : "dark"));
	}, []);

	const value = useMemo<LandingThemeContextValue>(
		() => ({
			theme,
			resolvedTheme: theme,
			setTheme,
			toggleTheme,
		}),
		[theme, setTheme, toggleTheme],
	);

	return (
		<LandingThemeContext.Provider value={value}>
			{children}
		</LandingThemeContext.Provider>
	);
}

export function useLandingTheme() {
	const context = useContext(LandingThemeContext);
	if (!context) {
		throw new Error("useLandingTheme must be used within LandingThemeProvider");
	}
	return context;
}

"use client";

import { Moon, Sun } from "lucide-react";
import { type ReactNode, useSyncExternalStore } from "react";
import { useLandingTheme } from "./theme-context";

function useIsMounted(): boolean {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
}

export function ThemeSwitch(): ReactNode {
	const mounted = useIsMounted();
	const { setTheme, resolvedTheme } = useLandingTheme();

	const toggleTheme = (): void => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	if (!mounted) {
		return (
			<div className="fixed bottom-20 right-6 z-50">
				<button
					type="button"
					className="w-12 h-12 rounded-full bg-foreground/10 opacity-30 cursor-not-allowed"
					aria-label="Toggle theme"
					disabled
				/>
			</div>
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<div className="fixed bottom-20 right-6 z-50">
			<button
				onClick={toggleTheme}
				className="w-11 h-11 cursor-pointer rounded-full bg-muted text-foreground flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity duration-300 shadow-lg hover:shadow-xl"
				aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
				aria-pressed={isDark}
				type="button"
			>
				{isDark ? (
					<Sun className="w-5 h-5" aria-hidden="true" />
				) : (
					<Moon className="w-5 h-5" aria-hidden="true" />
				)}
			</button>
		</div>
	);
}

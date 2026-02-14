"use client";

import { useEffect, useState } from "react";

function detectWebglSupport(): boolean {
	if (typeof window === "undefined") return false;

	try {
		const canvas = document.createElement("canvas");
		const gl =
			canvas.getContext("webgl2") ||
			canvas.getContext("webgl") ||
			canvas.getContext("experimental-webgl");
		return !!gl;
	} catch {
		return false;
	}
}

export function useWebglSupport(): boolean {
	const [supported, setSupported] = useState(false);

	useEffect(() => {
		setSupported(detectWebglSupport());
	}, []);

	return supported;
}

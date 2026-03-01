import { useCallback, useEffect, useRef, useState } from "react";
import type { Block } from "@/lib/canvas/types";

function toText(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function InlineTextEditor({
	block,
	onCommit,
	onCancel,
	singleLine,
}: {
	block: Block;
	onCommit: (text: string) => void;
	onCancel: () => void;
	singleLine?: boolean;
}) {
	const [value, setValue] = useState(toText(block.content.text));
	const [isComposing, setIsComposing] = useState(false);
	const ref = useRef<HTMLDivElement | null>(null);
	const committedRef = useRef(false);

	useEffect(() => {
		// Defer focus to next frame so the overlay is fully painted
		const id = requestAnimationFrame(() => {
			ref.current?.focus();
		});
		return () => cancelAnimationFrame(id);
	}, []);

	const commitText = useCallback(
		(text: string) => {
			if (committedRef.current) return;
			committedRef.current = true;
			onCommit(text);
		},
		[onCommit],
	);

	return (
		<div className="absolute inset-0 z-50 rounded-[inherit] border border-[color:var(--dm-accent-strong)] bg-white/95">
			<div
				ref={ref}
				contentEditable
				role="textbox"
				aria-multiline={!singleLine}
				tabIndex={0}
				suppressContentEditableWarning
				className="h-full w-full overflow-auto whitespace-pre-wrap break-words p-2 text-inherit outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)]"
				onInput={(event) => {
					setValue(event.currentTarget.textContent ?? "");
				}}
				onPaste={(event) => {
					event.preventDefault();
					const text = event.clipboardData.getData("text/plain");
					document.execCommand("insertText", false, text);
				}}
				onCompositionStart={() => setIsComposing(true)}
				onCompositionEnd={() => setIsComposing(false)}
				onBlur={() => {
					// Read from DOM for IME: composition may not have flushed to React state
					const text = ref.current?.textContent ?? value;
					commitText(text.trim());
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape" && !isComposing) {
						event.preventDefault();
						onCancel();
						return;
					}
					if (singleLine && event.key === "Enter" && !isComposing) {
						event.preventDefault();
						commitText(value.trim());
					}
				}}
			>
				{value}
			</div>
		</div>
	);
}

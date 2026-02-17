import { useEffect, useRef, useState } from "react";
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

	useEffect(() => {
		ref.current?.focus();
	}, []);

	return (
		<div className="absolute inset-0 z-50 rounded-[inherit] border border-[color:var(--dm-accent-strong)] bg-white/95">
			<div
				ref={ref}
				contentEditable
				role="textbox"
				aria-multiline={!singleLine}
				tabIndex={0}
				suppressContentEditableWarning
				className="h-full w-full overflow-auto whitespace-pre-wrap break-words p-2 text-inherit outline-none"
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
				onBlur={() => onCommit(value.trim())}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						onCancel();
						return;
					}
					if (singleLine && event.key === "Enter" && !isComposing) {
						event.preventDefault();
						onCommit(value.trim());
					}
				}}
			>
				{value}
			</div>
		</div>
	);
}

import { useCallback, useRef, useState } from "react";

type InlineEditState = {
	fieldPath: string;
	value: string;
	rect: DOMRect | null;
};

type UseInlineEditReturn = {
	inlineEdit: InlineEditState | null;
	openInlineEdit: (
		fieldPath: string,
		value: string,
		element?: HTMLElement,
	) => void;
	closeInlineEdit: () => void;
	updateInlineValue: (value: string) => void;
	saveInlineEdit: () => string;
};

export function useInlineEdit(): UseInlineEditReturn {
	const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);
	const valueRef = useRef<string>("");

	const openInlineEdit = useCallback(
		(fieldPath: string, value: string, element?: HTMLElement) => {
			valueRef.current = value;
			setInlineEdit({
				fieldPath,
				value,
				rect: element ? element.getBoundingClientRect() : null,
			});
		},
		[],
	);

	const closeInlineEdit = useCallback(() => {
		setInlineEdit(null);
	}, []);

	const updateInlineValue = useCallback((value: string) => {
		valueRef.current = value;
		setInlineEdit((prev) => (prev ? { ...prev, value } : null));
	}, []);

	const saveInlineEdit = useCallback(() => {
		const value = valueRef.current;
		setInlineEdit(null);
		return value;
	}, []);

	return {
		inlineEdit,
		openInlineEdit,
		closeInlineEdit,
		updateInlineValue,
		saveInlineEdit,
	};
}

import { useCallback, useState } from "react";
import type { FieldConfig } from "../../../templates/types";
import { validateField } from "./useEditorState";

export function useFieldValidation() {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = useCallback(
		(fieldPath: string, field: FieldConfig, value: string): string => {
			const error = validateField(field, value);
			setErrors((prev) => ({ ...prev, [fieldPath]: error }));
			return error;
		},
		[],
	);

	const clearError = useCallback((fieldPath: string) => {
		setErrors((prev) => {
			const next = { ...prev };
			delete next[fieldPath];
			return next;
		});
	}, []);

	const clearAll = useCallback(() => {
		setErrors({});
	}, []);

	return {
		errors,
		setErrors,
		validate,
		clearError,
		clearAll,
	};
}

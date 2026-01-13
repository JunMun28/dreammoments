import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface GuestGroupEditorValues {
	name: string;
}

interface GuestGroupEditorProps {
	/** Initial values when editing existing group */
	initialValues?: GuestGroupEditorValues;
	/** Called when save is clicked */
	onSave: (values: GuestGroupEditorValues) => void;
	/** Called when cancel is clicked */
	onCancel: () => void;
	/** Whether save is in progress */
	isSaving?: boolean;
}

/**
 * Form for creating or editing a guest group name.
 */
export function GuestGroupEditor({
	initialValues,
	onSave,
	onCancel,
	isSaving = false,
}: GuestGroupEditorProps) {
	const id = useId();
	const [name, setName] = useState(initialValues?.name ?? "");
	const [error, setError] = useState<string | null>(null);

	const handleSave = () => {
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Group name is required");
			return;
		}

		onSave({ name: trimmedName });
	};

	return (
		<div
			className="rounded-lg border bg-card p-4 space-y-4"
			data-testid="guest-group-editor"
		>
			<div className="space-y-2">
				<Label htmlFor={`${id}-name`}>Group Name</Label>
				<Input
					id={`${id}-name`}
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						setError(null);
					}}
					placeholder="e.g., Family, Friends, Colleagues"
					data-testid="group-name-input"
				/>
				{error && (
					<p
						className="text-sm text-destructive"
						data-testid="group-name-error"
					>
						{error}
					</p>
				)}
			</div>

			<div className="flex gap-2 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isSaving}
					data-testid="cancel-group-button"
				>
					Cancel
				</Button>
				<Button
					type="button"
					onClick={handleSave}
					disabled={isSaving}
					data-testid="save-group-button"
				>
					{isSaving ? "Saving..." : initialValues ? "Update" : "Create"}
				</Button>
			</div>
		</div>
	);
}

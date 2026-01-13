import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface GuestEditorValues {
	name: string;
	email?: string;
	phone?: string;
}

interface GuestEditorProps {
	/** Initial values when editing existing guest */
	initialValues?: GuestEditorValues;
	/** Called when save is clicked */
	onSave: (values: GuestEditorValues) => void;
	/** Called when cancel is clicked */
	onCancel: () => void;
	/** Whether save is in progress */
	isSaving?: boolean;
}

/**
 * Form for creating or editing a guest.
 */
export function GuestEditor({
	initialValues,
	onSave,
	onCancel,
	isSaving = false,
}: GuestEditorProps) {
	const id = useId();
	const [name, setName] = useState(initialValues?.name ?? "");
	const [email, setEmail] = useState(initialValues?.email ?? "");
	const [phone, setPhone] = useState(initialValues?.phone ?? "");
	const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

	const validateEmail = (value: string): boolean => {
		if (!value) return true; // Optional field
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value);
	};

	const handleSave = () => {
		const trimmedName = name.trim();
		const trimmedEmail = email.trim();
		const newErrors: { name?: string; email?: string } = {};

		if (!trimmedName) {
			newErrors.name = "Guest name is required";
		}

		if (trimmedEmail && !validateEmail(trimmedEmail)) {
			newErrors.email = "Invalid email format";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		onSave({
			name: trimmedName,
			email: trimmedEmail || undefined,
			phone: phone.trim() || undefined,
		});
	};

	return (
		<div
			className="rounded-lg border bg-muted/50 p-3 space-y-3"
			data-testid="guest-editor"
		>
			<div className="space-y-2">
				<Label htmlFor={`${id}-name`}>Name *</Label>
				<Input
					id={`${id}-name`}
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						setErrors((prev) => ({ ...prev, name: undefined }));
					}}
					placeholder="Guest name"
					data-testid="guest-name-input"
				/>
				{errors.name && (
					<p
						className="text-sm text-destructive"
						data-testid="guest-name-error"
					>
						{errors.name}
					</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label htmlFor={`${id}-email`}>Email</Label>
					<Input
						id={`${id}-email`}
						type="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							setErrors((prev) => ({ ...prev, email: undefined }));
						}}
						placeholder="email@example.com"
						data-testid="guest-email-input"
					/>
					{errors.email && (
						<p
							className="text-sm text-destructive"
							data-testid="guest-email-error"
						>
							{errors.email}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor={`${id}-phone`}>Phone</Label>
					<Input
						id={`${id}-phone`}
						type="tel"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="555-1234"
						data-testid="guest-phone-input"
					/>
				</div>
			</div>

			<div className="flex gap-2 justify-end">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onCancel}
					disabled={isSaving}
					data-testid="cancel-guest-button"
				>
					Cancel
				</Button>
				<Button
					type="button"
					size="sm"
					onClick={handleSave}
					disabled={isSaving}
					data-testid="save-guest-button"
				>
					{isSaving ? "Saving..." : initialValues ? "Update" : "Add"}
				</Button>
			</div>
		</div>
	);
}

import type { FabricObject } from "fabric";
import { Link, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * CE-031: Click/Interaction Properties
 *
 * Allows setting click actions on canvas elements:
 * - None (no action)
 * - URL Link (open URL on click)
 * - Phone Call (tel: link)
 * - Email (mailto: link)
 */

/**
 * Click interaction types
 */
export type ClickActionType = "none" | "url" | "phone" | "email";

/**
 * Click interaction configuration stored on Fabric objects
 */
export interface ClickInteraction {
	type: ClickActionType;
	value?: string;
}

interface ClickPropertiesProps {
	/** The selected Fabric object */
	object: FabricObject & { clickInteraction?: ClickInteraction };
	/** Callback when properties change */
	onPropertyChange?: (property: string, value: unknown) => void;
}

/**
 * CE-031: Click action properties panel.
 * Allows setting URL, phone, or email actions on canvas elements.
 */
export function ClickProperties({
	object,
	onPropertyChange,
}: ClickPropertiesProps) {
	const currentInteraction = object.clickInteraction || {
		type: "none" as ClickActionType,
		value: undefined,
	};

	const [actionType, setActionType] = useState<ClickActionType>(
		currentInteraction.type,
	);
	const [value, setValue] = useState(currentInteraction.value || "");

	// Sync state when object changes
	useEffect(() => {
		const interaction = object.clickInteraction || {
			type: "none" as ClickActionType,
			value: undefined,
		};
		setActionType(interaction.type);
		setValue(interaction.value || "");
	}, [object]);

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newType = e.target.value as ClickActionType;
		setActionType(newType);

		if (newType === "none") {
			setValue("");
			onPropertyChange?.("clickInteraction", {
				type: "none",
				value: undefined,
			});
		} else {
			onPropertyChange?.("clickInteraction", {
				type: newType,
				value: "",
			});
		}
	};

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);
		onPropertyChange?.("clickInteraction", {
			type: actionType,
			value: newValue,
		});
	};

	const getInputConfig = () => {
		switch (actionType) {
			case "url":
				return {
					label: "URL",
					placeholder: "https://example.com",
					icon: Link,
					type: "url",
				};
			case "phone":
				return {
					label: "Phone Number",
					placeholder: "+1 234 567 890",
					icon: Phone,
					type: "tel",
				};
			case "email":
				return {
					label: "Email Address",
					placeholder: "rsvp@wedding.com",
					icon: Mail,
					type: "email",
				};
			default:
				return null;
		}
	};

	const inputConfig = getInputConfig();

	return (
		<div className="space-y-4 border-t p-4">
			<div className="flex items-center gap-2">
				<Link className="h-4 w-4 text-stone-500" />
				<h3 className="font-medium text-stone-900">Click Action</h3>
			</div>

			<div className="space-y-3">
				{/* Action Type Dropdown */}
				<div className="space-y-1.5">
					<Label htmlFor="action-type">Action Type</Label>
					<select
						id="action-type"
						className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
						value={actionType}
						onChange={handleTypeChange}
						aria-label="Action Type"
					>
						<option value="none">None</option>
						<option value="url">URL Link</option>
						<option value="phone">Phone Call</option>
						<option value="email">Email</option>
					</select>
				</div>

				{/* Conditional Input Field */}
				{inputConfig && (
					<div className="space-y-1.5">
						<Label htmlFor="action-value" className="flex items-center gap-2">
							<inputConfig.icon className="h-3 w-3 text-stone-400" />
							{inputConfig.label}
						</Label>
						<Input
							id="action-value"
							type={inputConfig.type}
							value={value}
							onChange={handleValueChange}
							placeholder={inputConfig.placeholder}
							className="h-9"
							aria-label={inputConfig.label}
						/>
					</div>
				)}

				{/* Help Text */}
				{actionType !== "none" && (
					<p className="text-xs text-stone-400">
						{actionType === "url" && "Opens the URL when element is clicked."}
						{actionType === "phone" &&
							"Opens phone dialer with this number when clicked."}
						{actionType === "email" &&
							"Opens email client with this address when clicked."}
					</p>
				)}
			</div>
		</div>
	);
}

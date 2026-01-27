import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	categoryDisplayNames,
	getCategories,
	getTemplatesByCategory,
	type TemplateCategory,
	type TemplateData,
} from "@/lib/template-data";

interface TemplateSelectionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Template card component showing preview thumbnail and info
 */
function TemplateCard({ template }: { template: TemplateData }) {
	return (
		<div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
			{/* Preview thumbnail */}
			<div
				className="aspect-[3/4] w-full overflow-hidden"
				style={{ backgroundColor: template.backgroundColor || "#ffffff" }}
			>
				{template.heroImageUrl ? (
					<img
						src={template.heroImageUrl}
						alt={`${template.name} preview`}
						className="h-full w-full object-cover transition-transform group-hover:scale-105"
					/>
				) : (
					<div
						className="flex h-full w-full items-center justify-center"
						style={{ backgroundColor: template.backgroundColor || "#f5f5f5" }}
					>
						<span
							className="text-4xl font-light"
							style={{ color: template.accentColor }}
						>
							{template.preview.partner1Name[0]} &{" "}
							{template.preview.partner2Name[0]}
						</span>
					</div>
				)}
			</div>

			{/* Template info */}
			<div className="p-4">
				<h3 className="font-semibold text-sm truncate">{template.name}</h3>
				<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
					{template.description}
				</p>

				{/* Select button */}
				<Button size="sm" className="w-full mt-3" asChild>
					<Link to="/login" search={{ template: template.id }}>
						Use Template
					</Link>
				</Button>
			</div>
		</div>
	);
}

/**
 * Category filter tabs
 */
function CategoryTabs({
	selected,
	onSelect,
}: {
	selected: TemplateCategory;
	onSelect: (category: TemplateCategory) => void;
}) {
	const categories: TemplateCategory[] = ["all", ...getCategories()];

	return (
		<div className="flex flex-wrap gap-2 mb-4">
			{categories.map((category) => (
				<Button
					key={category}
					variant={selected === category ? "default" : "outline"}
					size="sm"
					onClick={() => onSelect(category)}
					className="text-xs"
				>
					{categoryDisplayNames[category]}
				</Button>
			))}
		</div>
	);
}

/**
 * Template selection modal that displays all available templates
 * with category filtering and selection
 */
export function TemplateSelectionModal({
	open,
	onOpenChange,
}: TemplateSelectionModalProps) {
	const [selectedCategory, setSelectedCategory] =
		useState<TemplateCategory>("all");

	const templates = getTemplatesByCategory(selectedCategory);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
				showCloseButton={false}
			>
				<DialogHeader className="flex-shrink-0">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="text-xl">
								Choose Your Template
							</DialogTitle>
							<DialogDescription>
								Select a template to start creating your wedding invitation
							</DialogDescription>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onOpenChange(false)}
							className="h-8 w-8"
							aria-label="Close"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>

				{/* Category filter */}
				<CategoryTabs
					selected={selectedCategory}
					onSelect={setSelectedCategory}
				/>

				{/* Template grid - scrollable */}
				<div className="flex-1 overflow-y-auto min-h-0">
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
						{templates.map((template) => (
							<TemplateCard key={template.id} template={template} />
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

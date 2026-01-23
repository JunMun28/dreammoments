import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

/**
 * CE-009: Assets panel with decorative stickers and elements
 * Shows a searchable grid of decorative elements organized by category.
 */

/**
 * Asset category types
 */
export type AssetCategory =
	| "all"
	| "flowers"
	| "frames"
	| "dividers"
	| "icons"
	| "shapes";

/**
 * Asset definition for decorative elements
 */
export interface AssetDefinition {
	id: string;
	name: string;
	category: Exclude<AssetCategory, "all">;
	src: string;
	tags: string[];
	width: number;
	height: number;
}

/**
 * Pre-defined decorative assets
 * Using SVG data URIs for placeholder assets
 */
const ASSETS: AssetDefinition[] = [
	// Flowers
	{
		id: "flower-rose",
		name: "Rose",
		category: "flowers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='20' fill='%23db7093'/%3E%3Ccircle cx='32' cy='28' r='12' fill='%23ff69b4'/%3E%3Ccircle cx='32' cy='24' r='6' fill='%23ffb6c1'/%3E%3C/svg%3E",
		tags: ["rose", "pink", "romantic", "flower"],
		width: 80,
		height: 80,
	},
	{
		id: "flower-lily",
		name: "Lily",
		category: "flowers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cellipse cx='32' cy='40' rx='8' ry='16' fill='%23fff'/%3E%3Cellipse cx='24' cy='36' rx='6' ry='14' fill='%23fff' transform='rotate(-20 24 36)'/%3E%3Cellipse cx='40' cy='36' rx='6' ry='14' fill='%23fff' transform='rotate(20 40 36)'/%3E%3Ccircle cx='32' cy='28' r='4' fill='%23ffd700'/%3E%3C/svg%3E",
		tags: ["lily", "white", "elegant", "flower"],
		width: 80,
		height: 80,
	},
	{
		id: "flower-branch",
		name: "Flower Branch",
		category: "flowers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40'%3E%3Cpath d='M5 35 Q40 10 75 35' fill='none' stroke='%23228b22' stroke-width='2'/%3E%3Ccircle cx='20' cy='22' r='6' fill='%23db7093'/%3E%3Ccircle cx='40' cy='15' r='6' fill='%23ff69b4'/%3E%3Ccircle cx='60' cy='22' r='6' fill='%23db7093'/%3E%3C/svg%3E",
		tags: ["branch", "flowers", "garland", "decoration"],
		width: 120,
		height: 60,
	},
	{
		id: "flower-bouquet",
		name: "Bouquet",
		category: "flowers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='28' y='40' width='8' height='20' fill='%238b4513'/%3E%3Ccircle cx='32' cy='24' r='8' fill='%23ff69b4'/%3E%3Ccircle cx='24' cy='28' r='7' fill='%23db7093'/%3E%3Ccircle cx='40' cy='28' r='7' fill='%23ffb6c1'/%3E%3Ccircle cx='28' cy='18' r='6' fill='%23ff1493'/%3E%3Ccircle cx='36' cy='16' r='5' fill='%23db7093'/%3E%3C/svg%3E",
		tags: ["bouquet", "flowers", "wedding", "romantic"],
		width: 80,
		height: 100,
	},
	// Frames
	{
		id: "frame-ornate",
		name: "Ornate Frame",
		category: "frames",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='5' y='5' width='90' height='90' fill='none' stroke='%23c9a227' stroke-width='3'/%3E%3Crect x='10' y='10' width='80' height='80' fill='none' stroke='%23c9a227' stroke-width='1'/%3E%3Ccircle cx='5' cy='5' r='4' fill='%23c9a227'/%3E%3Ccircle cx='95' cy='5' r='4' fill='%23c9a227'/%3E%3Ccircle cx='5' cy='95' r='4' fill='%23c9a227'/%3E%3Ccircle cx='95' cy='95' r='4' fill='%23c9a227'/%3E%3C/svg%3E",
		tags: ["frame", "ornate", "gold", "elegant", "border"],
		width: 200,
		height: 200,
	},
	{
		id: "frame-simple",
		name: "Simple Frame",
		category: "frames",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='5' y='5' width='90' height='90' fill='none' stroke='%23292524' stroke-width='2'/%3E%3C/svg%3E",
		tags: ["frame", "simple", "minimal", "border"],
		width: 200,
		height: 200,
	},
	{
		id: "frame-rounded",
		name: "Rounded Frame",
		category: "frames",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='5' y='5' width='90' height='90' rx='15' fill='none' stroke='%23c9a227' stroke-width='2'/%3E%3C/svg%3E",
		tags: ["frame", "rounded", "gold", "border"],
		width: 200,
		height: 200,
	},
	// Dividers
	{
		id: "divider-line",
		name: "Simple Line",
		category: "dividers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 20'%3E%3Cline x1='10' y1='10' x2='190' y2='10' stroke='%23c9a227' stroke-width='2'/%3E%3C/svg%3E",
		tags: ["divider", "line", "simple", "separator"],
		width: 200,
		height: 20,
	},
	{
		id: "divider-ornate",
		name: "Ornate Divider",
		category: "dividers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 30'%3E%3Cline x1='10' y1='15' x2='80' y2='15' stroke='%23c9a227' stroke-width='1'/%3E%3Ccircle cx='100' cy='15' r='5' fill='%23c9a227'/%3E%3Cline x1='120' y1='15' x2='190' y2='15' stroke='%23c9a227' stroke-width='1'/%3E%3C/svg%3E",
		tags: ["divider", "ornate", "decorative", "separator"],
		width: 200,
		height: 30,
	},
	{
		id: "divider-flourish",
		name: "Flourish Divider",
		category: "dividers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'%3E%3Cpath d='M10 20 Q50 5 100 20 Q150 35 190 20' fill='none' stroke='%23c9a227' stroke-width='2'/%3E%3C/svg%3E",
		tags: ["divider", "flourish", "elegant", "swirl"],
		width: 200,
		height: 40,
	},
	// Icons
	{
		id: "icon-heart",
		name: "Heart",
		category: "icons",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M32 56 C20 44 8 34 8 22 C8 14 14 8 22 8 C26 8 30 10 32 14 C34 10 38 8 42 8 C50 8 56 14 56 22 C56 34 44 44 32 56Z' fill='%23db7093'/%3E%3C/svg%3E",
		tags: ["heart", "love", "romantic", "wedding"],
		width: 60,
		height: 60,
	},
	{
		id: "icon-rings",
		name: "Wedding Rings",
		category: "icons",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='24' cy='32' r='14' fill='none' stroke='%23c9a227' stroke-width='4'/%3E%3Ccircle cx='40' cy='32' r='14' fill='none' stroke='%23c9a227' stroke-width='4'/%3E%3C/svg%3E",
		tags: ["rings", "wedding", "marriage", "gold"],
		width: 80,
		height: 60,
	},
	{
		id: "icon-dove",
		name: "Dove",
		category: "icons",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cellipse cx='32' cy='32' rx='18' ry='10' fill='%23fff' stroke='%23ccc' stroke-width='1'/%3E%3Cellipse cx='48' cy='28' rx='10' ry='6' fill='%23fff' stroke='%23ccc' stroke-width='1'/%3E%3Ccircle cx='22' cy='30' r='2' fill='%23333'/%3E%3Cpath d='M16 32 L10 34 L16 36' fill='%23ffa500'/%3E%3C/svg%3E",
		tags: ["dove", "bird", "peace", "wedding"],
		width: 80,
		height: 60,
	},
	{
		id: "icon-champagne",
		name: "Champagne",
		category: "icons",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M24 50 L28 20 L36 20 L40 50 Z' fill='%23f5f0e6' stroke='%23c9a227' stroke-width='2'/%3E%3Crect x='28' y='50' width='8' height='4' fill='%23c9a227'/%3E%3Crect x='26' y='54' width='12' height='4' fill='%23c9a227'/%3E%3Ccircle cx='30' cy='26' r='2' fill='%23ffd700' opacity='0.6'/%3E%3Ccircle cx='34' cy='30' r='1.5' fill='%23ffd700' opacity='0.6'/%3E%3C/svg%3E",
		tags: ["champagne", "celebration", "toast", "wedding"],
		width: 60,
		height: 80,
	},
	// Shapes
	{
		id: "shape-circle",
		name: "Circle",
		category: "shapes",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='28' fill='%23c9a227' opacity='0.3'/%3E%3C/svg%3E",
		tags: ["circle", "shape", "round"],
		width: 80,
		height: 80,
	},
	{
		id: "shape-square",
		name: "Square",
		category: "shapes",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='8' y='8' width='48' height='48' fill='%23c9a227' opacity='0.3'/%3E%3C/svg%3E",
		tags: ["square", "shape", "rectangle"],
		width: 80,
		height: 80,
	},
	{
		id: "shape-diamond",
		name: "Diamond",
		category: "shapes",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpolygon points='32,4 60,32 32,60 4,32' fill='%23c9a227' opacity='0.3'/%3E%3C/svg%3E",
		tags: ["diamond", "shape", "rhombus"],
		width: 80,
		height: 80,
	},
	{
		id: "shape-star",
		name: "Star",
		category: "shapes",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpolygon points='32,4 39,24 60,24 43,38 50,58 32,46 14,58 21,38 4,24 25,24' fill='%23c9a227' opacity='0.5'/%3E%3C/svg%3E",
		tags: ["star", "shape", "sparkle"],
		width: 80,
		height: 80,
	},
];

/**
 * Category definitions with labels
 */
const CATEGORIES: { id: AssetCategory; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "flowers", label: "Flowers" },
	{ id: "frames", label: "Frames" },
	{ id: "dividers", label: "Dividers" },
	{ id: "icons", label: "Icons" },
	{ id: "shapes", label: "Shapes" },
];

interface AssetsPanelProps {
	/** Callback when an asset is selected */
	onAddAsset: (asset: AssetDefinition) => void;
}

/**
 * CE-009: Assets panel showing grid of decorative elements.
 * Supports category filtering and text search.
 */
export function AssetsPanel({ onAddAsset }: AssetsPanelProps) {
	const [activeCategory, setActiveCategory] = useState<AssetCategory>("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Filter assets by category and search query
	const filteredAssets = useMemo(() => {
		return ASSETS.filter((asset) => {
			// Filter by category
			if (activeCategory !== "all" && asset.category !== activeCategory) {
				return false;
			}

			// Filter by search query
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const matchesName = asset.name.toLowerCase().includes(query);
				const matchesTags = asset.tags.some((tag) =>
					tag.toLowerCase().includes(query),
				);
				return matchesName || matchesTags;
			}

			return true;
		});
	}, [activeCategory, searchQuery]);

	return (
		<div className="space-y-4">
			<h3 className="font-medium text-stone-700">Assets</h3>
			<p className="text-xs text-stone-500">Decorative elements and stickers</p>

			{/* Search Input */}
			<div className="relative">
				<Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
				<input
					type="text"
					placeholder="Search assets..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full rounded-md border border-stone-200 py-1.5 pr-8 pl-8 text-sm focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => setSearchQuery("")}
						className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
						aria-label="Clear search"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{/* Category Filters */}
			<div className="flex flex-wrap gap-1">
				{CATEGORIES.map((category) => (
					<button
						key={category.id}
						type="button"
						onClick={() => setActiveCategory(category.id)}
						className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
							activeCategory === category.id
								? "bg-stone-900 text-white"
								: "bg-stone-100 text-stone-600 hover:bg-stone-200"
						}`}
					>
						{category.label}
					</button>
				))}
			</div>

			{/* Assets Grid */}
			{filteredAssets.length > 0 ? (
				<div className="grid grid-cols-3 gap-2">
					{filteredAssets.map((asset) => (
						<button
							key={asset.id}
							type="button"
							onClick={() => onAddAsset(asset)}
							className="group flex aspect-square flex-col items-center justify-center rounded-lg border border-stone-200 bg-white p-2 transition-all hover:border-stone-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
							aria-label={`${asset.name} asset`}
						>
							<div
								data-testid={`asset-thumbnail-${asset.id}`}
								className="flex h-12 w-12 items-center justify-center"
							>
								<img
									src={asset.src}
									alt={asset.name}
									className="max-h-full max-w-full object-contain"
								/>
							</div>
							<span className="mt-1 truncate text-[10px] text-stone-500 group-hover:text-stone-700">
								{asset.name}
							</span>
						</button>
					))}
				</div>
			) : (
				<div className="py-8 text-center text-sm text-stone-400">
					No assets found
				</div>
			)}
		</div>
	);
}

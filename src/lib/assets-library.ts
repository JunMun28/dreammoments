/**
 * CE-033: Expanded Materials Library
 *
 * Comprehensive asset library for wedding invitation editor with:
 * - Wedding Elements (rings, hearts, champagne, cake)
 * - Double Happiness (囍 variations)
 * - Bouquets (floral designs)
 * - Frames (decorative frames)
 * - Icons (wedding-themed icons)
 * - Existing categories expanded
 */

/**
 * Asset category types - expanded from original
 */
export type AssetCategory =
	| "all"
	| "wedding"
	| "double-happiness"
	| "bouquets"
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
 * Category definitions with labels
 */
export const ASSET_CATEGORIES: { id: AssetCategory; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "wedding", label: "Wedding" },
	{ id: "double-happiness", label: "Double Happiness" },
	{ id: "bouquets", label: "Bouquets" },
	{ id: "flowers", label: "Flowers" },
	{ id: "frames", label: "Frames" },
	{ id: "dividers", label: "Dividers" },
	{ id: "icons", label: "Icons" },
	{ id: "shapes", label: "Shapes" },
];

/**
 * Comprehensive asset library
 */
export const ASSETS_LIBRARY: AssetDefinition[] = [
	// ===== WEDDING ELEMENTS =====
	{
		id: "wedding-rings",
		name: "Wedding Rings",
		category: "wedding",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Ccircle cx='35' cy='30' r='20' fill='none' stroke='%23FFD700' stroke-width='4'/%3E%3Ccircle cx='65' cy='30' r='20' fill='none' stroke='%23FFD700' stroke-width='4'/%3E%3Ccircle cx='50' cy='30' r='3' fill='%23fff' stroke='%23FFD700' stroke-width='1'/%3E%3C/svg%3E",
		tags: ["rings", "wedding", "gold", "marriage", "engagement"],
		width: 100,
		height: 60,
	},
	{
		id: "wedding-rings-interlinked",
		name: "Interlinked Rings",
		category: "wedding",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 50'%3E%3Cellipse cx='30' cy='25' rx='18' ry='15' fill='none' stroke='%23C9A227' stroke-width='3'/%3E%3Cellipse cx='50' cy='25' rx='18' ry='15' fill='none' stroke='%23D4AF37' stroke-width='3'/%3E%3C/svg%3E",
		tags: ["rings", "wedding", "gold", "interlinked"],
		width: 80,
		height: 50,
	},
	{
		id: "wedding-heart-gold",
		name: "Golden Heart",
		category: "wedding",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M32 56 C20 44 8 34 8 22 C8 14 14 8 22 8 C26 8 30 10 32 14 C34 10 38 8 42 8 C50 8 56 14 56 22 C56 34 44 44 32 56Z' fill='%23FFD700' stroke='%23C9A227' stroke-width='2'/%3E%3C/svg%3E",
		tags: ["heart", "wedding", "gold", "love", "romantic"],
		width: 64,
		height: 64,
	},
	{
		id: "wedding-champagne-toast",
		name: "Champagne Toast",
		category: "wedding",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cpath d='M25 70 L30 35 L38 35 L43 70 Z' fill='%23f5f0e6' stroke='%23c9a227' stroke-width='2'/%3E%3Cpath d='M37 70 L42 35 L50 35 L55 70 Z' fill='%23f5f0e6' stroke='%23c9a227' stroke-width='2' transform='rotate(15 46 52)'/%3E%3Ccircle cx='34' cy='25' r='8' fill='%23FFD700' opacity='0.3'/%3E%3Ccircle cx='46' cy='20' r='6' fill='%23FFD700' opacity='0.3'/%3E%3Ccircle cx='32' cy='40' r='2' fill='%23ffd700' opacity='0.6'/%3E%3Ccircle cx='48' cy='42' r='1.5' fill='%23ffd700' opacity='0.6'/%3E%3C/svg%3E",
		tags: ["champagne", "toast", "wedding", "celebration", "drink"],
		width: 80,
		height: 80,
	},
	{
		id: "wedding-cake",
		name: "Wedding Cake",
		category: "wedding",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 100'%3E%3Crect x='25' y='70' width='30' height='20' fill='%23fff' stroke='%23c9a227' stroke-width='2' rx='2'/%3E%3Crect x='20' y='50' width='40' height='20' fill='%23fff' stroke='%23c9a227' stroke-width='2' rx='2'/%3E%3Crect x='15' y='30' width='50' height='20' fill='%23fff' stroke='%23c9a227' stroke-width='2' rx='2'/%3E%3Ccircle cx='40' cy='20' r='8' fill='%23ffb6c1'/%3E%3Ccircle cx='35' cy='22' r='5' fill='%23db7093'/%3E%3Ccircle cx='45' cy='22' r='5' fill='%23ff69b4'/%3E%3C/svg%3E",
		tags: ["cake", "wedding", "celebration", "dessert", "tiered"],
		width: 80,
		height: 100,
	},
	{
		id: "wedding-bells",
		name: "Wedding Bells",
		category: "wedding",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cpath d='M25 20 Q30 10 35 15 L35 35 Q35 50 25 55 Q15 50 15 35 L15 20 Q20 10 25 20Z' fill='%23FFD700' stroke='%23C9A227' stroke-width='2'/%3E%3Cpath d='M55 20 Q60 10 65 15 L65 35 Q65 50 55 55 Q45 50 45 35 L45 20 Q50 10 55 20Z' fill='%23FFD700' stroke='%23C9A227' stroke-width='2'/%3E%3Ccircle cx='25' cy='58' r='4' fill='%23C9A227'/%3E%3Ccircle cx='55' cy='58' r='4' fill='%23C9A227'/%3E%3Cpath d='M35 15 Q40 5 45 15' fill='none' stroke='%23C9A227' stroke-width='2'/%3E%3C/svg%3E",
		tags: ["bells", "wedding", "gold", "celebration"],
		width: 80,
		height: 80,
	},
	{
		id: "wedding-dove-pair",
		name: "Dove Pair",
		category: "wedding",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3E%3Cellipse cx='30' cy='30' rx='18' ry='10' fill='%23fff' stroke='%23ccc' stroke-width='1'/%3E%3Cellipse cx='45' cy='26' rx='8' ry='5' fill='%23fff' stroke='%23ccc' stroke-width='1'/%3E%3Ccircle cx='22' cy='28' r='2' fill='%23333'/%3E%3Cpath d='M16 30 L10 32 L16 34' fill='%23ffa500'/%3E%3Cellipse cx='70' cy='30' rx='18' ry='10' fill='%23fff' stroke='%23ccc' stroke-width='1' transform='scale(-1,1) translate(-140,0)'/%3E%3Cellipse cx='55' cy='26' rx='8' ry='5' fill='%23fff' stroke='%23ccc' stroke-width='1' transform='scale(-1,1) translate(-110,0)'/%3E%3Ccircle cx='78' cy='28' r='2' fill='%23333'/%3E%3Cpath d='M84 30 L90 32 L84 34' fill='%23ffa500'/%3E%3Cpath d='M45 20 Q50 10 55 20' fill='none' stroke='%23ffb6c1' stroke-width='2'/%3E%3C/svg%3E",
		tags: ["dove", "wedding", "peace", "love", "birds"],
		width: 100,
		height: 60,
	},

	// ===== DOUBLE HAPPINESS =====
	{
		id: "double-happiness-classic",
		name: "Classic 囍",
		category: "double-happiness",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext x='50' y='75' font-size='70' fill='%23cc0000' text-anchor='middle' font-family='serif'%3E囍%3C/text%3E%3C/svg%3E",
		tags: ["囍", "double happiness", "chinese", "wedding", "red"],
		width: 100,
		height: 100,
	},
	{
		id: "double-happiness-gold",
		name: "Golden 囍",
		category: "double-happiness",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext x='50' y='75' font-size='70' fill='%23FFD700' stroke='%23C9A227' stroke-width='1' text-anchor='middle' font-family='serif'%3E囍%3C/text%3E%3C/svg%3E",
		tags: ["囍", "double happiness", "chinese", "wedding", "gold"],
		width: 100,
		height: 100,
	},
	{
		id: "double-happiness-circle",
		name: "Circular 囍",
		category: "double-happiness",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='none' stroke='%23cc0000' stroke-width='3'/%3E%3Ctext x='50' y='68' font-size='50' fill='%23cc0000' text-anchor='middle' font-family='serif'%3E囍%3C/text%3E%3C/svg%3E",
		tags: ["囍", "double happiness", "chinese", "wedding", "circle"],
		width: 100,
		height: 100,
	},
	{
		id: "double-happiness-ornate",
		name: "Ornate 囍",
		category: "double-happiness",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 100'%3E%3Crect x='10' y='10' width='100' height='80' fill='none' stroke='%23cc0000' stroke-width='2' rx='5'/%3E%3Crect x='15' y='15' width='90' height='70' fill='none' stroke='%23cc0000' stroke-width='1' rx='3'/%3E%3Ctext x='60' y='68' font-size='45' fill='%23cc0000' text-anchor='middle' font-family='serif'%3E囍%3C/text%3E%3C/svg%3E",
		tags: ["囍", "double happiness", "chinese", "wedding", "ornate", "frame"],
		width: 120,
		height: 100,
	},

	// ===== BOUQUETS =====
	{
		id: "bouquet-rose",
		name: "Rose Bouquet",
		category: "bouquets",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 100'%3E%3Crect x='35' y='60' width='10' height='30' fill='%238b4513'/%3E%3Cpath d='M30 65 L40 90 L50 65' fill='%23228b22'/%3E%3Ccircle cx='40' cy='35' r='12' fill='%23ff69b4'/%3E%3Ccircle cx='30' cy='42' r='10' fill='%23db7093'/%3E%3Ccircle cx='50' cy='42' r='10' fill='%23ffb6c1'/%3E%3Ccircle cx='35' cy='25' r='8' fill='%23ff1493'/%3E%3Ccircle cx='45' cy='22' r='7' fill='%23db7093'/%3E%3Ccircle cx='40' cy='45' r='8' fill='%23ff69b4'/%3E%3C/svg%3E",
		tags: ["bouquet", "rose", "flower", "pink", "wedding", "floral"],
		width: 80,
		height: 100,
	},
	{
		id: "bouquet-peony",
		name: "Peony Bouquet",
		category: "bouquets",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 110'%3E%3Crect x='40' y='70' width='10' height='30' fill='%238b4513'/%3E%3Cellipse cx='45' cy='40' rx='25' ry='30' fill='%23ffb6c1'/%3E%3Cellipse cx='45' cy='35' rx='18' ry='22' fill='%23ffc0cb'/%3E%3Cellipse cx='45' cy='32' rx='12' ry='15' fill='%23fff0f5'/%3E%3Cellipse cx='35' cy='50' rx='12' ry='15' fill='%23ffb6c1'/%3E%3Cellipse cx='55' cy='50' rx='12' ry='15' fill='%23ffb6c1'/%3E%3C/svg%3E",
		tags: ["bouquet", "peony", "flower", "pink", "wedding", "floral"],
		width: 90,
		height: 110,
	},
	{
		id: "bouquet-white",
		name: "White Bouquet",
		category: "bouquets",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 100'%3E%3Crect x='35' y='60' width='10' height='30' fill='%238b4513'/%3E%3Ccircle cx='40' cy='35' r='12' fill='%23fff'/%3E%3Ccircle cx='28' cy='40' r='10' fill='%23f5f5f5'/%3E%3Ccircle cx='52' cy='40' r='10' fill='%23fffff0'/%3E%3Ccircle cx='34' cy='25' r='9' fill='%23fff'/%3E%3Ccircle cx='46' cy='28' r='8' fill='%23f5f5f5'/%3E%3Ccircle cx='40' cy='48' r='8' fill='%23fff'/%3E%3Cellipse cx='25' cy='50' rx='6' ry='10' fill='%23228b22'/%3E%3Cellipse cx='55' cy='50' rx='6' ry='10' fill='%23228b22'/%3E%3C/svg%3E",
		tags: ["bouquet", "white", "flower", "elegant", "wedding", "floral"],
		width: 80,
		height: 100,
	},
	{
		id: "bouquet-mixed",
		name: "Mixed Bouquet",
		category: "bouquets",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Crect x='45' y='75' width='10' height='35' fill='%238b4513'/%3E%3Ccircle cx='50' cy='40' r='14' fill='%23ff69b4'/%3E%3Ccircle cx='35' cy='48' r='11' fill='%23e6e6fa'/%3E%3Ccircle cx='65' cy='48' r='11' fill='%23fffacd'/%3E%3Ccircle cx='40' cy='30' r='10' fill='%23fff'/%3E%3Ccircle cx='60' cy='32' r='9' fill='%23ffb6c1'/%3E%3Ccircle cx='50' cy='55' r='10' fill='%23dda0dd'/%3E%3Ccircle cx='30' cy='58' r='8' fill='%2398fb98'/%3E%3Ccircle cx='70' cy='58' r='8' fill='%2390ee90'/%3E%3C/svg%3E",
		tags: ["bouquet", "mixed", "flower", "colorful", "wedding", "floral"],
		width: 100,
		height: 120,
	},
	{
		id: "bouquet-lavender",
		name: "Lavender Bouquet",
		category: "bouquets",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 120'%3E%3Crect x='35' y='80' width='10' height='30' fill='%238b4513'/%3E%3Cg fill='%23e6e6fa'%3E%3Cellipse cx='35' cy='30' rx='5' ry='25'/%3E%3Cellipse cx='45' cy='35' rx='5' ry='28'/%3E%3Cellipse cx='40' cy='25' rx='5' ry='22'/%3E%3Cellipse cx='50' cy='40' rx='4' ry='20'/%3E%3Cellipse cx='30' cy='38' rx='4' ry='22'/%3E%3C/g%3E%3Cg fill='%23228b22'%3E%3Cpath d='M35 55 L35 80'/%3E%3Cpath d='M45 60 L45 80'/%3E%3C/g%3E%3C/svg%3E",
		tags: ["bouquet", "lavender", "flower", "purple", "wedding", "floral"],
		width: 80,
		height: 120,
	},

	// ===== FLOWERS (expanded) =====
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
		id: "flower-sunflower",
		name: "Sunflower",
		category: "flowers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cg fill='%23FFD700'%3E%3Cellipse cx='32' cy='16' rx='6' ry='12'/%3E%3Cellipse cx='32' cy='48' rx='6' ry='12'/%3E%3Cellipse cx='16' cy='32' rx='12' ry='6'/%3E%3Cellipse cx='48' cy='32' rx='12' ry='6'/%3E%3Cellipse cx='20' cy='20' rx='5' ry='10' transform='rotate(-45 20 20)'/%3E%3Cellipse cx='44' cy='20' rx='5' ry='10' transform='rotate(45 44 20)'/%3E%3Cellipse cx='20' cy='44' rx='5' ry='10' transform='rotate(45 20 44)'/%3E%3Cellipse cx='44' cy='44' rx='5' ry='10' transform='rotate(-45 44 44)'/%3E%3C/g%3E%3Ccircle cx='32' cy='32' r='10' fill='%238B4513'/%3E%3C/svg%3E",
		tags: ["sunflower", "yellow", "bright", "flower"],
		width: 80,
		height: 80,
	},

	// ===== FRAMES (expanded) =====
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
	{
		id: "frame-double",
		name: "Double Frame",
		category: "frames",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='5' y='5' width='90' height='90' fill='none' stroke='%23c9a227' stroke-width='2'/%3E%3Crect x='12' y='12' width='76' height='76' fill='none' stroke='%23c9a227' stroke-width='1'/%3E%3C/svg%3E",
		tags: ["frame", "double", "gold", "elegant", "border"],
		width: 200,
		height: 200,
	},
	{
		id: "frame-floral",
		name: "Floral Frame",
		category: "frames",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect x='15' y='15' width='90' height='90' fill='none' stroke='%23c9a227' stroke-width='2' rx='5'/%3E%3Ccircle cx='15' cy='15' r='8' fill='%23ffb6c1'/%3E%3Ccircle cx='105' cy='15' r='8' fill='%23ffb6c1'/%3E%3Ccircle cx='15' cy='105' r='8' fill='%23ffb6c1'/%3E%3Ccircle cx='105' cy='105' r='8' fill='%23ffb6c1'/%3E%3Ccircle cx='60' cy='10' r='6' fill='%23db7093'/%3E%3Ccircle cx='60' cy='110' r='6' fill='%23db7093'/%3E%3C/svg%3E",
		tags: ["frame", "floral", "flowers", "pink", "border", "elegant"],
		width: 200,
		height: 200,
	},

	// ===== DIVIDERS =====
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
	{
		id: "divider-hearts",
		name: "Hearts Divider",
		category: "dividers",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 30'%3E%3Cline x1='10' y1='15' x2='70' y2='15' stroke='%23c9a227' stroke-width='1'/%3E%3Cpath d='M100 25 C95 20 85 15 85 10 C85 5 90 2 95 5 L100 10 L105 5 C110 2 115 5 115 10 C115 15 105 20 100 25Z' fill='%23db7093'/%3E%3Cline x1='130' y1='15' x2='190' y2='15' stroke='%23c9a227' stroke-width='1'/%3E%3C/svg%3E",
		tags: ["divider", "heart", "love", "romantic", "separator"],
		width: 200,
		height: 30,
	},

	// ===== ICONS =====
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
	{
		id: "icon-calendar",
		name: "Calendar",
		category: "icons",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='8' y='12' width='48' height='44' fill='%23fff' stroke='%23c9a227' stroke-width='2' rx='4'/%3E%3Crect x='8' y='12' width='48' height='12' fill='%23c9a227' rx='4'/%3E%3Crect x='16' y='6' width='4' height='12' fill='%23c9a227' rx='1'/%3E%3Crect x='44' y='6' width='4' height='12' fill='%23c9a227' rx='1'/%3E%3Ctext x='32' y='46' font-size='16' fill='%23c9a227' text-anchor='middle' font-family='serif'%3E14%3C/text%3E%3C/svg%3E",
		tags: ["calendar", "date", "event", "wedding"],
		width: 60,
		height: 60,
	},

	// ===== SHAPES =====
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
	{
		id: "shape-hexagon",
		name: "Hexagon",
		category: "shapes",
		src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpolygon points='32,4 58,18 58,46 32,60 6,46 6,18' fill='%23c9a227' opacity='0.3'/%3E%3C/svg%3E",
		tags: ["hexagon", "shape", "geometric"],
		width: 80,
		height: 80,
	},
];

/**
 * Get assets filtered by category
 */
export function getAssetsByCategory(
	category: AssetCategory,
): AssetDefinition[] {
	if (category === "all") {
		return ASSETS_LIBRARY;
	}
	return ASSETS_LIBRARY.filter((asset) => asset.category === category);
}

/**
 * Search assets by query string
 */
export function searchAssets(
	query: string,
	category?: AssetCategory,
): AssetDefinition[] {
	const assets =
		category && category !== "all"
			? getAssetsByCategory(category)
			: ASSETS_LIBRARY;

	if (!query.trim()) {
		return assets;
	}

	const lowerQuery = query.toLowerCase();
	return assets.filter((asset) => {
		const matchesName = asset.name.toLowerCase().includes(lowerQuery);
		const matchesTags = asset.tags.some((tag) =>
			tag.toLowerCase().includes(lowerQuery),
		);
		return matchesName || matchesTags;
	});
}

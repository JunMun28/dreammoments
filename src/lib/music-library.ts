/**
 * Music library for background audio
 * Contains royalty-free and pre-licensed tracks for wedding invitations
 * Curated for Singapore/Malaysia Chinese weddings
 */

export type MusicCategory =
	| "romantic"
	| "chinese-classics"
	| "chinese-modern"
	| "instrumental"
	| "contemporary";

export interface MusicTrack {
	id: string;
	title: string;
	titleChinese?: string; // Chinese title if applicable
	artist: string;
	category: MusicCategory;
	duration: number; // in seconds
	url: string;
	previewUrl?: string;
}

/**
 * Curated music library for wedding invitations
 * These are placeholder URLs - in production, replace with actual licensed tracks
 */
export const musicLibrary: MusicTrack[] = [
	// Romantic (English classics)
	{
		id: "romantic-1",
		title: "Perfect",
		artist: "Wedding Ensemble",
		category: "romantic",
		duration: 263,
		url: "/music/romantic-1.mp3",
	},
	{
		id: "romantic-2",
		title: "A Thousand Years",
		artist: "Love Orchestra",
		category: "romantic",
		duration: 285,
		url: "/music/romantic-2.mp3",
	},
	{
		id: "romantic-3",
		title: "Marry Me",
		artist: "Wedding Strings",
		category: "romantic",
		duration: 228,
		url: "/music/romantic-3.mp3",
	},
	{
		id: "romantic-4",
		title: "Can't Help Falling In Love",
		artist: "Romantic Covers",
		category: "romantic",
		duration: 180,
		url: "/music/romantic-4.mp3",
	},
	{
		id: "romantic-5",
		title: "All of Me",
		artist: "Piano Love",
		category: "romantic",
		duration: 270,
		url: "/music/romantic-5.mp3",
	},

	// Chinese Classics (经典华语)
	{
		id: "chinese-classic-1",
		title: "The Moon Represents My Heart",
		titleChinese: "月亮代表我的心",
		artist: "Chinese Classics Ensemble",
		category: "chinese-classics",
		duration: 210,
		url: "/music/chinese-classic-1.mp3",
	},
	{
		id: "chinese-classic-2",
		title: "Sweet As Honey",
		titleChinese: "甜蜜蜜",
		artist: "Nostalgic Melodies",
		category: "chinese-classics",
		duration: 195,
		url: "/music/chinese-classic-2.mp3",
	},
	{
		id: "chinese-classic-3",
		title: "Today You Will Marry Me",
		titleChinese: "今天你要嫁给我",
		artist: "Wedding Duet",
		category: "chinese-classics",
		duration: 240,
		url: "/music/chinese-classic-3.mp3",
	},
	{
		id: "chinese-classic-4",
		title: "Love You Ten Thousand Years",
		titleChinese: "爱你一万年",
		artist: "Eternal Love Orchestra",
		category: "chinese-classics",
		duration: 225,
		url: "/music/chinese-classic-4.mp3",
	},
	{
		id: "chinese-classic-5",
		title: "I Only Care About You",
		titleChinese: "我只在乎你",
		artist: "Romantic Classics",
		category: "chinese-classics",
		duration: 260,
		url: "/music/chinese-classic-5.mp3",
	},

	// Chinese Modern (现代华语)
	{
		id: "chinese-modern-1",
		title: "A Little Happiness",
		titleChinese: "小幸运",
		artist: "Modern Romance",
		category: "chinese-modern",
		duration: 293,
		url: "/music/chinese-modern-1.mp3",
	},
	{
		id: "chinese-modern-2",
		title: "Love Confession",
		titleChinese: "告白气球",
		artist: "Contemporary Chinese",
		category: "chinese-modern",
		duration: 215,
		url: "/music/chinese-modern-2.mp3",
	},
	{
		id: "chinese-modern-3",
		title: "Give Me A Reason To Forget",
		titleChinese: "给我一个理由忘记",
		artist: "Ballad Collection",
		category: "chinese-modern",
		duration: 280,
		url: "/music/chinese-modern-3.mp3",
	},
	{
		id: "chinese-modern-4",
		title: "Suddenly Miss You So Much",
		titleChinese: "突然好想你",
		artist: "Rock Ballads",
		category: "chinese-modern",
		duration: 325,
		url: "/music/chinese-modern-4.mp3",
	},

	// Instrumental (纯音乐)
	{
		id: "instrumental-1",
		title: "Canon in D",
		artist: "Classical Wedding",
		category: "instrumental",
		duration: 330,
		url: "/music/instrumental-1.mp3",
	},
	{
		id: "instrumental-2",
		title: "River Flows in You",
		artist: "Piano Dreams",
		category: "instrumental",
		duration: 195,
		url: "/music/instrumental-2.mp3",
	},
	{
		id: "instrumental-3",
		title: "Wedding March",
		artist: "Orchestra Classics",
		category: "instrumental",
		duration: 300,
		url: "/music/instrumental-3.mp3",
	},
	{
		id: "instrumental-4",
		title: "Butterfly Lovers",
		titleChinese: "梁祝",
		artist: "Chinese Instrumental",
		category: "instrumental",
		duration: 420,
		url: "/music/instrumental-4.mp3",
	},
	{
		id: "instrumental-5",
		title: "Spring River Flower Moon Night",
		titleChinese: "春江花月夜",
		artist: "Traditional Chinese Orchestra",
		category: "instrumental",
		duration: 360,
		url: "/music/instrumental-5.mp3",
	},

	// Contemporary (当代流行)
	{
		id: "contemporary-1",
		title: "Beautiful in White",
		artist: "Contemporary Romance",
		category: "contemporary",
		duration: 230,
		url: "/music/contemporary-1.mp3",
	},
	{
		id: "contemporary-2",
		title: "Thinking Out Loud",
		artist: "Modern Acoustic",
		category: "contemporary",
		duration: 281,
		url: "/music/contemporary-2.mp3",
	},
	{
		id: "contemporary-3",
		title: "Make You Feel My Love",
		artist: "Soulful Covers",
		category: "contemporary",
		duration: 210,
		url: "/music/contemporary-3.mp3",
	},
	{
		id: "contemporary-4",
		title: "At Last",
		artist: "Jazz Classics",
		category: "contemporary",
		duration: 180,
		url: "/music/contemporary-4.mp3",
	},
];

/**
 * Get all tracks by category
 */
export function getTracksByCategory(category: MusicCategory): MusicTrack[] {
	return musicLibrary.filter((track) => track.category === category);
}

/**
 * Get track by ID
 */
export function getTrackById(id: string): MusicTrack | undefined {
	return musicLibrary.find((track) => track.id === id);
}

/**
 * Get all categories
 */
export function getAllCategories(): MusicCategory[] {
	return [
		"romantic",
		"chinese-classics",
		"chinese-modern",
		"instrumental",
		"contemporary",
	];
}

/**
 * Format duration as MM:SS
 */
export function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Category display names (English + Chinese)
 */
export const categoryNames: Record<MusicCategory, string> = {
	romantic: "Romantic",
	"chinese-classics": "Chinese Classics 经典华语",
	"chinese-modern": "Chinese Modern 现代华语",
	instrumental: "Instrumental 纯音乐",
	contemporary: "Contemporary",
};

/**
 * Get display title for a track (with Chinese title if available)
 */
export function getTrackDisplayTitle(track: MusicTrack): string {
	if (track.titleChinese) {
		return `${track.title} (${track.titleChinese})`;
	}
	return track.title;
}

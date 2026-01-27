/**
 * Chinese Traditional (中国风) Templates
 * Red/gold themes, Double Happiness, phoenix/dragon motifs
 */

import type { TemplateData } from "../template-data";

/**
 * Default preview data for Chinese traditional templates
 */
const defaultPreview = {
  partner1Name: "Mei Lin",
  partner2Name: "Wei Jun",
  weddingDate: new Date("2026-10-10"),
  weddingTime: "17:00",
  venueName: "Grand Hyatt Singapore",
  venueAddress: "10 Scotts Road, Singapore 228211",
  scheduleBlocks: [
    {
      id: "ct-1",
      title: "Tea Ceremony",
      time: "14:00",
      description: "Traditional blessing with family",
      order: 0,
    },
    {
      id: "ct-2",
      title: "Wedding Ceremony",
      time: "17:00",
      description: "Exchange of vows",
      order: 1,
    },
    {
      id: "ct-3",
      title: "Banquet Dinner",
      time: "19:00",
      description: "Eight-course celebration dinner",
      order: 2,
    },
  ],
  notes: [
    {
      id: "ct-n1",
      title: "Dress Code",
      description: "Formal attire. Red is encouraged for good fortune!",
      order: 0,
    },
    {
      id: "ct-n2",
      title: "红包 / Ang Bao",
      description:
        "Your presence is our greatest gift. A wishing well will be available.",
      order: 1,
    },
  ],
};

/**
 * Chinese Traditional templates collection
 */
export const chineseTraditionalTemplates: TemplateData[] = [
  {
    id: "golden-happiness",
    name: "Golden Happiness 金囍",
    description:
      "Traditional Chinese wedding design with red background, double happiness symbol, and gold accents",
    accentColor: "#d4af37",
    backgroundColor: "#8B1538",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    decorativeElements: {
      sparkles: false,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    preview: defaultPreview,
  },
  {
    id: "sparkling-celebration",
    name: "Sparkling Celebration 金光闪耀",
    description:
      "Same as Golden Happiness but with sparkle particle animation for extra elegance",
    accentColor: "#d4af37",
    backgroundColor: "#8B1538",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    decorativeElements: {
      sparkles: true,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    preview: defaultPreview,
  },
  {
    id: "crimson-blessings",
    name: "Crimson Blessings 喜庆红",
    description: "Luxurious design with gold accents and elegant flourishes",
    accentColor: "#d4af37",
    backgroundColor: "#5c1a1b",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    decorativeElements: {
      sparkles: true,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    galleryImages: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
        caption: "Our first dance",
        order: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
        caption: "Forever begins",
        order: 1,
      },
    ],
    preview: defaultPreview,
  },
  {
    id: "golden-phoenix",
    name: "Golden Phoenix 金凤凰",
    description: "Majestic phoenix motif with imperial gold tones",
    accentColor: "#ffd700",
    backgroundColor: "#8b0000",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80",
    decorativeElements: {
      sparkles: true,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    preview: {
      ...defaultPreview,
      partner1Name: "Li Hua",
      partner2Name: "Chen Wei",
    },
  },
  {
    id: "jade-garden",
    name: "Jade Garden 翠玉园",
    description: "Elegant jade green with gold accents",
    accentColor: "#d4af37",
    backgroundColor: "#0a3d2e",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80",
    decorativeElements: {
      sparkles: false,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    preview: {
      ...defaultPreview,
      partner1Name: "Yu Xin",
      partner2Name: "Ming Hao",
    },
  },
  {
    id: "imperial-palace",
    name: "Imperial Palace 故宫红",
    description: "Royal vermillion red inspired by Chinese palace architecture",
    accentColor: "#c9a227",
    backgroundColor: "#b22222",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80",
    decorativeElements: {
      sparkles: true,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    preview: {
      ...defaultPreview,
      partner1Name: "Xiao Ling",
      partner2Name: "Jian Feng",
    },
  },
  {
    id: "peony-blush",
    name: "Peony Blush 牡丹红",
    description: "Soft red with peony-inspired accents",
    accentColor: "#f8b4b4",
    backgroundColor: "#c41e3a",
    fontPairing: "classic-romance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1200&q=80",
    decorativeElements: {
      sparkles: true,
      doubleHappiness: false,
      borderStyle: "flourish",
    },
    preview: {
      ...defaultPreview,
      partner1Name: "Hui Wen",
      partner2Name: "Zi Yang",
    },
  },
  {
    id: "mandarin-duck",
    name: "Mandarin Duck 鸳鸯戏水",
    description: "Traditional mandarin duck symbolism for love and fidelity",
    accentColor: "#ffc107",
    backgroundColor: "#6b0f1a",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80",
    decorativeElements: {
      sparkles: false,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    preview: {
      ...defaultPreview,
      partner1Name: "Shu Ting",
      partner2Name: "Kai Ming",
    },
  },
  {
    id: "modern-chinese",
    name: "Modern Chinese 新中式",
    description: "Contemporary take on Chinese wedding aesthetics",
    accentColor: "#e6b89c",
    backgroundColor: "#2c1810",
    fontPairing: "modern-sans",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=80",
    decorativeElements: {
      sparkles: false,
      doubleHappiness: true,
      borderStyle: "geometric",
    },
    preview: {
      ...defaultPreview,
      partner1Name: "Jia Yi",
      partner2Name: "Hao Ran",
    },
  },
  {
    id: "lantern-festival",
    name: "Lantern Festival 喜灯笼",
    description: "Festive lantern-inspired design with warm glow",
    accentColor: "#ff6b35",
    backgroundColor: "#4a0000",
    fontPairing: "oriental-elegance",
    themeVariant: "dark",
    heroImageUrl:
      "https://images.unsplash.com/photo-1493106819501-66d381c466f1?w=1200&q=80",
    decorativeElements: {
      sparkles: true,
      doubleHappiness: true,
      borderStyle: "flourish",
    },
    preview: {
      ...defaultPreview,
      partner1Name: "Xin Yi",
      partner2Name: "Jun Hao",
    },
  },
];

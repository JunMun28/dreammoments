#!/usr/bin/env node
/**
 * Reads all SuperDesign prompts from /superdesign/ and generates
 * wedding TemplateConfig files in /src/templates/superdesign/
 */
import fs from "fs";
import path from "path";

const SUPERDESIGN_DIR = path.resolve("superdesign");
const OUTPUT_DIR = path.resolve("src/templates/superdesign");

// Ensure output dir exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Read all prompt files
const files = fs.readdirSync(SUPERDESIGN_DIR).filter((f) => f.endsWith(".md"));
console.log(`Found ${files.length} prompts`);

// ── Helpers ──────────────────────────────────────────────────────────
function extractHexColors(text) {
  const matches = text.match(/#[0-9A-Fa-f]{6}\b/g) || [];
  return [...new Set(matches)];
}

function extractFontNames(text) {
  // Match 'Font Name' or "Font Name" patterns, also font-family style mentions
  const patterns = [
    /['"]([A-Z][A-Za-z\s]+?)['"](?:\s*(?:for|as|,|\(|font))/gi,
    /font[- ]family:\s*['"]?([A-Z][A-Za-z\s]+?)['"]?[,;)]/gi,
    /Headings?\s+(?:in|:)\s*['"]?([A-Z][A-Za-z\s]+?)['"]?[\s,(.]/gi,
    /Body\s+(?:in|text|:)\s*['"]?([A-Z][A-Za-z\s]+?)['"]?[\s,(.]/gi,
    /Display:\s*['"]?([A-Z][A-Za-z\s]+?)['"]?[,;]/gi,
  ];

  const fonts = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const font = match[1].trim();
      if (
        font.length > 2 &&
        font.length < 30 &&
        !font.match(
          /^(The|This|For|And|Not|Use|All|Each|Its|Set|Any|Has|Get|CSS|DOM|HTML|SVG|RGB|HSL|URL|Max|Min|Font|Bold|Thin|Size|Left|Right|Full|Pure|Dark|Warm|With|Back|Deep|Rich|Soft|Hero|Body|Main|Base|Note|High|Core|Very|Flat)$/i
        )
      ) {
        fonts.add(font);
      }
    }
  }

  // Also try explicit patterns
  const explicit = [
    /['"]([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}(?:\s(?:SC|TC|Sans|Serif|Mono|Pro|Display|Grotesk|Variable))?)['"]/g,
  ];
  for (const pattern of explicit) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const font = match[1].trim();
      if (isLikelyFont(font)) {
        fonts.add(font);
      }
    }
  }

  return [...fonts];
}

const KNOWN_FONTS = new Set([
  "Inter",
  "Space Grotesk",
  "Clash Display",
  "Satoshi",
  "JetBrains Mono",
  "Playfair Display",
  "Montserrat",
  "DM Sans",
  "DM Serif Display",
  "DM Mono",
  "Poppins",
  "Manrope",
  "Syne",
  "Cabinet Grotesk",
  "General Sans",
  "Switzer",
  "Outfit",
  "Plus Jakarta Sans",
  "Work Sans",
  "Archivo",
  "Archivo Black",
  "Bebas Neue",
  "Oswald",
  "Raleway",
  "Lato",
  "Roboto",
  "Roboto Mono",
  "Source Code Pro",
  "Fira Code",
  "IBM Plex Sans",
  "IBM Plex Mono",
  "Noto Sans SC",
  "Noto Serif SC",
  "Source Han Sans",
  "Source Han Serif",
  "Cormorant Garamond",
  "Lora",
  "Merriweather",
  "Crimson Text",
  "Libre Baskerville",
  "Fraunces",
  "Space Mono",
  "Geist",
  "Geist Mono",
  "Cal Sans",
  "Bricolage Grotesque",
  "Instrument Serif",
  "PP Neue Montreal",
  "Neue Haas Grotesk",
  "Helvetica Neue",
  "SF Pro Display",
  "SF Pro Text",
  "SF Mono",
  "Suisse Intl",
  "Graphik",
  "Founders Grotesk",
  "Söhne",
  "Aeonik",
  "Rethink Sans",
  "Unbounded",
  "Lexend",
  "Chakra Petch",
  "Orbitron",
  "Exo",
  "Tektur",
  "ZTNature",
  "GeneralSans",
  "Styrene",
  "Styrene A",
  "Object Sans",
  "Monument Extended",
  "Cirka",
  "Migra",
  "Editorial New",
  "GT Walsheim",
  "Neurial Grotesk",
  "HK Grotesk",
  "Hanken Grotesk",
  "Red Hat Display",
  "Red Hat Text",
  "Familjen Grotesk",
  "Gabarito",
  "Onest",
  "Figtree",
  "Wix Madefor",
  "Aspekta",
  "Zodiak",
  "Gambetta",
  "Sentient",
  "Boska",
  "Erode",
  "Ranade",
  "Synonym",
  "Chillax",
  "Clash Grotesk",
  "Tanker",
  "Nippo",
  "Array",
  "Telma",
  "Quilon",
  "Alpino",
  "Bespoke Serif",
  "Bespoke Sans",
  "Bespoke Slab",
  "Bespoke Stencil",
  "Melodrama",
  "Technor",
  "Supreme",
  "Stardom",
  "Plein",
  "Pilcrow Rounded",
  "Neco",
  "Khand",
  "Newsreader",
  "Literata",
  "Spectral",
  "Vollkorn",
  "Petrona",
  "Eczar",
  "Bitter",
]);

function isLikelyFont(name) {
  if (KNOWN_FONTS.has(name)) return true;
  if (
    name.match(
      /(Sans|Serif|Mono|Display|Grotesk|Grotesque|Gothic|Variable|Pro|Text|Extended|Condensed)$/i
    )
  )
    return true;
  return false;
}

function classifyColor(hex) {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return {
    hex,
    brightness,
    isDark: brightness < 50,
    isLight: brightness > 200,
    isMidtone: brightness >= 50 && brightness <= 200,
    isVibrant:
      Math.max(r, g, b) - Math.min(r, g, b) > 100 && brightness > 30,
  };
}

function pickColors(colors, text) {
  if (colors.length === 0) {
    return {
      primary: "#C4727F",
      secondary: "#2C2420",
      accent: "#C5A880",
      background: "#FDF8F5",
      text: "#2C2420",
      muted: "#8A7F7A",
    };
  }

  const classified = colors.map(classifyColor);
  const darks = classified.filter((c) => c.isDark);
  const lights = classified.filter((c) => c.isLight);
  const vibrants = classified.filter((c) => c.isVibrant);
  const midtones = classified.filter((c) => c.isMidtone);

  // Determine if dark or light theme
  const isDarkTheme =
    text.toLowerCase().includes("dark") ||
    text.toLowerCase().includes("black background") ||
    text.toLowerCase().includes("noir") ||
    text.toLowerCase().includes("midnight") ||
    (darks.length > lights.length && vibrants.length > 0);

  let bg, textColor, primary, secondary, accent, muted;

  if (isDarkTheme) {
    bg = darks[0]?.hex || "#0a0a0a";
    // Text color should be light and NOT vibrant
    textColor = lights.find((c) => !c.isVibrant)?.hex || lights[0]?.hex || "#e5e5e5";
    primary = vibrants[0]?.hex || midtones[0]?.hex || "#C4727F";
    secondary = darks[1]?.hex || darks[0]?.hex || "#1a1a1a";
    accent = vibrants[1]?.hex || vibrants[0]?.hex || primary;
    muted = midtones.find((c) => !c.isVibrant)?.hex || "#888888";
  } else {
    bg = lights[0]?.hex || "#FDF8F5";
    textColor = darks[0]?.hex || "#1a1a1a";
    primary = vibrants[0]?.hex || midtones[0]?.hex || "#C4727F";
    secondary = darks[1]?.hex || darks[0]?.hex || "#2C2420";
    accent =
      vibrants[1]?.hex ||
      midtones.find((c) => c.isVibrant)?.hex ||
      "#C5A880";
    muted = midtones.find((c) => !c.isVibrant)?.hex || "#8A7F7A";
  }

  return { primary, secondary, accent, background: bg, text: textColor, muted };
}

function pickFonts(fonts, text) {
  // Try to identify heading vs body fonts from text context
  let heading = null;
  let body = null;
  let accent = null;

  // Check text for heading/body associations
  const headingMatch = text.match(
    /[Hh]eadings?\s*(?:in|:)\s*['"]?([A-Z][A-Za-z\s]+?)['"]?[\s,(.]/
  );
  const bodyMatch = text.match(
    /[Bb]ody\s*(?:text|in|:)\s*['"]?([A-Z][A-Za-z\s]+?)['"]?[\s,(.]/
  );

  if (headingMatch && isLikelyFont(headingMatch[1].trim()))
    heading = headingMatch[1].trim();
  if (bodyMatch && isLikelyFont(bodyMatch[1].trim()))
    body = bodyMatch[1].trim();

  // Fill from extracted fonts
  for (const f of fonts) {
    if (!heading && isLikelyFont(f)) {
      heading = f;
      continue;
    }
    if (!body && isLikelyFont(f) && f !== heading) {
      body = f;
      continue;
    }
    if (!accent && isLikelyFont(f) && f !== heading && f !== body) {
      accent = f;
    }
  }

  heading = heading || "Inter";
  body = body || "Inter";
  accent = accent || heading;

  const fmt = (f) => {
    if (f.includes(" ")) return `'${f}', 'Noto Sans SC', system-ui, sans-serif`;
    return `'${f}', 'Noto Sans SC', system-ui, sans-serif`;
  };

  return {
    headingFont: fmt(heading),
    bodyFont: fmt(body),
    accentFont: fmt(accent),
  };
}

function slugToCamelCase(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function slugToPascalCase(slug) {
  const camel = slugToCamelCase(slug);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// Chinese wedding-themed names for styles
function generateWeddingName(title, description) {
  // Map style keywords to wedding-appropriate names
  const nameMap = {
    brutalist: { en: "Bold Vows", zh: "铿锵誓言" },
    editorial: { en: "Elegant Script", zh: "雅致篇章" },
    cinematic: { en: "Silver Screen Love", zh: "光影之恋" },
    noir: { en: "Midnight Romance", zh: "暮夜情缘" },
    glassmorphism: { en: "Crystal Dreams", zh: "水晶之梦" },
    nature: { en: "Garden Bliss", zh: "花园之约" },
    organic: { en: "Natural Grace", zh: "自然之美" },
    luxury: { en: "Grand Affair", zh: "华丽盛典" },
    minimal: { en: "Pure Love", zh: "纯粹之爱" },
    neon: { en: "Electric Hearts", zh: "霓虹之心" },
    retro: { en: "Vintage Love", zh: "复古情怀" },
    bauhaus: { en: "Geometric Love", zh: "几何之恋" },
    swiss: { en: "Precision Love", zh: "精致之爱" },
    modern: { en: "Modern Vows", zh: "摩登誓约" },
    dark: { en: "Dark Elegance", zh: "暗夜优雅" },
    warm: { en: "Warm Embrace", zh: "温暖拥抱" },
    red: { en: "Crimson Promise", zh: "赤色承诺" },
    blue: { en: "Azure Dreams", zh: "蔚蓝之梦" },
    gold: { en: "Golden Hour", zh: "金色时光" },
    fluid: { en: "Flowing Love", zh: "流光溢彩" },
    tech: { en: "Digital Union", zh: "数字之约" },
    futuristic: { en: "Future Together", zh: "未来之约" },
    grunge: { en: "Raw Romance", zh: "率性之恋" },
    playful: { en: "Joyful Union", zh: "欢乐之约" },
    kinetic: { en: "Dynamic Love", zh: "灵动之恋" },
    sketch: { en: "Hand Drawn Love", zh: "手绘之恋" },
    monochrome: { en: "Timeless Duo", zh: "永恒二重奏" },
    terminal: { en: "Code of Love", zh: "爱的代码" },
    flat: { en: "Simple Joy", zh: "简约之喜" },
    material: { en: "Tangible Love", zh: "触感之爱" },
    clay: { en: "Soft Touch", zh: "柔软之触" },
    neumorphism: { en: "Gentle Depth", zh: "温柔深度" },
    news: { en: "Love Headlines", zh: "爱的头条" },
    print: { en: "Love Headlines", zh: "爱的头条" },
    chrome: { en: "Polished Love", zh: "璀璨之恋" },
    liquid: { en: "Flowing Vows", zh: "流动誓言" },
    tectonic: { en: "Bedrock Love", zh: "磐石之恋" },
    blueprint: { en: "Love Blueprint", zh: "爱的蓝图" },
    collage: { en: "Memory Mosaic", zh: "记忆拼图" },
    mosaic: { en: "Love Mosaic", zh: "爱的马赛克" },
    neural: { en: "Connected Souls", zh: "心灵相通" },
    synapse: { en: "Connected Hearts", zh: "心心相连" },
    cyber: { en: "Digital Romance", zh: "数码情缘" },
    velocity: { en: "Swift Love", zh: "飞速之恋" },
    architectural: { en: "Structured Love", zh: "建筑之恋" },
    wellness: { en: "Serene Union", zh: "静谧之约" },
    saas: { en: "Smart Love", zh: "智慧之爱" },
    ecommerce: { en: "Curated Love", zh: "策划之恋" },
    countdown: { en: "Love Countdown", zh: "爱的倒计时" },
    waitlist: { en: "Awaited Love", zh: "期待之爱" },
    sunset: { en: "Sunset Vows", zh: "日落誓言" },
    sun: { en: "Sunrise Love", zh: "朝阳之恋" },
    disruptor: { en: "Bold Hearts", zh: "无畏之心" },
    capture: { en: "Captured Hearts", zh: "心动瞬间" },
  };

  const lower = (title + " " + description).toLowerCase();
  for (const [key, value] of Object.entries(nameMap)) {
    if (lower.includes(key)) return value;
  }

  return { en: "Love Story", zh: "爱的故事" };
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes("chinese") ||
    lower.includes("traditional") ||
    lower.includes("classical")
  )
    return "chinese";
  if (
    lower.includes("nature") ||
    lower.includes("botanical") ||
    lower.includes("garden") ||
    lower.includes("organic")
  )
    return "garden";
  if (
    lower.includes("western") ||
    lower.includes("luxury") ||
    lower.includes("editorial")
  )
    return "western";
  return "modern";
}

function detectEasing(text) {
  const match = text.match(/cubic-bezier\(([^)]+)\)/);
  if (match) return `cubic-bezier(${match[1]})`;
  if (text.toLowerCase().includes("ease-in-out")) return "easeInOut";
  if (text.toLowerCase().includes("ease-out")) return "easeOut";
  return "easeOutCubic";
}

function detectDuration(text) {
  const match = text.match(/(\d+)ms/);
  if (match) {
    const ms = Number.parseInt(match[1]);
    if (ms > 100 && ms < 3000) return ms / 1000;
  }
  if (
    text.toLowerCase().includes("slow") ||
    text.toLowerCase().includes("cinematic")
  )
    return 0.8;
  if (
    text.toLowerCase().includes("fast") ||
    text.toLowerCase().includes("snappy")
  )
    return 0.3;
  return 0.6;
}

// ── Shared wedding sections ─────────────────────────────────────────
const WEDDING_SECTIONS = `[
		{
			id: "hero",
			type: "hero",
			defaultVisible: true,
			notes: "",
			fields: [
				{ id: "partnerOneName", label: "Partner one name", type: "text", sample: "Emily", required: true },
				{ id: "partnerTwoName", label: "Partner two name", type: "text", sample: "James", required: true },
				{ id: "tagline", label: "Tagline", type: "text", aiTaskType: "tagline", sample: "Where love blooms eternal" },
				{ id: "heroImageUrl", label: "Hero photo", type: "image" },
				{ id: "livingPortrait", label: "Living Portrait", type: "living-portrait" },
			],
		},
		{
			id: "couple",
			type: "couple",
			defaultVisible: true,
			notes: "",
			fields: [
				{ id: "partnerOne.fullName", label: "Partner one full name", type: "text", sample: "Emily" },
				{ id: "partnerTwo.fullName", label: "Partner two full name", type: "text", sample: "James" },
				{ id: "partnerOne.bio", label: "Partner one bio", type: "textarea", sample: "Loves nature walks, watercolour painting, and Sunday brunch." },
				{ id: "partnerTwo.bio", label: "Partner two bio", type: "textarea", sample: "An adventurer at heart who finds peace in the garden." },
				{ id: "partnerOne.photoUrl", label: "Partner one photo", type: "image" },
				{ id: "partnerTwo.photoUrl", label: "Partner two photo", type: "image" },
			],
		},
		{
			id: "story",
			type: "story",
			defaultVisible: true,
			notes: "",
			fields: [{ id: "milestones", label: "Story milestones", type: "list" }],
		},
		{
			id: "gallery",
			type: "gallery",
			defaultVisible: true,
			notes: "",
			fields: [{ id: "photos", label: "Gallery photos", type: "list" }],
		},
		{
			id: "countdown",
			type: "countdown",
			defaultVisible: true,
			notes: "",
			fields: [],
		},
		{
			id: "schedule",
			type: "schedule",
			defaultVisible: true,
			notes: "",
			fields: [{ id: "events", label: "Schedule events", type: "list" }],
		},
		{
			id: "venue",
			type: "venue",
			defaultVisible: true,
			notes: "",
			fields: [
				{ id: "name", label: "Venue name", type: "text", sample: "The Glasshouse at Botanical Gardens" },
				{ id: "address", label: "Venue address", type: "textarea", sample: "1 Cluny Road, Singapore 259569" },
				{ id: "coordinates", label: "Venue coordinates (lat,lng)", type: "text" },
			],
		},
		{
			id: "rsvp",
			type: "rsvp",
			defaultVisible: true,
			notes: "",
			fields: [
				{ id: "deadline", label: "RSVP deadline", type: "date" },
				{ id: "allowPlusOnes", label: "Allow plus ones", type: "toggle" },
				{ id: "maxPlusOnes", label: "Max plus ones", type: "text" },
			],
		},
		{
			id: "gift",
			type: "gift",
			defaultVisible: false,
			notes: "",
			fields: [
				{ id: "paymentUrl", label: "Payment URL", type: "text" },
				{ id: "paymentMethod", label: "Payment method", type: "text", sample: "paynow" },
				{ id: "recipientName", label: "Recipient name", type: "text" },
			],
		},
		{
			id: "footer",
			type: "footer",
			defaultVisible: true,
			notes: "",
			fields: [{ id: "message", label: "Footer message", type: "text", sample: "Thank you for being part of our story." }],
		},
	]`;

// ── Generate templates ──────────────────────────────────────────────
const allConfigs = [];

for (const file of files) {
  const slug = file.replace(".md", "");
  const content = fs.readFileSync(path.join(SUPERDESIGN_DIR, file), "utf8");

  // Extract first ~2000 chars of style section for parsing
  const styleSection = content.substring(0, 4000);
  const title = content.match(/^# (.+)$/m)?.[1] || slug;

  const colors = extractHexColors(styleSection);
  const fonts = extractFontNames(styleSection);
  const colorTokens = pickColors(colors, styleSection);
  const fontTokens = pickFonts(fonts, styleSection);
  const weddingName = generateWeddingName(title, styleSection);
  const category = detectCategory(styleSection);
  const easing = detectEasing(styleSection);
  const duration = detectDuration(styleSection);

  const varName = `${slugToCamelCase(slug)}Template`;
  // Extract description - skip XML tags and markdown headers
  let description = "";
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("<") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("|") &&
      trimmed.length > 20
    ) {
      description = trimmed.substring(0, 120).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      break;
    }
  }
  description = description || title;

  const configCode = `import type { TemplateConfig } from "../types";

export const ${varName}: TemplateConfig = {
	id: "sd-${slug}",
	name: "${weddingName.en}",
	nameZh: "${weddingName.zh}",
	description: "${description}",
	category: "${category}",
	version: "1.0.0",
	aiConfig: {
		defaultTone: "romantic",
		culturalContext: "chinese",
	},
	tokens: {
		colors: {
			primary: "${colorTokens.primary}",
			secondary: "${colorTokens.secondary}",
			accent: "${colorTokens.accent}",
			background: "${colorTokens.background}",
			text: "${colorTokens.text}",
			muted: "${colorTokens.muted}",
		},
		typography: {
			headingFont: "${fontTokens.headingFont}",
			bodyFont: "${fontTokens.bodyFont}",
			accentFont: "${fontTokens.accentFont}",
		},
		animations: {
			scrollTriggerOffset: 100,
			defaultDuration: ${duration},
			easing: "${easing}",
		},
	},
	sections: ${WEDDING_SECTIONS},
};
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.ts`), configCode);
  allConfigs.push({ slug, varName, title });
}

// ── Generate index file ─────────────────────────────────────────────
const imports = allConfigs
  .map((c) => `import { ${c.varName} } from "./${c.slug}";`)
  .join("\n");

const exportList = allConfigs.map((c) => `\t${c.varName},`).join("\n");

const indexCode = `${imports}

export const superdesignTemplates = [
${exportList}
];

export {
${exportList}
};
`;

fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexCode);

console.log(`Generated ${allConfigs.length} template configs in ${OUTPUT_DIR}`);
console.log(`Generated index.ts with all exports`);

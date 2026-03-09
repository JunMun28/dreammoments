# Tectonic style

<design-system>\
Design Style: Tectonic Stone (Digital Geology & Obsidian Minimalism)\
Design Philosophy\
Core Concept: Carved, Not Built\
The Tectonic Stone style rejects the "lightness" of modern web design. Instead of cards floating on top of a background, the UI is treated as a single monolithic block of mineral that has been quarried and carved. It uses the visual language of basalt, obsidian, and raw granite.\
Core Tenets:\
The Tectonic Grid: Layouts are not based on flexible boxes, but on "plates." These plates overlap like shifting earth, with visible "fault lines" (cracks) acting as section dividers.\
Material Weight: Elements should feel heavy. There is no transparency or "glass." Everything is solid, opaque, and has a physical thud.\
The "Magma" Core: Since the palette is primarily dark and mineral-based, the only "light" comes from within the "earth." Accents are styled as glowing lava, embers, or veins of gold running through the stone.\
Engraved Typography: Text should look like it has been chiseled or etched into the surface, using inner shadows and high-contrast letterforms.\
Brutal Permanence: No soft rounded corners. We use raw-cut edges, 45-degree chamfers, and "broken stone" textures.\
The Vibe:\
Monolithic & Authoritative: It feels immovable and permanent.\
Ancient-Futurism: Like a high-tech civilization built inside a volcanic cavern.\
Tactile & Cold: You can almost feel the temperature of the obsidian and the grit of the granite.\
Design Token System (The DNA)\
Colors (The "Mineral" Palette)\
The Stone (Backgrounds & Surfaces):\
Obsidian: #050505 (Deep, polished black with a slight mirror finish).\
Basalt: #1A1C1E (Dark, textured gray).\
Granite: #2D3033 (Rough-cut, lighter gray for secondary panels).\
The "Veins" (Accents):\
Magma Glow: #FF4800 (A high-intensity orange-red for primary CTAs).\
Gilded Gold: #D4AF37 (For high-end labels and borders).\
Ash White: #E0E0E0 (Chiselled text color).\
Typography\
Primary Heading: "Cormorant Garamond" (Google Fonts) for a sophisticated "engraved" look, or "Cinzel" for a Roman-stone feel.\
Body Text: "Inter" or "Space Grotesk" (Regular or Medium weight) to maintain technical legibility.\
Effects:\
text-shadow: 1px 1px 0px rgba(255,255,255,0.1), -1px -1px 0px rgba(0,0,0,0.5) to create an "etched" depth.\
Textures & Patterns\
Raw Grain: A heavy, "stony" noise filter applied to all backgrounds (12% opacity).\
Basalt Columns: Background patterns using repeating vertical hexagons to simulate volcanic basalt formations.\
Fault Lines: Section dividers are 1px irregular, jagged lines that look like cracks in rock rather than straight CSS borders.\
Component Stylings

1. The "Monolith" Plate (Card)\
   Base Styles: bg-basalt with a heavy box-shadow: 20px 20px 40px rgba(0,0,0,0.8).\
   The Cut: Top-right corner uses a clip-path for a 45-degree chamfered edge.\
   Border: A 1px solid border on the top and left only, styled in Ash White at 10% opacity to catch "overhead light."
2. The "Magma" Button\
   Default: bg-obsidian with a 2px border-magma-glow.\
   Hover: shadow-[inset_0_0_20px_rgba(255,72,0,0.4)]. It should look like heat is building up inside the stone.\
   Interaction: On click, the button color "brightens" instantly as if the stone has reached its melting point.

"Fault-Line" Divider\
Instead of hr, use an SVG path that is slightly "broken" and jagged.\
Style: stroke-ash-white with 20% opacity.\
Animation & Motion\
The "Thud": Elements don't fade in; they "drop" into place with a slight screen shake (camera-shake animation).\
Tectonic Shift: On scroll, sections move at slightly different speeds (parallax), mimicking the movement of tectonic plates.\
Bioluminescent Pulse: Buttons and status indicators have a very slow, deep-orange pulse (animate-pulse), like cooling lava.\
Timing: Use transition-[all] duration-700 cubic-bezier(0.22, 1, 0.36, 1) for heavy, deliberate movement.\
Non-Genericness (The "Bold" Factor)\
Engraved Headers: Large display text uses a linear-gradient that makes the top of the letters look darker than the bottom, simulating depth in a carved surface.\
Mineral Accents: Use high-resolution photos of obsidian or marble as "masks" for large typography (background-clip: text).\
Monolithic Footer: A footer that takes up 50% of the screen height, styled as a single, massive block of granite with minimal, tiny white text.\
Topographic Maps: Subtle background overlays of topographic elevation lines in magma-glow at 5% opacity.\
Dos and Don'ts\
DO make everything look thick and heavy.\
DO use asymmetry (overlapping blocks).\
DO use high-contrast lighting (bright highlights on sharp stone edges).\
DON'T use rounded corners (rounded-none is your default).\
DON'T use smooth, "modern" gradients. Use grainy, gritty textures.\
DON'T use fast, bouncy animations. Everything must feel like it has immense mass.\
</design-system>
# Warm Industrial Gray Style

# Summary

An industrial-chic design system centered on structural grids, warm gray tones, and high-impact editorial typography with technical 'readout' accents.

# Style

The style is defined by its 'Warm Industrial' palette (#EBEBE8 background) and technical precision. It uses 'Inter' for structural UI and 'Playfair Display' for editorial flair. Animation is characterized by smooth, high-inertia transitions (cubic-bezier(0.16, 1, 0.3, 1)) and clip-path reveals. A constant 4% opacity fractal noise overlay provides a tactile, analog feel to the digital interface.

## Spec

Apply a 'Warm Industrial' aesthetic. Colors: Background #EBEBE8, Foreground #18181B, Accent Blue #0066FF, Borders #D4D4D8 (Zinc-300). Typography: Primary font 'Inter' (weights 400, 700, 900), Secondary font 'Playfair Display' (Italic, weight 400). Use 10px bold uppercase tracking (0.2em - 0.3em) for all labels and small UI elements. Hero headings should be 8xl to 10xl (128px-160px) with -0.05em tracking. Implement a global noise texture overlay using a fractal noise SVG at 0.04 opacity. Borders should be 1px solid Zinc-300. Use a 12-column structural grid marked by thin vertical lines across the entire page height. Interactive elements should use a custom cubic-bezier(0.16, 1, 0.3, 1) timing function for all transforms and clip-paths.

# Layout & Structure

The layout is built on a rigid 12-column grid system, where sections are divided by explicit 1px horizontal and vertical lines. It follows a vertical stack of high-impact sections: Navigation -> Split Hero -> Marquee -> Interactive Project List -> Philosophical Parallax -> Technical Journal -> Massive Footer.

## Structural Grid

Create a fixed, full-page background layer consisting of 12 vertical grid lines (#18181B at 0.1 opacity) evenly spaced across a max-width of 1600px, centered. These lines should persist behind all content.

## Sticky Header

Height: 80px. Background: #EBEBE8 at 0.8 opacity with 10px backdrop-blur. 1px bottom border. Layout: Left-aligned nav links (tiny caps), absolute centered logo (Serif Italic 'SUPER' + Bold Sans 'DESIGN'), right-aligned CTA button (rounded-full, 1px border, 10px caps).

## Hero Section

Split 12-column layout. Left (7 cols): Vertical stack with 'Available' status indicator, massive 3-line heading using stroke-text and serif italics, technical readout labels (10px mono), and a large rectangular 'Start' button with a hover-rotating arrow icon. Right (5 cols): Full-height grayscale image with a 20px internal frame and a glassmorphism UI card overlay containing 'system status' bars and mono identifiers.

## Marquee Ticker

Full-width ribbon, height 120px, bg #F4F4F5. Content: Rapidly scrolling text in 7xl font, alternating between heavy sans-serif stroke-text and italic serif text, separated by electric blue (#0066FF) star icons.

## Project List

Vertical stack of rows. Each row: 300px height, 1px border-bottom. On hover, the text shifts to italic and a large grayscale image is revealed from the right using a clip-path animation (inset 0 0 0 100% to 0 0 0 0). A floating 'View' circle with an arrow follows the cursor or appears on the right.

## Footer

Background #18181B, Text #EBEBE8. Large-scale contact link (4xl) with a bottom-border hover effect. Bottom contains a massive 'background marquee' at 0.1 opacity with text sized at 20vw. Final row includes a green 'System Operational' pulse indicator and copyright text in 10px tracking.

# Special Components

## Stroke Text Effect

High-impact display text that uses thin outlines instead of solid fills.

Implement text with `-webkit-text-stroke: 1px #18181B; color: transparent;`. This should be used for massive headings to create visual lightness despite large scale.

## Clip-Path Project Reveal

An image reveal interaction for list items.

Project images should be hidden by default using `clip-path: inset(0 0 0 100%)`. On parent row hover, transition to `clip-path: inset(0 0 0 0)` over 0.6s using cubic-bezier(0.16, 1, 0.3, 1). Add a grayscale(1) filter to the image with a subtle #0066FF/20 mix-blend-multiply overlay.

## Status Pulse

A technical 'live' indicator.

Create a 6px circle with background #22C55E (Green-500) and an outer pulse animation using `box-shadow` or `scale` to indicate real-time availability or system status.

# Special Notes

MUST: Maintain the #EBEBE8 background color throughout to preserve the 'warm industrial' feel. MUST: Use strict grid alignment—text and boxes should align perfectly with the 12-column background lines. DO NOT: Use rounded corners on anything except the main CTA buttons and small status badges; keep the layout sharp and rectangular. MUST: Keep the noise texture visible but subtle to avoid making the UI look 'dirty'.
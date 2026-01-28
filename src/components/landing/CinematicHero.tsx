import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoubleHappiness } from "@/components/ui/double-happiness";
import { SparkleEffect } from "@/components/ui/sparkle-effect";

/**
 * CinematicHero - Full-viewport hero section featuring Crimson Blessings aesthetics.
 * Deep burgundy background with gradient, gold sparkles, and Double Happiness symbol.
 */
export function CinematicHero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#5c1a1b]">
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center top, #7a2829 0%, #5c1a1b 50%, #3d1112 100%)",
        }}
        aria-hidden="true"
      />

      {/* Double Happiness watermark */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center">
        <DoubleHappiness size={500} color="#d4af37" opacity={0.08} />
      </div>

      {/* Sparkle effect overlay */}
      <SparkleEffect count={35} color="#d4af37" className="z-[2]" />

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        {/* Eyebrow text */}
        <p
          className="mb-4 text-sm uppercase tracking-[0.3em] text-[#d4af37]/80"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Where Dreams Meet Tradition
        </p>

        {/* Main headline */}
        <h1
          className="mb-6 text-4xl font-light leading-tight tracking-wide text-white md:text-6xl lg:text-7xl"
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          Celebrate Love,
          <br />
          <span className="gold-shimmer-text">Honor Tradition</span>
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Create a wedding invitation that weaves together your unique story
          with timeless elegance. Every detail, beautifully crafted.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="min-w-[200px] border-2 border-[#d4af37] bg-[#d4af37] text-[#5c1a1b] shadow-lg shadow-[#d4af37]/30 transition-all hover:bg-[#e5c048] hover:shadow-xl hover:shadow-[#d4af37]/40"
            asChild
          >
            <Link to="/templates">
              <Sparkles className="mr-2 h-5 w-5" />
              Begin Your Story
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[200px] border-[#d4af37]/50 bg-transparent text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/10"
            asChild
          >
            <a href="#showcase">Explore the Design</a>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg
          className="h-6 w-6 text-[#d4af37]/60"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

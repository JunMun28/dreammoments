import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  categoryDisplayNames,
  getCategories,
  getTemplatesByCategory,
  type TemplateCategory,
  type TemplateData,
} from "@/lib/template-data";

export const Route = createFileRoute("/templates/")({
  component: TemplatesPage,
});

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
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(category)}
        >
          {categoryDisplayNames[category]}
        </Button>
      ))}
    </div>
  );
}

/**
 * Templates page - full page for browsing and selecting templates
 */
function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>("all");

  const templates = getTemplatesByCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#d4af37]/20 bg-[#faf8f5]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to home</span>
              </Link>
            </Button>
            <div>
              <h1
                className="text-2xl font-light text-[#5c1a1b]"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                Choose Your Template
              </h1>
              <p className="text-sm text-stone-600">
                Select a template to start creating your wedding invitation
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Category filter */}
        <div className="mb-8">
          <CategoryTabs
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-500">
              No templates found in this category.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

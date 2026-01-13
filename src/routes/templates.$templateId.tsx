import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { TemplatePreview } from "@/components/TemplatePreview";
import { Button } from "@/components/ui/button";
import {
	type ViewportMode,
	ViewportToggle,
} from "@/components/ui/viewport-toggle";
import { getTemplateById } from "@/lib/template-data";

export const Route = createFileRoute("/templates/$templateId")({
	component: TemplatePreviewPage,
	loader: ({ params }) => {
		const template = getTemplateById(params.templateId);
		if (!template) {
			throw notFound();
		}
		return { template };
	},
	notFoundComponent: TemplateNotFound,
});

function TemplateNotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 px-6">
			<Heart className="mb-6 h-12 w-12 text-rose-300" />
			<h1 className="mb-4 text-2xl font-light text-stone-800">
				Template Not Found
			</h1>
			<p className="mb-8 text-stone-600">
				The template you're looking for doesn't exist.
			</p>
			<Button variant="outline" asChild>
				<Link to="/">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Templates
				</Link>
			</Button>
		</div>
	);
}

function TemplatePreviewPage() {
	const { template } = Route.useLoaderData();
	const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");

	const { preview } = template;

	return (
		<div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 px-6 py-4 backdrop-blur-md">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link to="/">
								<ArrowLeft className="mr-2 h-4 w-4" />
								All Templates
							</Link>
						</Button>
						<div className="h-6 w-px bg-stone-200" />
						<div>
							<h1 className="font-medium text-stone-800">{template.name}</h1>
							<p className="text-xs text-stone-500">{template.description}</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<ViewportToggle value={viewportMode} onChange={setViewportMode} />
						<Button
							className="bg-rose-500 text-white shadow-md hover:bg-rose-600"
							asChild
						>
							<Link to="/login" search={{ template: template.id }}>
								<Sparkles className="mr-2 h-4 w-4" />
								Use This Template
							</Link>
						</Button>
					</div>
				</div>
			</header>

			{/* Preview */}
			<main className="px-6 py-12">
				<div className="mx-auto max-w-4xl">
					<TemplatePreview
						partner1Name={preview.partner1Name}
						partner2Name={preview.partner2Name}
						weddingDate={preview.weddingDate}
						weddingTime={preview.weddingTime}
						venueName={preview.venueName}
						venueAddress={preview.venueAddress}
						scheduleBlocks={preview.scheduleBlocks}
						notes={preview.notes}
						accentColor={template.accentColor}
						fontPairing={template.fontPairing}
						viewportMode={viewportMode}
					/>
				</div>
			</main>

			{/* Footer CTA */}
			<footer className="border-t border-stone-200 bg-white/50 px-6 py-8">
				<div className="mx-auto max-w-4xl text-center">
					<p className="mb-4 text-stone-600">
						Love this template? Sign in to start customizing.
					</p>
					<Button
						size="lg"
						className="bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600"
						asChild
					>
						<Link to="/login" search={{ template: template.id }}>
							<Sparkles className="mr-2 h-5 w-5" />
							Get Started with {template.name}
						</Link>
					</Button>
				</div>
			</footer>
		</div>
	);
}

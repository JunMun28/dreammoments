import { GallerySection } from "@/components/GallerySection";
import { HeroImageSection } from "@/components/HeroImageSection";

/**
 * Properties panel header component
 */
function PanelHeader({ title }: { title: string }) {
	return (
		<div className="border-b bg-stone-50 px-4 py-3">
			<h3 className="font-semibold text-stone-800">{title}</h3>
		</div>
	);
}

/**
 * Image properties panel.
 * Includes hero image upload and photo gallery management.
 */
export function ImageProperties() {
	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Images" />

			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				{/* Hero Image */}
				<div className="space-y-4">
					<h4 className="text-sm font-medium text-stone-700">Hero Image</h4>
					<p className="text-xs text-stone-500">
						The main image displayed at the top of your invitation.
					</p>
					<HeroImageSection />
				</div>

				{/* Gallery */}
				<div className="space-y-4">
					<h4 className="text-sm font-medium text-stone-700">Photo Gallery</h4>
					<p className="text-xs text-stone-500">
						Add photos to create a beautiful gallery section.
					</p>
					<GallerySection />
				</div>
			</div>
		</div>
	);
}

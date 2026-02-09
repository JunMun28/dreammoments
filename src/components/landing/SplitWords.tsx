import { cn } from "@/lib/utils";

interface SplitWordsProps {
	children: string;
	className?: string;
	as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Utility component for word-level GSAP animation.
 *
 * Wraps each word in `<span data-word style="display: inline-block">`
 * and preserves inter-word spaces with `<span>&nbsp;</span>` nodes.
 *
 * Usage: pair with GSAP `gsap.utils.toArray('[data-word]')` inside a
 * ScrollTrigger to stagger word-by-word reveals.
 */
export function SplitWords({
	children,
	className,
	as: Tag = "span",
}: SplitWordsProps) {
	const words = children.split(" ");

	return (
		<Tag className={cn(className)}>
			{words.map((word, i) => (
				<span key={`${word}-${i}`}>
					<span data-word="" style={{ display: "inline-block" }}>
						{word}
					</span>
					{i < words.length - 1 && <span>&nbsp;</span>}
				</span>
			))}
		</Tag>
	);
}

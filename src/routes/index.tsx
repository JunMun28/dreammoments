import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/page";

export const Route = createFileRoute("/")({
	head: () => ({
		links: [
			{
				rel: "preload",
				as: "image",
				href: "/photos/landing/hero-bg.jpg",
			},
		],
	}),
	component: LandingPage,
});

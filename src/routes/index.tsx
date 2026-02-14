import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/page";

export const Route = createFileRoute("/")({
	head: () => ({
		links: [
			{
				rel: "preload",
				as: "image",
				href: "/img/mock-project1.webp",
			},
		],
	}),
	component: LandingPage,
});

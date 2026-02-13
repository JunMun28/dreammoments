import { createFileRoute } from "@tanstack/react-router";
import { AgencyLandingPage } from "@/components/agency-landing/page";

export const Route = createFileRoute("/")({
	component: AgencyLandingPage,
});

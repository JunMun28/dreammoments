import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import ShareModal from "../components/share/ShareModal";

type MockLinkProps = ComponentPropsWithoutRef<"a"> & { children?: ReactNode };

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, ...props }: MockLinkProps) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}));

describe("share modal", () => {
	test("renders share link", () => {
		const markup = renderToString(
			<ShareModal
				open
				invitation={{
					id: "inv-1",
					userId: "user-1",
					slug: "sarah-michael",
					title: "Sarah & Michael",
					templateId: "love-at-dusk",
					templateVersion: "1.0.0",
					content: {
						hero: {
							partnerOneName: "Sarah",
							partnerTwoName: "Michael",
							tagline: "Two hearts",
							date: "2025-06-15",
						},
						announcement: { title: "", message: "", formalText: "" },
						couple: {
							partnerOne: { fullName: "", bio: "" },
							partnerTwo: { fullName: "", bio: "" },
						},
						story: { milestones: [] },
						gallery: { photos: [] },
						schedule: { events: [] },
						venue: {
							name: "",
							address: "",
							coordinates: { lat: 0, lng: 0 },
							directions: "",
						},
						entourage: { members: [] },
						registry: { title: "", note: "" },
						rsvp: {
							deadline: "",
							allowPlusOnes: false,
							maxPlusOnes: 0,
							dietaryOptions: [],
							customMessage: "",
						},
						faq: { items: [] },
						footer: { message: "" },
						details: { scheduleSummary: "", venueSummary: "" },
						calendar: { dateLabel: "", message: "" },
						countdown: { targetDate: "" },
					},
					sectionVisibility: {},
					designOverrides: {},
					status: "draft",
					aiGenerationsUsed: 0,
					invitedCount: 0,
					createdAt: "",
					updatedAt: "",
				}}
				onClose={() => {}}
			/>,
		);
		expect(markup).toContain("sarah-michael");
	});
});
